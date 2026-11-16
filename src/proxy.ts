import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "herasat_session";

/**
 * - Strict, nonce-based Content-Security-Policy for every page (no external origins at all:
 *   the site must work on an intranet without Google/CDN services).
 * - Early redirect of anonymous visitors away from /dashboard (real authorization is enforced by Laravel).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // React/flowbite use inline style attributes
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    ...(process.env.CSP_UPGRADE_INSECURE === "true" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|sanctum|_next/static|_next/image|favicon.ico|favicon.svg|favicon-|apple-touch-icon|icon-192|icon-512|images|fonts).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
