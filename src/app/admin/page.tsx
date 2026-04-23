import { AdminReviewControls } from "@/components/AdminReviewControls";
import { MetricPill } from "@/components/MetricPill";
import { prisma } from "@/lib/db";
import { campaignStatusLabel, complianceStatusLabel, reviewDecisionLabel } from "@/lib/labels";
import { formatCompactTRY } from "@/lib/money";

export default async function AdminPage() {
  const [campaigns, checks] = await Promise.all([
    prisma.campaign.findMany({
      include: {
        company: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: [{ status: "desc" }, { createdAt: "desc" }]
    }),
    prisma.complianceCheck.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <MetricPill label="Yönetim" value="Komite simülasyonu" tone="accent" />
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Kampanya inceleme ve uyum kuyruğu
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            MVP yönetim ekranı, yatırım komitesi kararını, kampanya durumunu ve MKK/Takasbank simülasyon denetim izlerini tek yüzeyde toplar.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel divide-y divide-white/[0.06] rounded-[calc(1.5rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)]">
            {checks.map((check) => (
              <div key={check.id} className="grid gap-2 p-4 md:grid-cols-[120px_1fr_80px]">
                <span className="font-mono text-xs text-slate-500">{check.code}</span>
                <span className="text-sm text-slate-300">{check.message}</span>
                <span className="text-left text-xs font-medium text-teal md:text-right">{complianceStatusLabel(check.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 lg:grid-cols-2">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
            <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
              <div className="mb-5 flex flex-wrap gap-2">
                <MetricPill label={campaign.company.sector} value={campaignStatusLabel(campaign.status)} tone={campaign.status === "LIVE" ? "teal" : "neutral"} />
                <MetricPill label="Hedef" value={formatCompactTRY(campaign.targetAmountKurus)} />
              </div>
              <h2 className="text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">{campaign.title}</h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">{campaign.summary}</p>
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Son karar</p>
                <p className="mt-1 text-sm text-slate-300">{campaign.reviews[0]?.decision ? reviewDecisionLabel(campaign.reviews[0].decision) : "Karar bekliyor"}</p>
              </div>
              <div className="mt-5">
                <AdminReviewControls campaignId={campaign.id} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
