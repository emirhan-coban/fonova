import Link from "next/link";
import type { Campaign, Company } from "@prisma/client";
import {
  ChartLineUp,
  Circuitry,
  Clock,
  Leaf,
  TrendUp
} from "@phosphor-icons/react/dist/ssr";
import { campaignProgress, daysRemaining } from "@/lib/campaigns";
import { campaignStatusLabel } from "@/lib/labels";
import { formatCompactTRY } from "@/lib/money";
import { MetricPill } from "./MetricPill";

type CampaignWithCompany = Campaign & {
  company: Company;
};

function getCampaignArtwork(sector: string) {
  const normalized = sector.toLocaleLowerCase("tr-TR");

  if (normalized.includes("robot")) {
    return {
      Icon: Circuitry,
      shell: "from-[#f7f4ff] via-[#ebe4ff] to-[#ded5ff]",
      orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(46,9,136,0.9),rgba(46,9,136,0.12)_55%,transparent_70%)]",
      beam: "from-[#2E0988]/90 via-[#2E0988]/38 to-transparent",
      panel: "border-white/70 bg-white/50"
    };
  }

  if (normalized.includes("sürdürülebilir") || normalized.includes("malzeme")) {
    return {
      Icon: Leaf,
      shell: "from-[#f7f4ff] via-[#eee8ff] to-[#e2d9ff]",
      orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(46,9,136,0.82),rgba(46,9,136,0.12)_58%,transparent_74%)]",
      beam: "from-[#2E0988]/82 via-[#2E0988]/32 to-transparent",
      panel: "border-white/70 bg-white/56"
    };
  }

  return {
    Icon: TrendUp,
    shell: "from-[#f7f5ff] via-[#ece8ff] to-[#dfd7ff]",
    orb: "bg-[radial-gradient(circle_at_30%_30%,rgba(46,9,136,0.82),rgba(139,99,246,0.18)_58%,transparent_74%)]",
    beam: "from-[#2E0988]/88 via-[#2E0988]/40 to-transparent",
    panel: "border-white/70 bg-white/52"
  };
}

export function CampaignCard({ campaign }: { campaign: CampaignWithCompany }) {
  const progress = campaignProgress(campaign);
  const isLive = campaign.status === "LIVE";
  const artwork = getCampaignArtwork(campaign.company.sector);
  const CoverIcon = artwork.Icon;

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_58px_-50px_rgba(46,9,136,0.16)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-accent/20 focus-visible:focus-ring"
    >
      <article className="flex h-full min-h-[420px] flex-col sm:min-h-[500px]">
        <div className={`relative min-h-[12rem] overflow-hidden bg-gradient-to-br ${artwork.shell} sm:min-h-[14rem]`}>
          <div className={`absolute -left-8 top-5 h-28 w-28 rounded-full blur-2xl ${artwork.orb}`} />
          <div className={`absolute right-0 top-0 h-full w-2/3 bg-gradient-to-bl ${artwork.beam}`} />
          <div className="absolute inset-x-6 bottom-6 top-6 rounded-[1.75rem] border border-white/60 bg-white/26 backdrop-blur-md" />
          <div className={`absolute left-8 top-8 rounded-[1.5rem] border px-4 py-3 shadow-[0_20px_45px_-28px_rgba(46,9,136,0.35)] backdrop-blur-md ${artwork.panel}`}>
            <CoverIcon size={28} weight="duotone" className="text-accent" />
          </div>
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">{campaign.company.sector}</p>
                <p className="mt-2 max-w-[18rem] text-lg font-semibold leading-tight text-slate-950">{campaign.company.name}</p>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 backdrop-blur-md ${
                  isLive
                    ? "border-accent/15 bg-white/90 text-accent"
                    : "border-slate-200 bg-white/86 text-slate-600"
                }`}
              >
                {isLive ? <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> : null}
                <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                  {isLive ? "Aktif" : campaignStatusLabel(campaign.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <MetricPill label={campaign.company.sector} value={campaign.riskRating} tone="neutral" />
            <MetricPill label="Kalan" value={`${daysRemaining(campaign.endDate)} gün`} tone="teal" />
          </div>

          <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-2xl">{campaign.title}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{campaign.summary}</p>

          <div className="mt-auto pt-6">
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Toplanan</p>
                <p className="font-mono text-lg text-slate-950">
                  {formatCompactTRY(campaign.committedAmountKurus)}{" "}
                  <span className="text-slate-400">/ {formatCompactTRY(campaign.targetAmountKurus)}</span>
                </p>
              </div>
              <p className="font-mono text-sm font-semibold text-accent">%{progress}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-light transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 flex gap-3 sm:gap-4">
              <div className="flex-1 border-r border-slate-200">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <ChartLineUp size={13} weight="duotone" />
                  <span>Pay Oranı</span>
                </div>
                <p className="font-mono text-sm text-slate-950">{campaign.equityOfferedBps / 100}% pay</p>
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <Clock size={13} weight="duotone" />
                  <span>Süre</span>
                </div>
                <p className="font-mono text-sm text-slate-950">{daysRemaining(campaign.endDate)} gün</p>
              </div>
            </div>

            <span className="mt-6 block w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-800 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:bg-slate-50 hover:text-accent active:scale-[0.98]">
              Kampanyayı İncele
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
