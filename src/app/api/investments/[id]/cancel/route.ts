import { NextResponse } from "next/server";
import { cancelInvestmentIntent } from "@/lib/services/investments";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const result = await cancelInvestmentIntent({
    investmentId: params.id,
    investorEmail: "yatirimci@starthub.test"
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
