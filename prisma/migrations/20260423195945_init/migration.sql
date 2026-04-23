-- CreateEnum
CREATE TYPE "Role" AS ENUM ('INVESTOR', 'FOUNDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "InvestorTier" AS ENUM ('RETAIL', 'QUALIFIED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'ESCALATED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'LIVE', 'FUNDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('PENDING_COOLING_OFF', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('ESCROW_HOLD', 'LIMIT_DECREASE', 'LIMIT_RELEASE', 'REFUND', 'SHARE_REGISTRATION');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('PASSED', 'BLOCKED', 'REVIEW');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "SupportProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'COMPLETED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "InvestorTier" NOT NULL DEFAULT 'RETAIL',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "annualIncomeKurus" INTEGER NOT NULL DEFAULT 0,
    "yearlyLimitKurus" INTEGER NOT NULL DEFAULT 0,
    "usedLimitKurus" INTEGER NOT NULL DEFAULT 0,
    "mkkSicilNo" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 42,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "founderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "foundedYear" INTEGER NOT NULL,
    "incorporationType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CompanyStatus" NOT NULL DEFAULT 'DRAFT',
    "logoSeed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "longPitch" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "targetAmountKurus" INTEGER NOT NULL,
    "minInvestmentKurus" INTEGER NOT NULL,
    "committedAmountKurus" INTEGER NOT NULL DEFAULT 0,
    "equityOfferedBps" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "coverSeed" TEXT NOT NULL,
    "riskRating" TEXT NOT NULL,
    "leadInvestorName" TEXT NOT NULL,
    "leadCommitmentKurus" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDocument" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "restricted" BOOLEAN NOT NULL DEFAULT true,
    "watermarkEnabled" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentIntent" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'PENDING_COOLING_OFF',
    "coolingOffEndsAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "mkkReference" TEXT NOT NULL,
    "escrowReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockLedgerEntry" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amountKurus" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "campaignId" TEXT,
    "investmentId" TEXT,
    "type" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminReview" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentView" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "volunteersNeeded" INTEGER NOT NULL DEFAULT 0,
    "supportType" TEXT NOT NULL,
    "seed" TEXT NOT NULL,
    "status" "SupportProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerContribution" (
    "id" TEXT NOT NULL,
    "supportProjectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "VolunteerStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDocument" ADD CONSTRAINT "CampaignDocument_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentIntent" ADD CONSTRAINT "InvestmentIntent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentIntent" ADD CONSTRAINT "InvestmentIntent_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockLedgerEntry" ADD CONSTRAINT "MockLedgerEntry_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentIntent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceCheck" ADD CONSTRAINT "ComplianceCheck_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "InvestmentIntent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminReview" ADD CONSTRAINT "AdminReview_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminReview" ADD CONSTRAINT "AdminReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CampaignDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentView" ADD CONSTRAINT "DocumentView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerContribution" ADD CONSTRAINT "VolunteerContribution_supportProjectId_fkey" FOREIGN KEY ("supportProjectId") REFERENCES "SupportProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerContribution" ADD CONSTRAINT "VolunteerContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
