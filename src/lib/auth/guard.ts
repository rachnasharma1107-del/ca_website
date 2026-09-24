import "server-only";
import { getSession, type SessionPayload } from "@/lib/auth/session";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Throws UnauthorizedError if there is no valid, active session. Use in API routes. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}
