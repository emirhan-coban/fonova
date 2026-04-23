import { NextResponse } from "next/server";
import { cancelInvestmentIntent } from "@/lib/services/investments";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "cancel-investment", { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Çok fazla iptal isteği. Lütfen bekleyin." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const params = await context.params;
  const result = await cancelInvestmentIntent({
    investmentId: params.id,
    investorEmail: "yatirimci@starthub.test"
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
