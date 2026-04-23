import type { CampaignStatus, ComplianceStatus, InvestmentStatus, ReviewDecision } from "@prisma/client";

export function campaignStatusLabel(status: CampaignStatus | string) {
  const labels: Record<string, string> = {
    DRAFT: "Taslak",
    UNDER_REVIEW: "İncelemede",
    APPROVED: "Onaylandı",
    LIVE: "Yayında",
    FUNDED: "Fonlandı",
    FAILED: "Başarısız",
    CANCELLED: "İptal edildi"
  };

  return labels[status] ?? status;
}

export function investmentStatusLabel(status: InvestmentStatus | string) {
  const labels: Record<string, string> = {
    PENDING_COOLING_OFF: "Cayma süresinde",
    CONFIRMED: "Kesinleşti",
    CANCELLED: "İptal edildi",
    REFUNDED: "İade edildi"
  };

  return labels[status] ?? status;
}

export function complianceStatusLabel(status: ComplianceStatus | string) {
  const labels: Record<string, string> = {
    PASSED: "Geçti",
    BLOCKED: "Engellendi",
    REVIEW: "İnceleme"
  };

  return labels[status] ?? status;
}

export function reviewDecisionLabel(decision: ReviewDecision | string) {
  const labels: Record<string, string> = {
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
    CHANGES_REQUESTED: "Revizyon istendi"
  };

  return labels[decision] ?? decision;
}
