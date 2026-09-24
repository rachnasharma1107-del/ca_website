import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { otpRequestSchema } from "@/lib/validations/auth";
import { generateOtp, hashOtp, otpExpiry } from "@/lib/auth/otp";
import { sendMail, otpEmailTemplate } from "@/lib/auth/mailer";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const json = await request.json().catch(() => null);
  const parsed = otpRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  // Rate limit per-IP and per-email to slow down enumeration/abuse.
  const ipLimit = rateLimit(`otp-req:ip:${ip}`, env.OTP_REQUEST_RATE_LIMIT, 60 * 60 * 1000);
  const emailLimit = rateLimit(`otp-req:email:${email}`, env.OTP_REQUEST_RATE_LIMIT, 60 * 60 * 1000);
  if (!ipLimit.success || !emailLimit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // SECURITY: only pre-seeded, active accounts may receive an OTP.
  // We still return a 200-shaped, non-committal response pattern is
  // intentionally NOT used here because the product requirement is an
  // explicit on-screen warning for unrecognized emails.
  if (!user || !user.isActive) {
    await logAudit({
      action: "OTP_REQUEST_REJECTED_UNKNOWN_EMAIL",
      actorType: "ANONYMOUS",
      metadata: { email },
      ipAddress: ip,
    });
    return NextResponse.json(
      {
        error:
          "This email is not registered for admin access. Please contact the site administrator if you believe this is a mistake.",
      },
      { status: 403 }
    );
  }

  const code = generateOtp();
  const codeHash = hashOtp(code, email);

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt: otpExpiry(),
      requestIp: ip,
    },
  });

  const { text, html } = otpEmailTemplate(code, env.OTP_TTL_MINUTES);
  const { delivered } = await sendMail({ to: email, subject: "Your login code", text, html });

  await logAudit({
    action: "OTP_REQUESTED",
    actorType: "USER",
    actorId: user.id,
    ipAddress: ip,
  });

  return NextResponse.json({
    message: delivered
      ? "A login code has been sent to your email."
      : "SMTP is not configured, so the code was not emailed — check your terminal for the logged code (development only).",
    ttlMinutes: env.OTP_TTL_MINUTES,
    // SAFETY: only ever included when SMTP isn't configured AND we're not in
    // production — lets you test the login flow locally without setting up
    // email. This can never leak in a real deployment: env validation plus
    // this explicit double-check both gate it.
    ...(!delivered && env.NODE_ENV !== "production" ? { devCode: code } : {}),
  });
}
