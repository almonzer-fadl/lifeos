import { NextResponse } from "next/server";
import { rateLimit, DEFAULTS } from "@/lib/rate-limit";

export function checkRateLimit(
  request: Request,
  opts: { max: number; windowMs: number } = DEFAULTS.READ
) {
  const ip = request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const result = rateLimit(ip, opts);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(result.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
