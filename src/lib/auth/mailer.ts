import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST) return null; // SMTP not configured — dev fallback mode
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail({ to, subject, html, text }: SendMailInput): Promise<{ delivered: boolean }> {
  const client = getTransporter();

  if (!client) {
    // Local development fallback — no SMTP configured. Never do this in prod;
    // env validation + this guard keep it explicit and visible in logs.
    console.warn(
      `\n[mailer] SMTP not configured — logging email instead of sending.\nTo: ${to}\nSubject: ${subject}\n${text}\n`
    );
    return { delivered: false };
  }

  await client.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
  return { delivered: true };
}

export function otpEmailTemplate(code: string, ttlMinutes: number) {
  const text = `Your Praveen Aggarwal & Co. login code is ${code}. It expires in ${ttlMinutes} minutes. If you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e5e5;border-radius:8px;">
      <h2 style="color:#0f2942;margin-bottom:8px;">Your login code</h2>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#0f2942;margin:16px 0;">${code}</p>
      <p style="color:#555;font-size:14px;">This code expires in ${ttlMinutes} minutes. If you did not request it, you can safely ignore this email.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
      <p style="color:#999;font-size:12px;">Praveen Aggarwal & Co., Chartered Accountants</p>
    </div>`;
  return { text, html };
}

export function enquiryNotificationTemplate(params: {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}) {
  const text = `New enquiry from ${params.name} (${params.email}${params.phone ? `, ${params.phone}` : ""})\nSubject: ${params.subject ?? "General"}\n\n${params.message}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2>New website enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(params.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
      ${params.phone ? `<p><strong>Phone:</strong> ${escapeHtml(params.phone)}</p>` : ""}
      <p><strong>Subject:</strong> ${escapeHtml(params.subject ?? "General")}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(params.message)}</p>
    </div>`;
  return { text, html };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
