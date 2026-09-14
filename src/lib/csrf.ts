import "server-only";
import type { NextRequest } from "next/server";

/**
 * Same-origin check for state-changing route handlers. Server Actions get this
 * from Next.js automatically; JSON endpoints need it explicitly.
 */
export function isSameOrigin(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return fetchSite === "same-origin" || fetchSite === "none" || !fetchSite;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
