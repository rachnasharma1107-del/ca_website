import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpVerifySchema } from "@/lib/validations/auth";
import { verifyOtpHash } from "@/lib/auth/otp";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit, getClientIp } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  const json = await request.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and code." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const verifyLimit = rateLimit(`otp-verify:${ip}:${email}`, 10, 15 * 60 * 1000);
  if (!verifyLimit.success) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code shortly." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: "This email is not registered for admin access." },
      { status: 403 }
    );
  }

  const otpRecord = await prisma.otpCode.findFirst({
    where: { userId: user.id, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return NextResponse.json(
      { error: "Code expired or not found. Please request a new one." },
      { status: 400 }
    );
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Please request a new code." },
      { status: 429 }
    );
  }

  const isValid = verifyOtpHash(code, email, otpRecord.codeHash);

  if (!isValid) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    await logAudit({
      action: "OTP_VERIFY_FAILED",
      actorType: "USER",
      actorId: user.id,
      ipAddress: ip,
    });
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  await logAudit({
    action: "LOGIN_SUCCESS",
    actorType: "USER",
    actorId: user.id,
    ipAddress: ip,
  });

  return NextResponse.json({ message: "Logged in successfully." });
}
