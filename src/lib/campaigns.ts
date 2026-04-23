import type { Campaign } from "@prisma/client";

export function campaignProgress(campaign: Pick<Campaign, "committedAmountKurus" | "targetAmountKurus">) {
  if (campaign.targetAmountKurus <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((campaign.committedAmountKurus / campaign.targetAmountKurus) * 100));
}

export function daysRemaining(endDate: Date, now = new Date()) {
  const diff = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isCoolingOffOpen(coolingOffEndsAt: Date, now = new Date()) {
  return coolingOffEndsAt.getTime() > now.getTime();
}

export function campaignCanCloseAsFunded(campaign: Pick<Campaign, "committedAmountKurus" | "targetAmountKurus">) {
  return campaign.committedAmountKurus >= campaign.targetAmountKurus;
}
