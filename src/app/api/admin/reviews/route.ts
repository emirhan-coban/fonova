import { ReviewDecision } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { reviewCampaign } from "@/lib/services/admin";

const schema = z.object({
  campaignId: z.string().min(1),
  decision: z.nativeEnum(ReviewDecision),
  note: z.string().max(1_000).default("")
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Yönetim kararı doğrulanamadı.",
        issues: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = await reviewCampaign({
    ...parsed.data,
    reviewerEmail: "admin@starthub.test"
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
