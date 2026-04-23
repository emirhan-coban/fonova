import Link from "next/link";
import { Eye, FileLock, Fingerprint, ShieldCheck, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { MetricPill } from "@/components/MetricPill";
import { prisma } from "@/lib/db";
import { campaignStatusLabel } from "@/lib/labels";

export default async function DataRoomPage() {
  const documents = await prisma.campaignDocument.findMany({
    include: {
      campaign: {
        include: { company: true }
      },
      documentViews: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: { engagementScore: "desc" }
  });

  const totalViews = documents.reduce((sum, doc) => sum + doc.views, 0);
  const averageScore = documents.length ? Math.round(documents.reduce((sum, doc) => sum + doc.engagementScore, 0) / documents.length) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <MetricPill label="Veri Odası" value="DRM simülasyonu" tone="teal" />
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Güvenli doküman görüntüleme ve yatırımcı ilgi analitiği
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Pitch deck indirme kapalıdır, görüntüleyenin e-posta izi filigran olarak görünür ve sayfa davranışı
            girişimci panelindeki ilgi skoruna dönüşür.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel grid gap-3 rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:grid-cols-3 sm:p-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <Eye className="mb-4 text-teal" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">{totalViews}</p>
              <p className="mt-1 text-xs text-slate-500">Toplam görüntüleme</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <TrendUp className="mb-4 text-accent" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">{averageScore}</p>
              <p className="mt-1 text-xs text-slate-500">Ortalama ilgi skoru</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <ShieldCheck className="mb-4 text-teal" size={24} weight="duotone" />
              <p className="font-mono text-2xl text-white">%100</p>
              <p className="mt-1 text-xs text-slate-500">Filigranlı dosya</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 lg:grid-cols-3">
        {documents.map((document) => (
          <article key={document.id} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
            <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="grid size-12 place-items-center rounded-xl bg-teal/10 text-teal">
                  <FileLock size={25} weight="duotone" />
                </div>
                <MetricPill label="Durum" value={campaignStatusLabel(document.campaign.status)} tone="teal" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{document.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{document.campaign.company.name}</p>
              <div className="mt-6 grid grid-cols-1 gap-3 text-xs min-[390px]:grid-cols-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">Sayfa</p>
                  <p className="mt-1 font-mono text-white">{document.pageCount}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">İzleme</p>
                  <p className="mt-1 font-mono text-white">{document.views}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <p className="text-slate-500">Skor</p>
                  <p className="mt-1 font-mono text-white">{document.engagementScore}</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-navy-950/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                  <Fingerprint size={15} weight="duotone" />
                  <span>Son görüntüleme kayıtları</span>
                </div>
                {document.documentViews.length === 0 ? (
                  <p className="text-sm text-slate-500">Henüz görüntüleme yok.</p>
                ) : (
                  <div className="space-y-2">
                    {document.documentViews.map((view) => (
                      <p key={view.id} className="text-xs text-slate-400">
                        {view.user.name} / sayfa {view.page} / {view.seconds} sn
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/campaigns/${document.campaign.slug}`}
                className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.98]"
              >
                Güvenli görüntüleyiciye git
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
