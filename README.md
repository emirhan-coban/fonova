# Fonova

Startup hub web platform: founders publish campaigns and data rooms, investors review them, and a compliance layer (KYC, admin review, audit of document views) sits in between. Built with Next.js and PostgreSQL.

[Live demo](https://startup-hub-ten.vercel.app)

## Highlights

- **Campaigns & data room** with per-document view tracking
- **Founder, investor and admin areas** (`/founder`, `/pro`, `/admin`)
- **Compliance checks and KYC flow**, admin review queue
- **Mock ledger** for investment intents (no real money movement)
- **Security layers**: AES-256-GCM encryption for sensitive financial data, middleware protections
- **SEO**: sitemap, robots, metadata

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma 6, PostgreSQL, Docker Compose

## Getting started

```bash
cp .env.example .env          # then set ENCRYPTION_KEY (64-char hex)
npm install
npm run db:up                 # starts PostgreSQL via Docker
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Detailed Turkish setup guide: [KURULUM-REHBERI.md](KURULUM-REHBERI.md)

## Data model

User, InvestorProfile, Company, Campaign, CampaignDocument, InvestmentIntent, MockLedgerEntry, ComplianceCheck, AdminReview, DocumentView, SupportProject, VolunteerContribution (see `prisma/schema.prisma`).
