export type ComplianceConfig = {
  year: number;
  retailBaseYearlyLimitKurus: number;
  retailIncomeBasedLimitCapKurus: number;
  retailIncomeLimitRateBps: number;
  campaignQualifiedThresholdKurus: number;
  qualifiedInvestorMinimumBpsOverThreshold: number;
  coolingOffHours: number;
  platformCapitalRequirementKurus: number;
};

export const complianceConfig2026: ComplianceConfig = {
  year: 2026,
  retailBaseYearlyLimitKurus: 500_000_00,
  retailIncomeBasedLimitCapKurus: 2_000_000_00,
  retailIncomeLimitRateBps: 1_000,
  campaignQualifiedThresholdKurus: 9_000_000_00,
  qualifiedInvestorMinimumBpsOverThreshold: 500,
  coolingOffHours: 48,
  platformCapitalRequirementKurus: 15_000_000_00
};
