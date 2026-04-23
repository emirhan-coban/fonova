import { describe, expect, it } from "vitest";
import { checkCampaignCapacity, checkInvestorLimit, coolingOffDeadline } from "./engine";

describe("compliance engine", () => {
  it("allows a retail investor inside the computed yearly limit", () => {
    const result = checkInvestorLimit(
      {
        annualIncomeKurus: 8_400_000_00,
        yearlyLimitKurus: 840_000_00,
        usedLimitKurus: 180_000_00
      },
      80_000_00
    );

    expect(result.passed).toBe(true);
    expect(result.code).toBe("ELM00");
    expect(result.remainingLimitKurus).toBe(580_000_00);
  });

  it("blocks an investment above the remaining investor limit", () => {
    const result = checkInvestorLimit(
      {
        annualIncomeKurus: 1_000_000_00,
        yearlyLimitKurus: 500_000_00,
        usedLimitKurus: 490_000_00
      },
      25_000_00
    );

    expect(result.passed).toBe(false);
    expect(result.code).toBe("ELM01");
  });

  it("blocks an amount below campaign minimum", () => {
    const result = checkCampaignCapacity(
      {
        targetAmountKurus: 1_000_000_00,
        committedAmountKurus: 250_000_00,
        minInvestmentKurus: 10_000_00
      },
      5_000_00
    );

    expect(result.passed).toBe(false);
    expect(result.code).toBe("AMT02");
  });

  it("uses a 48 hour default cooling off deadline", () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    const deadline = coolingOffDeadline(now);
    expect(deadline.toISOString()).toBe("2026-04-24T10:00:00.000Z");
  });
});
