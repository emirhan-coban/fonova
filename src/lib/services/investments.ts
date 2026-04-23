import { CampaignStatus, ComplianceStatus, InvestmentStatus, KycStatus, LedgerEntryType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { mockEscrowAdapter, mockMkkAdapter } from "@/lib/adapters/mock";
import { checkCampaignCapacity, checkInvestorLimit, coolingOffDeadline } from "@/lib/compliance/engine";
import { isCoolingOffOpen } from "@/lib/campaigns";
import type { ServiceResult } from "./types";

export async function createInvestmentIntent(input: {
  campaignSlug: string;
  investorEmail: string;
  amountKurus: number;
}): Promise<ServiceResult<{ investmentId: string }>> {
  const [investor, campaign] = await Promise.all([
    prisma.user.findUnique({
      where: { email: input.investorEmail },
      include: { investorProfile: true }
    }),
    prisma.campaign.findUnique({
      where: { slug: input.campaignSlug }
    })
  ]);

  if (!investor || !investor.investorProfile) {
    return { ok: false, message: "Demo yatırımcı profili bulunamadı." };
  }

  if (!campaign) {
    return { ok: false, message: "Kampanya bulunamadi." };
  }

  if (campaign.status !== CampaignStatus.LIVE) {
    await prisma.complianceCheck.create({
      data: {
        userId: investor.id,
        campaignId: campaign.id,
        type: "CAMPAIGN_STATUS",
        status: ComplianceStatus.BLOCKED,
        code: "PRJ09",
        message: "Kampanya yatırıma açık değil.",
        metadata: JSON.stringify({ status: campaign.status })
      }
    });
    return { ok: false, message: "Bu kampanya şu anda yatırıma açık değil." };
  }

  if (investor.investorProfile.kycStatus !== KycStatus.VERIFIED) {
    await prisma.complianceCheck.create({
      data: {
        userId: investor.id,
        campaignId: campaign.id,
        type: "KYC_STATUS",
        status: ComplianceStatus.BLOCKED,
        code: "KYC01",
        message: "Yatırımcı KYC doğrulaması tamamlanmamış.",
        metadata: JSON.stringify({ kycStatus: investor.investorProfile.kycStatus })
      }
    });
    return { ok: false, message: "Yatırım için KYC doğrulaması tamamlanmalı." };
  }

  const limitResult = checkInvestorLimit(investor.investorProfile, input.amountKurus);
  const capacityResult = checkCampaignCapacity(campaign, input.amountKurus);

  if (!limitResult.passed || !capacityResult.passed) {
    await prisma.complianceCheck.createMany({
      data: [
        {
          userId: investor.id,
          campaignId: campaign.id,
          type: "INVESTOR_LIMIT",
          status: limitResult.passed ? ComplianceStatus.PASSED : ComplianceStatus.BLOCKED,
          code: limitResult.code,
          message: limitResult.message,
          metadata: JSON.stringify({ remainingLimitKurus: limitResult.remainingLimitKurus })
        },
        {
          userId: investor.id,
          campaignId: campaign.id,
          type: "CAMPAIGN_CAPACITY",
          status: capacityResult.passed ? ComplianceStatus.PASSED : ComplianceStatus.BLOCKED,
          code: capacityResult.code,
          message: capacityResult.message,
          metadata: JSON.stringify({ remainingCapacityKurus: capacityResult.remainingLimitKurus })
        }
      ]
    });
    return { ok: false, message: !limitResult.passed ? limitResult.message : capacityResult.message };
  }

  const [mkk, escrow] = await Promise.all([
    mockMkkAdapter.decreaseLimit({
      investorId: investor.id,
      campaignId: campaign.id,
      amountKurus: input.amountKurus
    }),
    mockEscrowAdapter.holdFunds({
      investorId: investor.id,
      campaignId: campaign.id,
      amountKurus: input.amountKurus
    })
  ]);

  if (!mkk.ok || !escrow.ok) {
    return { ok: false, message: "Entegrasyon simülasyonu yanıtı başarısız oldu." };
  }

  const investment = await prisma.$transaction(async (tx) => {
    await tx.investorProfile.update({
      where: { userId: investor.id },
      data: { usedLimitKurus: { increment: input.amountKurus } }
    });

    await tx.campaign.update({
      where: { id: campaign.id },
      data: { committedAmountKurus: { increment: input.amountKurus } }
    });

    const created = await tx.investmentIntent.create({
      data: {
        campaignId: campaign.id,
        investorId: investor.id,
        amountKurus: input.amountKurus,
        status: InvestmentStatus.PENDING_COOLING_OFF,
        coolingOffEndsAt: coolingOffDeadline(),
        mkkReference: mkk.reference,
        escrowReference: escrow.reference,
        ledgerEntries: {
          create: [
            {
              type: LedgerEntryType.ESCROW_HOLD,
              amountKurus: input.amountKurus,
              description: escrow.message
            },
            {
              type: LedgerEntryType.LIMIT_DECREASE,
              amountKurus: input.amountKurus,
              description: mkk.message
            }
          ]
        },
        complianceChecks: {
          create: [
            {
              userId: investor.id,
              campaignId: campaign.id,
              type: "INVESTOR_LIMIT",
              status: ComplianceStatus.PASSED,
              code: limitResult.code,
              message: limitResult.message,
              metadata: JSON.stringify({ remainingLimitKurus: limitResult.remainingLimitKurus })
            },
            {
              userId: investor.id,
              campaignId: campaign.id,
              type: "CAMPAIGN_CAPACITY",
              status: ComplianceStatus.PASSED,
              code: capacityResult.code,
              message: capacityResult.message,
              metadata: JSON.stringify({ remainingCapacityKurus: capacityResult.remainingLimitKurus })
            }
          ]
        }
      }
    });

    return created;
  });

  return {
    ok: true,
    message: "Yatırım taahhüdü oluşturuldu. 48 saatlik cayma penceresi başladı.",
    data: { investmentId: investment.id }
  };
}

export async function cancelInvestmentIntent(input: {
  investmentId: string;
  investorEmail: string;
}): Promise<ServiceResult<{ investmentId: string }>> {
  const investment = await prisma.investmentIntent.findUnique({
    where: { id: input.investmentId },
    include: {
      investor: true,
      campaign: true
    }
  });

  if (!investment) {
    return { ok: false, message: "Yatırım taahhüdü bulunamadı." };
  }

  if (investment.investor.email !== input.investorEmail) {
    return { ok: false, message: "Bu taahhüt demo yatırımcıya ait değil." };
  }

  if (investment.status !== InvestmentStatus.PENDING_COOLING_OFF) {
    return { ok: false, message: "Sadece cayma penceresindeki taahhütler iptal edilebilir." };
  }

  if (!isCoolingOffOpen(investment.coolingOffEndsAt)) {
    return { ok: false, message: "48 saatlik cayma penceresi kapanmış." };
  }

  const [mkk, escrow] = await Promise.all([
    mockMkkAdapter.increaseLimit({
      investorId: investment.investorId,
      campaignId: investment.campaignId,
      amountKurus: investment.amountKurus
    }),
    mockEscrowAdapter.refundFunds({
      investorId: investment.investorId,
      campaignId: investment.campaignId,
      amountKurus: investment.amountKurus
    })
  ]);

  if (!mkk.ok || !escrow.ok) {
    return { ok: false, message: "İade entegrasyonu simülasyonu başarısız oldu." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.investmentIntent.update({
      where: { id: investment.id },
      data: {
        status: InvestmentStatus.CANCELLED,
        cancelledAt: new Date()
      }
    });

    await tx.investorProfile.update({
      where: { userId: investment.investorId },
      data: { usedLimitKurus: { decrement: investment.amountKurus } }
    });

    await tx.campaign.update({
      where: { id: investment.campaignId },
      data: { committedAmountKurus: { decrement: investment.amountKurus } }
    });

    await tx.mockLedgerEntry.createMany({
      data: [
        {
          investmentId: investment.id,
          type: LedgerEntryType.LIMIT_RELEASE,
          amountKurus: investment.amountKurus,
          description: mkk.message
        },
        {
          investmentId: investment.id,
          type: LedgerEntryType.REFUND,
          amountKurus: investment.amountKurus,
          description: escrow.message
        }
      ]
    });

    await tx.complianceCheck.create({
      data: {
        userId: investment.investorId,
        campaignId: investment.campaignId,
        investmentId: investment.id,
        type: "COOLING_OFF_CANCEL",
        status: ComplianceStatus.PASSED,
        code: "CAY00",
        message: "48 saatlik cayma hakkı içinde iade oluşturuldu.",
        metadata: JSON.stringify({ mkkReference: mkk.reference, escrowReference: escrow.reference })
      }
    });
  });

  return {
    ok: true,
    message: "Yatırım taahhüdü iptal edildi ve limit iadesi simülasyonu kaydedildi.",
    data: { investmentId: investment.id }
  };
}
