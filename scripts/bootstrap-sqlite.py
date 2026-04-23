from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "prisma" / "dev.db"

SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "InvestorProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "tier" TEXT NOT NULL DEFAULT 'RETAIL',
  "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "annualIncomeKurus" INTEGER NOT NULL DEFAULT 0,
  "yearlyLimitKurus" INTEGER NOT NULL DEFAULT 0,
  "usedLimitKurus" INTEGER NOT NULL DEFAULT 0,
  "mkkSicilNo" TEXT,
  "riskScore" INTEGER NOT NULL DEFAULT 42,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "founderId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "sector" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "foundedYear" INTEGER NOT NULL,
  "incorporationType" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "logoSeed" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Company_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Campaign" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "longPitch" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "targetAmountKurus" INTEGER NOT NULL,
  "minInvestmentKurus" INTEGER NOT NULL,
  "committedAmountKurus" INTEGER NOT NULL DEFAULT 0,
  "equityOfferedBps" INTEGER NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "publishedAt" DATETIME,
  "approvedAt" DATETIME,
  "coverSeed" TEXT NOT NULL,
  "riskRating" TEXT NOT NULL,
  "leadInvestorName" TEXT NOT NULL,
  "leadCommitmentKurus" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CampaignDocument" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "pageCount" INTEGER NOT NULL,
  "restricted" BOOLEAN NOT NULL DEFAULT 1,
  "watermarkEnabled" BOOLEAN NOT NULL DEFAULT 1,
  "views" INTEGER NOT NULL DEFAULT 0,
  "engagementScore" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL,
  CONSTRAINT "CampaignDocument_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "InvestmentIntent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "investorId" TEXT NOT NULL,
  "amountKurus" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING_COOLING_OFF',
  "coolingOffEndsAt" DATETIME NOT NULL,
  "cancelledAt" DATETIME,
  "confirmedAt" DATETIME,
  "mkkReference" TEXT NOT NULL,
  "escrowReference" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "InvestmentIntent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "InvestmentIntent_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MockLedgerEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "investmentId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amountKurus" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  CONSTRAINT "MockLedgerEntry_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentIntent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ComplianceCheck" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "campaignId" TEXT,
  "investmentId" TEXT,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  CONSTRAINT "ComplianceCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ComplianceCheck_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ComplianceCheck_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentIntent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AdminReview" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "campaignId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL,
  CONSTRAINT "AdminReview_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AdminReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "DocumentView" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "page" INTEGER NOT NULL,
  "seconds" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL,
  CONSTRAINT "DocumentView_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CampaignDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DocumentView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Campaign_status_idx" ON "Campaign" ("status");
CREATE INDEX IF NOT EXISTS "InvestmentIntent_investorId_idx" ON "InvestmentIntent" ("investorId");
CREATE INDEX IF NOT EXISTS "ComplianceCheck_createdAt_idx" ON "ComplianceCheck" ("createdAt");
"""


def main():
  DB_PATH.parent.mkdir(parents=True, exist_ok=True)
  with sqlite3.connect(DB_PATH) as connection:
    connection.executescript(SCHEMA)
    connection.commit()
  print(f"SQLite schema ready at {DB_PATH}")


if __name__ == "__main__":
  main()
