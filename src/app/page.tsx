import { CampaignStatus } from "@prisma/client";
import Link from "next/link";
import {
  ArrowRight,
  Bank,
  Clock,
  CurrencyCircleDollar,
  Database,
  Heart,
  ShieldCheck
} from "@phosphor-icons/react/dist/ssr";
import AIAdvisor from "@/components/AIAdvisor";
import { CampaignCard } from "@/components/CampaignCard";
import { SupportProjectCard } from "@/components/SupportProjectCard";
import { campaignProgress } from "@/lib/campaigns";
import { prisma } from "@/lib/db";
import { complianceStatusLabel } from "@/lib/labels";
import { formatCompactTRY } from "@/lib/money";
import { supportProjects } from "@/lib/support-projects";

export default async function HomePage() {
  const [campaigns, checks] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: { in: [CampaignStatus.LIVE, CampaignStatus.UNDER_REVIEW] } },
      include: { company: true },
      orderBy: [{ status: "asc" }, { committedAmountKurus: "desc" }]
    }),
    prisma.complianceCheck.findMany({
      take: 4,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const liveCampaigns = campaigns.filter((campaign) => campaign.status === CampaignStatus.LIVE);
  const totalCommitted = liveCampaigns.reduce((sum, campaign) => sum + campaign.committedAmountKurus, 0);
  const averageProgress = liveCampaigns.length
    ? Math.round(liveCampaigns.reduce((sum, campaign) => sum + campaignProgress(campaign), 0) / liveCampaigns.length)
    : 0;
  const supportProgress = Math.round(
    supportProjects.reduce((sum, project) => sum + project.progress, 0) / supportProjects.length
  );

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
            <div className="flex flex-col justify-center rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_22px_62px_-54px_rgba(46,9,136,0.14)] sm:rounded-[2rem] sm:p-8 lg:p-10">
              <h1 className="max-w-4xl text-[2.25rem] font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Sermaye yatırımını ve gönüllü desteği aynı güvenilir pazar yerinde buluşturun.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                Fonova artık iki bağlantılı akışla çalışır: paya dayalı kampanyalar ve topluluk destek projeleri.
                Ekosistem yalnızca sermaye ile değil; zaman, uzmanlık ve doğrulanmış katkı ile de büyür.
              </p>
              <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
                <Link
                  href="#yatirim-projeleri"
                  className="rounded-xl bg-accent px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_34px_-26px_rgba(46,9,136,0.36)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.98]"
                >
                  Yatırım Projeleri
                </Link>
                <Link
                  href="#gonullu-destek"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Gönüllü Destek
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <Link
                href="#yatirim-projeleri"
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_22px_62px_-54px_rgba(46,9,136,0.16)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-accent/20 sm:rounded-[2rem] sm:p-6"
              >
                <div className="mb-6 grid size-11 place-items-center rounded-2xl bg-accent text-white sm:mb-8 sm:size-12">
                  <CurrencyCircleDollar size={26} weight="duotone" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Yatırım kolu</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Paya dayalı kampanyalar</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Fonlama hedefi, pay oranı, yatırımcı limit kontrolleri ve net cayma penceresi tek akışta.
                </p>
                <p className="mt-6 font-mono text-2xl font-bold text-slate-950 sm:mt-8 sm:text-3xl">
                  {formatCompactTRY(totalCommitted)}
                </p>
                <p className="mt-1 text-sm text-slate-500">Canlı demo taahhüdü</p>
              </Link>

              <Link
                href="#gonullu-destek"
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_22px_62px_-54px_rgba(46,9,136,0.16)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-accent/20 sm:rounded-[2rem] sm:p-6"
              >
                <div className="mb-6 grid size-11 place-items-center rounded-2xl bg-slate-50 text-accent sm:mb-8 sm:size-12">
                  <Heart size={26} weight="duotone" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Destek kolu</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Gönüllü katkı projeleri</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Mentorluk, teknik destek, saha doğrulaması ve topluluk görünürlüğü gibi parasal olmayan katkılar.
                </p>
                <p className="mt-6 font-mono text-2xl font-bold text-slate-950 sm:mt-8 sm:text-3xl">%{supportProgress}</p>
                <p className="mt-1 text-sm text-slate-500">Ortalama destek doluluk oranı</p>
              </Link>

              <div className="glass-panel rounded-[1.5rem] p-5 sm:rounded-[2rem] sm:p-6 md:col-span-2">
                <div className="grid gap-3 sm:grid-cols-4 sm:gap-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={18} weight="duotone" className="text-accent" />
                    <span className="font-mono text-xs font-medium text-slate-700">Uyum odaklı model</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bank size={18} weight="duotone" className="text-accent" />
                    <span className="font-mono text-xs font-medium text-slate-700">Takas simülasyonu</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Database size={18} weight="duotone" className="text-accent" />
                    <span className="font-mono text-xs font-medium text-slate-700">Yatırımcı limit kontrolleri</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} weight="duotone" className="text-accent" />
                    <span className="font-mono text-xs font-medium text-slate-700">48 saat cayma penceresi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AIAdvisor />

      <section id="yatirim-projeleri" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between sm:mb-12">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Yatırıma açık kampanyalar</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">Sermaye arayan girişimler</h2>
            </div>
            <Link
              href="/compliance"
              className="group hidden items-center gap-2 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:text-accent md:flex"
            >
              Uyum akışını gör
              <ArrowRight
                size={14}
                weight="bold"
                className="transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="grid grid-flow-dense grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

      <section id="gonullu-destek" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-4 sm:mb-12 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Topluluk katkısı</p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Sermaye dışında destek bekleyen projeler
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Bu alan yatırım tavsiyesi değildir. Mentorları, uzmanları ve gönüllüleri gerçek operasyonel desteğe ihtiyaç
              duyan ekiplerle eşleştirir.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {supportProjects.map((project) => (
              <SupportProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_22px_62px_-54px_rgba(46,9,136,0.14)] sm:rounded-[2rem] sm:p-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8 lg:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Denetim izi</p>
            <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Uyum motoru her kritik adımı kayda geçirir.
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {checks.map((check) => (
              <div key={check.id} className="grid gap-2 py-4 sm:gap-3 sm:py-5 md:grid-cols-[140px_1fr_100px]">
                <span className="font-mono text-xs text-slate-500">{check.code}</span>
                <span className="text-sm text-slate-600">{check.message}</span>
                <span className="text-left text-xs font-semibold text-accent md:text-right">
                  {complianceStatusLabel(check.status)}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pazar özeti</p>
            <div className="mt-3 flex flex-wrap gap-4">
              <span className="rounded-full bg-white px-4 py-2 font-mono text-sm text-slate-700 shadow-[0_10px_24px_-22px_rgba(46,9,136,0.22)]">
                Ortalama kampanya ilerlemesi %{averageProgress}
              </span>
              <span className="rounded-full bg-white px-4 py-2 font-mono text-sm text-slate-700 shadow-[0_10px_24px_-22px_rgba(46,9,136,0.22)]">
                Destek hazırlığı %{supportProgress}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
