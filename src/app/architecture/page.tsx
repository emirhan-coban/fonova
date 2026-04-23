import { ArrowsClockwise, Database, FlowArrow, GitBranch, LockKey, Queue, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { MetricPill } from "@/components/MetricPill";

const layers = [
  {
    icon: FlowArrow,
    title: "İstemci ve API katmanı",
    body: "Next.js App Router, yatırımcı pazar yeri, girişimci paneli, yönetim paneli ve JSON API route'larını tek MVP içinde toplar."
  },
  {
    icon: ShieldCheck,
    title: "Uyum motoru",
    body: "Yatırımcı limiti, kampanya açık kapasitesi, KYC durumu ve 48 saat cayma penceresi aynı servis katmanında kontrol edilir."
  },
  {
    icon: Database,
    title: "Kayıt ve denetim defteri",
    body: "Prisma modeli, kampanya, yatırım taahhüdü, simülasyon defteri ve uyum kayıtlarını ilişkisel olarak tutar."
  },
  {
    icon: ArrowsClockwise,
    title: "MKK adapter sınırı",
    body: "Limit düşümü, limit iadesi ve hak sahipliği kaydı benzeri akışlar simülasyon adaptörüyle ayrılmıştır."
  },
  {
    icon: Queue,
    title: "Takasbank emanet sınırı",
    body: "Fon blokajı, iade ve çözüm işlemleri canlı para hareketi olmadan ledger kayıtlarına yazılır."
  },
  {
    icon: LockKey,
    title: "Güvenli veri odası",
    body: "Filigranlı görüntüleme, indirme kapalı doküman deneyimi ve sayfa bazlı ilgi analitiği MVP'de görünürdür."
  }
];

const roadmap = [
    "Canlı KYC/KYB sağlayıcısı adaptöre bağlanır.",
  "MKK KFS test ortamı ile gerçek hata kodu eşleştirmesi yapılır.",
  "Takasbank emanet hesap akışı üretim öncesi sandbox'a taşınır.",
  "Kampanya kapanışında hak sahipliği ve pay dağıtımı otomatikleştirilir.",
    "Kurumsal Fonova Pro tarafına IRR, runway ve portföy değerleme hesapları eklenir."
];

export default function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <MetricPill label="Mimari" value="MVP omurgası" tone="teal" />
          <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
            Regülasyona hazır ürün akışı, simülasyon entegrasyonlarıyla ayrıştırıldı
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Bu sürüm mikroservis üretim mimarisinin tek depoda çalışan MVP izdüşümüdür. İş alanı servisleri, adaptör
            sınırları ve denetim kayıtları ileride ayrı servislere bölünecek şekilde ayrılmıştır.
          </p>
        </div>
        <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
          <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
            <div className="flex items-center gap-3">
              <GitBranch className="text-accent" size={30} weight="duotone" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Akış</p>
                <p className="text-xl font-semibold text-white">Başvuru → Komite → Yayın → Taahhüt → Cayma → Kayıt</p>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-3 text-xs min-[390px]:grid-cols-2">
              {["Next.js", "Prisma", "SQLite", "MKK simülasyonu", "Takasbank simülasyonu", "Güvenli görüntüleyici"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-10 sm:py-12 md:grid-cols-2 xl:grid-cols-3">
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <article key={layer.title} className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
              <div className="inner-bezel h-full rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-teal/10 text-teal">
                  <Icon size={25} weight="duotone" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-white">{layer.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{layer.body}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
        <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white">Pilot sürüme geçiş adımları</h2>
          <div className="mt-6 divide-y divide-white/[0.06]">
            {roadmap.map((item, index) => (
              <div key={item} className="grid gap-4 py-5 md:grid-cols-[90px_1fr]">
                <span className="font-mono text-xs text-accent">ADIM {index + 1}</span>
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
