import { notFound } from "next/navigation";
import { CampaignStatus, InvestmentStatus } from "@prisma/client";
import { CancelInvestmentButton } from "@/components/CancelInvestmentButton";
import { InvestmentPanel } from "@/components/InvestmentPanel";
import { MetricPill } from "@/components/MetricPill";
import { SecureDocumentViewer } from "@/components/SecureDocumentViewer";
import { campaignProgress, daysRemaining, isCoolingOffOpen } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { campaignStatusLabel, complianceStatusLabel, investmentStatusLabel } from "@/lib/labels";
import { formatCompactTRY, formatTRY } from "@/lib/money";

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [campaign, investor] = await Promise.all([
    prisma.campaign.findUnique({
      where: { slug },
      include: {
        company: true,
        documents: true,
        investments: {
          include: {
            ledgerEntries: { orderBy: { createdAt: "desc" } }
          },
          orderBy: { createdAt: "desc" }
        },
        complianceChecks: {
          take: 5,
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    prisma.user.findUnique({
      where: { email: "yatirimci@starthub.test" },
      include: { investorProfile: true }
    })
  ]);

  if (!campaign) {
    notFound();
  }

  const progress = campaignProgress(campaign);
  const remaining = Math.max(0, campaign.targetAmountKurus - campaign.committedAmountKurus);
  const demoRemainingLimit = investor?.investorProfile ? investor.investorProfile.yearlyLimitKurus - investor.investorProfile.usedLimitKurus : 0;
  const document = campaign.documents[0];
  const activeInvestment = campaign.investments.find((investment) => investment.investorId === investor?.id && investment.status === InvestmentStatus.PENDING_COOLING_OFF);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="fade-up">
          <div className="mb-5 flex flex-wrap gap-2">
            <MetricPill label={campaign.company.sector} value={campaign.company.city} tone="teal" />
            <MetricPill label="Risk" value={campaign.riskRating} tone="accent" />
            <MetricPill label="Durum" value={campaignStatusLabel(campaign.status)} />
          </div>
          <h1 className="max-w-5xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            {campaign.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-400">{campaign.longPitch}</p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel overflow-hidden rounded-[calc(1.5rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)]">
            <div
              className="min-h-56 bg-cover bg-center sm:min-h-72"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(10,22,40,0.02), rgba(10,22,40,0.78)), url(https://picsum.photos/seed/${campaign.coverSeed}/1200/860)`
              }}
            />
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Toplanan</p>
                  <p className="font-mono text-2xl text-white">{formatTRY(campaign.committedAmountKurus)}</p>
                </div>
                <p className="font-mono text-lg font-semibold text-accent">%{progress}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-navy-950">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 text-xs min-[390px]:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">Hedef</p>
                  <p className="mt-1 font-mono text-white">{formatCompactTRY(campaign.targetAmountKurus)}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">Pay</p>
                  <p className="mt-1 font-mono text-white">%{campaign.equityOfferedBps / 100}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">Kalan</p>
                  <p className="mt-1 font-mono text-white">{daysRemaining(campaign.endDate)} gün</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                Lider yatırımcı: {campaign.leadInvestorName} / {formatCompactTRY(campaign.leadCommitmentKurus)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Investment + Commitments + Document ──────────────── */}
      <section className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          {campaign.status === CampaignStatus.LIVE ? (
            <InvestmentPanel
              campaignSlug={campaign.slug}
              minInvestmentKurus={campaign.minInvestmentKurus}
              remainingKurus={remaining}
              demoRemainingLimitKurus={demoRemainingLimit}
            />
          ) : (
            <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
              <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                <h2 className="text-2xl font-semibold text-white">Komite incelemesi sürüyor</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Bu kampanya yatırımcı taahhüdüne açılmadan önce yönetim kuyruğunda incelenir.
                </p>
              </div>
            </div>
          )}

          {/* Commitments */}
          <section className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
            <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Taahhütler</h2>
              <div className="mt-5 space-y-3">
                {campaign.investments.length === 0 ? (
                  <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-slate-500">
                    Bu kampanyada henüz yatırım taahhüdü yok.
                  </p>
                ) : (
                  campaign.investments.map((investment) => (
                    <div key={investment.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-mono text-lg text-white">{formatTRY(investment.amountKurus)}</p>
                          <p className="mt-1 text-xs text-slate-500">{investmentStatusLabel(investment.status)} / {investment.mkkReference}</p>
                        </div>
                        {investment.id === activeInvestment?.id && isCoolingOffOpen(investment.coolingOffEndsAt) ? <CancelInvestmentButton investmentId={investment.id} /> : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {document ? (
          <SecureDocumentViewer documentId={document.id} title={document.title} pageCount={document.pageCount} watermark={investor?.email ?? "demo"} />
        ) : null}
      </section>

      {/* ─── Compliance Audit Trail ───────────────────────────── */}
      <section className="grid gap-5 py-10 sm:py-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal/80">Uyum</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Kampanya denetim izleri</h2>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel divide-y divide-white/[0.06] rounded-[calc(1.5rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)]">
            {campaign.complianceChecks.map((check) => (
              <div key={check.id} className="grid gap-2 p-4 sm:gap-3 sm:p-5 md:grid-cols-[130px_1fr_90px]">
                <span className="font-mono text-xs text-slate-500">{check.code}</span>
                <span className="text-sm text-slate-300">{check.message}</span>
                <span className="text-left text-xs font-medium text-teal md:text-right">{complianceStatusLabel(check.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
