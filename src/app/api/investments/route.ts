import { NextResponse } from "next/server";
import { z } from "zod";
import { createInvestmentIntent } from "@/lib/services/investments";

const schema = z.object({
  campaignSlug: z.string().min(1),
  investorEmail: z.string().email().default("yatirimci@starthub.test"),
  amountKurus: z.number().int().positive()
});

export async function POST(request: Request) {
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
