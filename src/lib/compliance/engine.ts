import type { Campaign, InvestorProfile } from "@prisma/client";
import { complianceConfig2026, type ComplianceConfig } from "./config";

export type ComplianceResult = {
  passed: boolean;
  code: string;
  message: string;
  remainingLimitKurus: number;
};

export function calculateRetailYearlyLimit(profile: Pick<InvestorProfile, "annualIncomeKurus" | "yearlyLimitKurus">, config: ComplianceConfig = complianceConfig2026) {
  const incomeBasedLimit = Math.floor((profile.annualIncomeKurus * config.retailIncomeLimitRateBps) / 10_000);
  const allowedByIncome = Math.min(incomeBasedLimit, config.retailIncomeBasedLimitCapKurus);
  const computed = Math.max(config.retailBaseYearlyLimitKurus, allowedByIncome);

  if (profile.yearlyLimitKurus > 0) {
    return Math.min(profile.yearlyLimitKurus, config.retailIncomeBasedLimitCapKurus);
  }

  return computed;
}

export function checkInvestorLimit(profile: Pick<InvestorProfile, "annualIncomeKurus" | "yearlyLimitKurus" | "usedLimitKurus">, amountKurus: number, config: ComplianceConfig = complianceConfig2026): ComplianceResult {
  const yearlyLimit = calculateRetailYearlyLimit(profile, config);
  const remaining = Math.max(0, yearlyLimit - profile.usedLimitKurus);

  if (amountKurus <= 0) {
    return {
      passed: false,
      code: "AMT01",
      message: "Yatırım tutarı sıfırdan büyük olmalıdır.",
      remainingLimitKurus: remaining
    };
  }

  if (amountKurus > remaining) {
    return {
      passed: false,
      code: "ELM01",
      message: "Yatırımcı yıllık limitini aşıyor.",
      remainingLimitKurus: remaining
    };
  }

  return {
    passed: true,
    code: "ELM00",
    message: "Yatırımcı yıllık limit içinde.",
    remainingLimitKurus: remaining - amountKurus
  };
}

export function checkCampaignCapacity(campaign: Pick<Campaign, "targetAmountKurus" | "committedAmountKurus" | "minInvestmentKurus">, amountKurus: number): ComplianceResult {
  const remaining = Math.max(0, campaign.targetAmountKurus - campaign.committedAmountKurus);

  if (amountKurus < campaign.minInvestmentKurus) {
    return {
      passed: false,
      code: "AMT02",
      message: "Yatırım tutarı kampanya minimumunun altında.",
      remainingLimitKurus: remaining
    };
  }

  if (amountKurus > remaining) {
    return {
      passed: false,
      code: "ELM03",
      message: "Kampanyanın açık limiti yeterli değil.",
      remainingLimitKurus: remaining
    };
  }

  return {
    passed: true,
    code: "PRJ00",
    message: "Kampanya açık limiti yeterli.",
    remainingLimitKurus: remaining - amountKurus
  };
}

export function coolingOffDeadline(now = new Date(), config: ComplianceConfig = complianceConfig2026) {
  return new Date(now.getTime() + config.coolingOffHours * 60 * 60 * 1000);
}
