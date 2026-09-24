import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const secretKey = new TextEncoder().encode(env.SESSION_SECRET);

export interface SessionPayload {
  sub: string; // userId
  email: string;
  role: string;
  jti: string; // maps to Session.tokenHash (hashed)
}

function hashJti(jti: string): string {
  return createHash("sha256").update(jti).digest("hex");
}

/** Creates a DB session record + signed JWT, and sets the httpOnly cookie. */
export async function createSession(params: {
  userId: string;
  email: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_MINUTES * 60 * 1000);

  await prisma.session.create({
    data: {
      userId: params.userId,
      tokenHash: hashJti(jti),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      expiresAt,
    },
  });

  const token = await new SignJWT({
    email: params.email,
    role: params.role,
    jti,
  } satisfies Omit<SessionPayload, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(params.userId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Verifies the current request's session cookie against the JWT + DB record. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const sessionPayload = payload as unknown as SessionPayload;

    const dbSession = await prisma.session.findUnique({
      where: { tokenHash: hashJti(sessionPayload.jti) },
    });

    if (!dbSession || dbSession.revokedAt || dbSession.expiresAt < new Date()) {
      return null;
    }

    return sessionPayload;
  } catch {
    return null;
  }
}

/** Revokes the current session (logout) both in DB and by clearing the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.SESSION_COOKIE_NAME)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const sessionPayload = payload as unknown as SessionPayload;
      await prisma.session.updateMany({
        where: { tokenHash: hashJti(sessionPayload.jti) },
        data: { revokedAt: new Date() },
      });
    } catch {
      // token already invalid — nothing to revoke
    }
  }

  cookieStore.delete(env.SESSION_COOKIE_NAME);
}
