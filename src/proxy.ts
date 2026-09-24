import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "ca_session";
const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET || "");

/**
 * Edge-safe gate for /admin/* pages: verifies the JWT signature/expiry only.
 * This runs before every admin page render so unauthenticated users never
 * see admin UI shells. Full session validity (including server-side
 * revocation) is re-checked with the database on every API call via
 * `requireSession()`, so this middleware is a fast first line of defense,
 * not the sole authority.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return redirectToLogin(request);
    }

    try {
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch {
      return redirectToLogin(request);
    }
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
