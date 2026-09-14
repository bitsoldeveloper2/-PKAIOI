import { NextResponse, type NextRequest } from "next/server";

/**
 * Request proxy: per-request Content-Security-Policy nonce and an optimistic
 * sign-in redirect for authenticated areas. Real authorization happens in the
 * data access layer (`src/server/auth/dal.ts`); this only saves a round trip.
 */

const SESSION_COOKIE = "pioai_session";
const PROTECTED_PREFIXES = ["/campus", "/learn", "/studio", "/admin", "/enterprise/portal", "/account"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function buildCsp(nonce: string, isDev: boolean) {
  const directives = [
    "default-src 'self'",
    // Nonce-gated scripts. 'wasm-unsafe-eval' lets the self-hosted Pyodide runtime
    // instantiate WebAssembly; 'unsafe-eval' is only added in development for
    // React's source-mapped error overlay.
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
  ];
  if (!isDev) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isProtected(pathname) && !request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

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
      /*
       * Everything except API routes, Next internals, and static files with an
       * extension (fonts, images, the self-hosted Pyodide runtime, media).
       */
      source: "/((?!api/|_next/static|_next/image|.*\\..*).*)",
    },
  ],
};
