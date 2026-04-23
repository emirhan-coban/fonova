import { NextResponse } from "next/server";
import { z } from "zod";
import { createInvestmentIntent } from "@/lib/services/investments";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const schema = z.object({
  campaignSlug: z.string().min(1),
  investorEmail: z.string().email().default("yatirimci@starthub.test"),
  amountKurus: z.number().int().positive()
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "investments", { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Çok fazla yatırım isteği. Lütfen bekleyin." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Yatırım isteği doğrulanamadı.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = await createInvestmentIntent(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 201 : 422 });
}
