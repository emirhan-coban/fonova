import { Bank, CheckCircle, Database, Fingerprint, Scales, ShieldCheck, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { MetricPill } from "@/components/MetricPill";
import { complianceConfig2026 } from "@/lib/compliance/config";
import { prisma } from "@/lib/db";
import { campaignStatusLabel, complianceStatusLabel } from "@/lib/labels";
import { formatTRY } from "@/lib/money";

export default async function CompliancePage() {
  const [checks, investors, campaigns] = await Promise.all([
    prisma.complianceCheck.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        campaign: true,
        user: true
      }
    }),
    prisma.investorProfile.findMany({
      include: { user: true },
      orderBy: { usedLimitKurus: "desc" }
    }),
    prisma.campaign.findMany({
      include: { company: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const integrationCards = [
    {
      icon: Database,
      title: "MKK KFS limit motoru",
      body: "Yatırım taahhüdü alınmadan önce yatırımcı limiti, açık kampanya kapasitesi ve MKK referansı simüle edilir.",
      status: "Simülasyon çalışıyor"
    },
    {
      icon: Bank,
      title: "Takasbank emanet akışı",
      body: "Fonlar platform hesabına alınmaz; MVP'de blokaj, iade ve fon çözümü defter kaydı olarak gösterilir.",
      status: "Simülasyon çalışıyor"
    },
    {
      icon: Fingerprint,
      title: "KYC/KYB pasaportu",
      body: "Kimlik doğrulama, risk skoru ve yatırımcı profili tek yerde tutulur; canlı servis daha sonra adaptör üzerinden bağlanır.",
      status: "Hazır arayüz"
    },
    {
      icon: Scales,
      title: "Yatırım komitesi",
      body: "Kampanya yayına alınmadan önce yönetim panelinde onay, red veya revizyon kararı denetim kaydına yazılır.",
      status: "Aktif"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <MetricPill label="Uyum" value={`Konfigürasyon ${complianceConfig2026.year}`} tone="teal" />
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Limit, komite ve resmi entegrasyon simülasyonu
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            MVP canlı finansal ürün değildir. Ancak yatırımcı limiti, 48 saat cayma hakkı, komite kararı, MKK ve
            Takasbank adaptör sınırları üretim mimarisine taşınabilecek şekilde ayrılmıştır.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel grid gap-3 rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:grid-cols-2 sm:p-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Perakende yıllık baz limit</p>
              <p className="mt-2 font-mono text-lg text-white sm:text-xl">{formatTRY(complianceConfig2026.retailBaseYearlyLimitKurus)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Gelire bağlı üst limit</p>
              <p className="mt-2 font-mono text-lg text-white sm:text-xl">{formatTRY(complianceConfig2026.retailIncomeBasedLimitCapKurus)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Cayma penceresi</p>
              <p className="mt-2 font-mono text-lg text-white sm:text-xl">{complianceConfig2026.coolingOffHours} saat</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">Platform sermaye şartı</p>
              <p className="mt-2 font-mono text-lg text-white sm:text-xl">{formatTRY(complianceConfig2026.platformCapitalRequirementKurus)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-4">
        {integrationCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
              <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-teal/10 text-teal">
                    <Icon size={23} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-teal">
                    {card.status}
                  </span>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{card.body}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 py-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Yatırımcı limitleri</h2>
              <ShieldCheck className="text-teal" size={24} weight="duotone" />
            </div>
            <div className="space-y-3">
              {investors.map((profile) => {
                const remaining = profile.yearlyLimitKurus - profile.usedLimitKurus;
                return (
                  <div key={profile.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{profile.user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {profile.tier === "QUALIFIED" ? "Nitelikli yatırımcı" : "Perakende yatırımcı"} /{" "}
                          {profile.kycStatus === "VERIFIED" ? "KYC doğrulandı" : "KYC bekliyor"}
                        </p>
                      </div>
                      <p className="font-mono text-sm text-teal">{formatTRY(remaining)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight text-white">Denetim izi</h2>
              <CheckCircle className="text-teal" size={24} weight="duotone" />
            </div>
            <div className="divide-y divide-white/[0.06]">
              {checks.map((check) => (
                <div key={check.id} className="grid gap-2 py-4 sm:gap-3 md:grid-cols-[110px_1fr_100px]">
                  <span className="font-mono text-xs text-slate-500">{check.code}</span>
                  <span className="text-sm text-slate-300">{check.message}</span>
                  <span className="text-left text-xs font-medium text-teal md:text-right">{complianceStatusLabel(check.status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="rounded-2xl border border-white/[0.08] bg-navy-900/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-medium text-white">{campaign.company.name}</p>
              <WarningCircle className="text-accent" size={20} weight="duotone" />
            </div>
            <p className="text-sm leading-6 text-slate-400">{campaign.title}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetricPill label="Durum" value={campaignStatusLabel(campaign.status)} />
              <MetricPill label="Açık hedef" value={formatTRY(campaign.targetAmountKurus)} tone="accent" />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
