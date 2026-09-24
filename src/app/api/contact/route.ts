import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { contactSchema } from "@/lib/validations/contact";
import { sendMail, enquiryNotificationTemplate } from "@/lib/auth/mailer";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit, getClientIp } from "@/lib/audit";

function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin requests (no Origin header) e.g. server-to-server/tests
  const trusted = env.TRUSTED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  return trusted.length === 0 || trusted.includes(origin);
}

export async function POST(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: "Request origin not allowed." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = rateLimit(`contact:${ip}`, env.CONTACT_RATE_LIMIT, 60 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for errors.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot triggered — silently accept without persisting to avoid
  // tipping off bots, but do not process further.
  if (parsed.data.hp_confirm_no_fill && parsed.data.hp_confirm_no_fill.trim().length > 0) {
    return NextResponse.json({ message: "Thank you for reaching out." });
  }

  const { name, email, phone, subject, message, serviceSlug } = parsed.data;

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      serviceSlug: serviceSlug || null,
      ipAddress: ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
    },
  });

  const { text, html } = enquiryNotificationTemplate({ name, email, phone, subject, message });
  await sendMail({
    to: env.ENQUIRY_NOTIFY_EMAIL,
    subject: `New enquiry: ${subject || "General enquiry"}`,
    text,
    html,
  }).catch((err) => {
    // Enquiry is already persisted; a notification failure shouldn't fail the request.
    console.error("[contact] failed to send notification email", err);
  });

  await logAudit({
    action: "ENQUIRY_SUBMITTED",
    actorType: "ANONYMOUS",
    targetId: enquiry.id,
    ipAddress: ip,
  });

  return NextResponse.json({ message: "Thank you — we'll be in touch shortly." }, { status: 201 });
}
