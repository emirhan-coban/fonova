import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyInvestorKyc } from "@/lib/services/kyc";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const schema = z.object({
  investorEmail: z.string().email().default("yatirimci@starthub.test"),
  fullName: z.string().min(2),
  tcKimlikNo: z.string().length(11).regex(/^\d{11}$/, "TC Kimlik numarası 11 haneli olmalıdır.")
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "kyc-verify", { windowMs: 60_000, maxRequests: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Çok fazla KYC doğrulama isteği. Lütfen bekleyin." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "KYC doğrulama isteği geçersiz.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await verifyInvestorKyc(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
