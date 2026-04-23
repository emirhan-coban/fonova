import { Briefcase, ChartLineUp, Gauge, Lightning, TrendUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MetricPill } from "@/components/MetricPill";
import { campaignProgress } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { formatCompactTRY, formatTRY } from "@/lib/money";

export default async function ProPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      company: true,
      investments: true,
      documents: true
    },
    orderBy: { committedAmountKurus: "desc" }
  });

  const committed = campaigns.reduce((sum, campaign) => sum + campaign.committedAmountKurus, 0);
  const target = campaigns.reduce((sum, campaign) => sum + campaign.targetAmountKurus, 0);
  const portfolioScore = campaigns.length
    ? Math.round(campaigns.reduce((sum, campaign) => sum + campaignProgress(campaign), 0) / campaigns.length)
    : 0;

  const modules = [
    {
      icon: ChartLineUp,
      title: "Portföy görünümü",
      body: "Kurumsal yatırımcı, tüm kampanyaları taahhüt, hedef, sektör ve ilgi skoruyla tek yerde izler."
    },
    {
      icon: Gauge,
      title: "Finansal planlama göstergeleri",
      body: "Nakit ömrü, harcama hızı, hedef fon doluluğu ve portföy yoğunluğu gibi metrikler MVP seviyesinde simüle edilir."
    },
    {
      icon: Lightning,
      title: "Fırsat akışı eşleştirme",
      body: "Sektör, risk ve yatırımcı davranışı sinyalleriyle sıcak girişim fırsatları öne çıkarılır."
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <MetricPill label="Fonova Pro" value="Kurumsal yatırımcı" tone="accent" />
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Fonlar ve melek ağları için portföy analitiği
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Dokümandaki Fonova Pro fikri MVP'de ayrı bir kurumsal panel olarak görünür: portföy doluluğu, sektör
            dağılımı, veri odası ilgisi ve fırsat akışı sinyalleri tek ekranda toplanır.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel grid gap-3 rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:grid-cols-2 sm:p-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <Briefcase className="mb-4 text-teal" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">{formatCompactTRY(committed)}</p>
              <p className="mt-1 text-xs text-slate-500">İzlenen taahhüt</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <TrendUp className="mb-4 text-accent" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">%{portfolioScore}</p>
              <p className="mt-1 text-xs text-slate-500">Portföy doluluğu</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <UsersThree className="mb-4 text-teal" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">{campaigns.length}</p>
              <p className="mt-1 text-xs text-slate-500">Aktif fırsat</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <ChartLineUp className="mb-4 text-accent" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">{formatCompactTRY(target)}</p>
              <p className="mt-1 text-xs text-slate-500">Toplam hedef fon</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <article key={module.title} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
              <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={25} weight="duotone" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-white">{module.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{module.body}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
        <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Kurumsal fırsat akışı listesi</h2>
          <div className="mt-6 divide-y divide-white/[0.06]">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="grid gap-4 py-5 lg:grid-cols-[1fr_150px_150px_120px] lg:items-center">
                <div>
                  <p className="font-medium text-white">{campaign.company.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{campaign.company.sector} / {campaign.riskRating}</p>
                </div>
                <p className="font-mono text-sm text-slate-300">{formatTRY(campaign.committedAmountKurus)}</p>
                <p className="font-mono text-sm text-slate-300">%{campaignProgress(campaign)}</p>
                <p className="font-mono text-sm text-teal">{campaign.documents[0]?.engagementScore ?? 0} skor</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
