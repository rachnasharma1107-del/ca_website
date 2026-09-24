import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma singleton. In dev, Next.js hot-reloads modules which would
 * otherwise spawn a new PrismaClient (and DB connection pool) on every
 * edit. We cache the instance on `globalThis` to prevent that, and to
 * avoid connection-pool exhaustion in serverless production too.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
