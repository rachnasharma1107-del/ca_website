import "server-only";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function logAudit(params: {
  action: string;
  actorType: "USER" | "SYSTEM" | "ANONYMOUS";
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        actorType: params.actorType,
        actorId: params.actorId,
        targetId: params.targetId,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
      },
    });
  } catch (err) {
    // Audit logging must never break the primary request flow.
    console.error("[audit] failed to write audit log", err);
  }
}

/** Extracts the client IP from standard proxy headers (Vercel/Nginx/etc). */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
