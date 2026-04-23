import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvestmentPanel } from "./InvestmentPanel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

describe("InvestmentPanel", () => {
  it("renders investment controls with the demo limit and campaign capacity", () => {
    render(
      <InvestmentPanel
        campaignSlug="nuvia-robotics-tohum-turu"
        minInvestmentKurus={5_000_00}
        remainingKurus={3_220_000_00}
        demoRemainingLimitKurus={580_000_00}
      />
    );

    expect(screen.getByText("Taahhüt oluştur")).toBeTruthy();
    expect(screen.getByText("Demo kalan limit")).toBeTruthy();
    expect(screen.getByRole("button", { name: /48 saat cayma hakkıyla taahhüt et/i })).toBeTruthy();
  });
});
