import { CampaignStatus, ComplianceStatus, ReviewDecision } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ServiceResult } from "./types";

export async function reviewCampaign(input: {
  campaignId: string;
  reviewerEmail: string;
  decision: ReviewDecision;
  note: string;
}): Promise<ServiceResult<{ campaignId: string }>> {
  const [campaign, reviewer] = await Promise.all([
    prisma.campaign.findUnique({ where: { id: input.campaignId } }),
    prisma.user.findUnique({ where: { email: input.reviewerEmail } })
  ]);

  if (!campaign) {
    return { ok: false, message: "Kampanya bulunamadi." };
  }

  if (!reviewer || reviewer.role !== "ADMIN") {
    return { ok: false, message: "Yönetim kullanıcısı bulunamadı." };
  }

  const now = new Date();
  const status =
    input.decision === ReviewDecision.APPROVED
      ? CampaignStatus.LIVE
      : input.decision === ReviewDecision.REJECTED
        ? CampaignStatus.CANCELLED
        : CampaignStatus.UNDER_REVIEW;

  await prisma.$transaction(async (tx) => {
    await tx.adminReview.create({
      data: {
        campaignId: campaign.id,
        reviewerId: reviewer.id,
        decision: input.decision,
        note: input.note.trim() || "Komite kararı demo panelinden kaydedildi."
      }
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: {
        status,
        approvedAt: input.decision === ReviewDecision.APPROVED ? now : campaign.approvedAt,
        publishedAt: input.decision === ReviewDecision.APPROVED ? now : campaign.publishedAt
      }
    });

    await tx.complianceCheck.create({
      data: {
        campaignId: campaign.id,
        userId: reviewer.id,
        type: "ADMIN_REVIEW",
        status: input.decision === ReviewDecision.APPROVED ? ComplianceStatus.PASSED : ComplianceStatus.REVIEW,
        code: input.decision === ReviewDecision.APPROVED ? "KOM00" : "KOM10",
        message: `Yönetim inceleme kararı: ${input.decision}`,
        metadata: JSON.stringify({ note: input.note })
      }
    });
  });

  return {
    ok: true,
    message: "Kampanya inceleme kararı kaydedildi.",
    data: { campaignId: campaign.id }
  };
}
