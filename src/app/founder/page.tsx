import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatCompactTRY } from "@/lib/money";
import { campaignProgress } from "@/lib/campaigns";
import { MetricPill } from "@/components/MetricPill";
import { campaignStatusLabel } from "@/lib/labels";

export default async function FounderPage() {
  const founder = await prisma.user.findUnique({
    where: { email: "kurucu@starthub.test" },
    include: {
      companies: {
        include: {
          campaigns: {
            include: { documents: true, investments: true }
          }
        }
      }
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <MetricPill label="Girişimci" value={founder?.name ?? "Demo"} tone="teal" />
          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Başvuru, veri odası ve yatırımcı ilgisi tek panelde
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-400">
            Bu panel girişimci deneyiminin MVP halidir: kampanya durumu, fon ilerlemesi, güvenli doküman skoru ve
            taahhüt sayısı görünür.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Yeni başvuru taslağı</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Şirket adı</span>
                <input
                  className="w-full rounded-2xl border border-white/[0.08] bg-navy-950/60 px-4 py-3 text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-accent/50"
                  defaultValue="AstraPay Labs"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Hedef fon</span>
                <input
                  className="w-full rounded-2xl border border-white/[0.08] bg-navy-950/60 px-4 py-3 font-mono text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-accent/50"
                  defaultValue="6.400.000 TL"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-400">Kısa tanım</span>
                <textarea
                  className="min-h-28 w-full resize-none rounded-2xl border border-white/[0.08] bg-navy-950/60 px-4 py-3 text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-accent/50"
                  defaultValue="Fatura riskini canlı skorlayan erken ödeme ağı."
                />
              </label>
            </div>
            <Link
              href="/admin"
              className="mt-5 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-20px_rgba(124,58,237,0.75)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.98]"
            >
              Yönetim kuyruğunda gör
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 lg:grid-cols-3">
        {founder?.companies.flatMap((company) =>
          company.campaigns.map((campaign) => {
            const doc = campaign.documents[0];
            return (
              <article key={campaign.id} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
                <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                  <div className="mb-5 flex flex-wrap gap-2">
                    <MetricPill label={company.sector} value={campaignStatusLabel(campaign.status)} />
                  </div>
                  <h2 className="text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl">{campaign.title}</h2>
                  <p className="mt-4 text-sm leading-6 text-slate-400">{campaign.summary}</p>
                  <div className="mt-8 space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-xs text-slate-500">
                        <span>{formatCompactTRY(campaign.committedAmountKurus)}</span>
                        <span className="font-semibold text-accent">%{campaignProgress(campaign)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy-950">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{ width: `${campaignProgress(campaign)}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-xs min-[380px]:grid-cols-2">
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-slate-500">Taahhüt</p>
                        <p className="mt-1 font-mono text-white">{campaign.investments.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-slate-500">İlgi skoru</p>
                        <p className="mt-1 font-mono text-white">{doc?.engagementScore ?? 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
