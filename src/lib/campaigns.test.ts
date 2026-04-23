import { describe, expect, it } from "vitest";
import { campaignCanCloseAsFunded, campaignProgress, daysRemaining, isCoolingOffOpen } from "./campaigns";

describe("campaign helpers", () => {
  it("calculates capped campaign progress", () => {
    expect(campaignProgress({ committedAmountKurus: 4_280_000_00, targetAmountKurus: 7_500_000_00 })).toBe(57);
    expect(campaignProgress({ committedAmountKurus: 12_000_000_00, targetAmountKurus: 7_500_000_00 })).toBe(100);
  });

  it("calculates remaining days without going negative", () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    expect(daysRemaining(new Date("2026-04-25T09:00:00.000Z"), now)).toBe(3);
    expect(daysRemaining(new Date("2026-04-20T09:00:00.000Z"), now)).toBe(0);
  });

  it("detects cooling off availability", () => {
    const now = new Date("2026-04-22T10:00:00.000Z");
    expect(isCoolingOffOpen(new Date("2026-04-22T10:00:01.000Z"), now)).toBe(true);
    expect(isCoolingOffOpen(new Date("2026-04-22T09:59:59.000Z"), now)).toBe(false);
  });

  it("marks a campaign as funded when committed amount reaches target", () => {
    expect(campaignCanCloseAsFunded({ committedAmountKurus: 1_000_000_00, targetAmountKurus: 1_000_000_00 })).toBe(true);
    expect(campaignCanCloseAsFunded({ committedAmountKurus: 999_999_00, targetAmountKurus: 1_000_000_00 })).toBe(false);
  });
});
