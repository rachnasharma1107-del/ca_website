import { randomInt, createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Generates a cryptographically secure numeric OTP of configured length. */
export function generateOtp(): string {
  const digits = env.OTP_LENGTH;
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return randomInt(min, max + 1).toString().padStart(digits, "0");
}

/**
 * OTPs are short-lived, high-entropy-adjacent secrets shared over email.
 * SHA-256 with a server-side pepper is sufficient here (unlike passwords,
 * which need slow hashing) because of the short TTL + attempt limiting.
 */
function pepper(): string {
  return env.SESSION_SECRET;
}

export function hashOtp(code: string, email: string): string {
  return createHash("sha256").update(`${pepper()}:${email.toLowerCase()}:${code}`).digest("hex");
}

export function verifyOtpHash(code: string, email: string, hash: string): boolean {
  const candidate = Buffer.from(hashOtp(code, email));
  const expected = Buffer.from(hash);
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
}
