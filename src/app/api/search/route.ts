import { NextResponse, type NextRequest } from "next/server";
import { searchSite } from "@/server/queries/search";
import { clientIp, LIMITS, rateLimit } from "@/server/rate-limit";

export async function GET(request: NextRequest) {
  const ip = await clientIp();
  const limit = rateLimit(`search:${ip}`, LIMITS.search);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const hits = await searchSite(q, 12);
  return NextResponse.json(
    { query: q.trim().slice(0, 80), hits },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
