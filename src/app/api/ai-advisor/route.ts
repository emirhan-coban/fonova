import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";

interface AdvisorRequest {
  message: string;
  sector?: string;
  budget?: string;
  risk?: string;
}

const BUDGET_MAX_KURUS: Record<string, number> = {
  low: 5_000_000,
  mid: 20_000_000,
  high: Infinity,
};

const FAQ: [RegExp, string][] = [
  [
    /kyc|kimlik|doğrula/i,
    "KYC (Know Your Customer), yatırımcıların kimliğini e-Devlet ve banka API'leri üzerinden doğrulama sürecidir. Fonova'da KYC tamamlanmadan yatırım adımına geçilemez; süreç tamamen dijital ve güvenlidir.",
  ],
  [
    /escrow|para.*güven|güven.*para/i,
    "Escrow, yatırılan paranın Takasbank üzerinde tutulduğu güvenlik mekanizmasıdır. Fonlama hedefi gerçekleşmeden girişime para serbest bırakılmaz; hedef tutturulmazsa tüm yatırımcılara otomatik iade başlatılır.",
  ],
  [
    /soğuma|cayma|iptal/i,
    "Taahhüt verdikten sonra 14 gün soğuma süresi bulunur. Bu süre içinde hiçbir ücret ödemeden yatırımdan vazgeçebilirsiniz. Sistem bunu otomatik takip eder.",
  ],
  [
    /pay|hisse|equity|oran/i,
    "Paya dayalı kitle fonlamasında yatırımcılar, kampanya sayfasında belirtilen pay oranında girişimin hissedarı olur. Pay sahipliği MKK (Merkezi Kayıt Kuruluşu) üzerinden resmi olarak tescil edilir.",
  ],
  [
    /güvenlik|şifre|aes|csrf|veri.*koru/i,
    "Fonova'da güvenlik mimariye entegre edilmiştir: AES-256-GCM şifreleme, namespace bazlı rate limiting, cryptographically secure CSRF token'lar, CSP + HSTS güvenlik başlıkları ve tüm işlemlerin immutable audit log'u standart olarak uygulanır.",
  ],
  [
    /nasıl.*çalış|süreç|adım/i,
    "Fonova 5 adımda çalışır: 1) Kayıt ve KYC → 2) Kampanyaları keşfet → 3) Taahhüt ver (uyum kontrolleri anında) → 4) Para Takasbank escrow'da güvende tutulur → 5) Hedef tutulursa MKK pay kaydı, tutulmazsa otomatik iade.",
  ],
  [
    /mkk|merke.*kayıt/i,
    "MKK (Merkezi Kayıt Kuruluşu), Türkiye'de menkul kıymet kayıt sistemini yöneten resmi kuruluştur. Fonova, yatırım tamamlandığında pay sahipliğini MKK'ya otomatik bildirir.",
  ],
  [
    /limit|yıllık.*limit|ne kadar yatır/i,
    "Perakende yatırımcılar için yıllık yatırım limiti otomatik denetlenir. Limit aşımında sistem uyarır ve taahhüt engellenir. Nitelikli yatırımcılar için farklı limitler geçerlidir.",
  ],
  [
    /mentor|gönüllü|destek|topluluk/i,
    "Destek Modülü'nde para yatırmadan mentorluk, saha testi ve topluluk katkısı sağlayabilirsiniz. Uzmanlığınızı ve zamanınızı Türkiye girişim ekosistemine katkı olarak sunun.",
  ],
  [
    /yapay.*zeka|ai|fonova.*ai/i,
    "Fonova AI, girişimcilik ekosistemine özel olarak tasarlanmış bir yatırım danışmanlığı aracıdır. Sektör, bütçe ve risk profilinize göre kampanya eşleştirmesi yapar ve platform hakkındaki sorularınızı yanıtlar.",
  ],
];

function faqMatch(msg: string): string | null {
  for (const [pattern, answer] of FAQ) {
    if (pattern.test(msg)) return answer;
  }
  return null;
}

function scoreCampaign(
  campaign: { company: { sector: string }; minInvestmentKurus: number; riskRating: string },
  sector: string,
  budget: string,
  risk: string
): number {
  let score = 0;
  const companySector = campaign.company.sector.toLocaleLowerCase("tr-TR");
  const sectorKey = sector.toLocaleLowerCase("tr-TR");

  if (sectorKey === "hepsi" || companySector.includes(sectorKey)) score += 3;

  const maxKurus = BUDGET_MAX_KURUS[budget] ?? Infinity;
  if (campaign.minInvestmentKurus <= maxKurus) score += 2;

  const riskMap: Record<string, string[]> = {
    low: ["düşük", "low"],
    mid: ["orta", "medium", "moderate"],
    high: ["yüksek", "high"],
  };
  const terms = riskMap[risk] ?? [];
  if (terms.some((t) => campaign.riskRating.toLocaleLowerCase("tr-TR").includes(t))) score += 1;

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const body: AdvisorRequest = await req.json();
    const { message, sector, budget, risk } = body;

    if (sector && budget && risk) {
      const campaigns = await prisma.campaign.findMany({
        where: { status: CampaignStatus.LIVE },
        include: { company: true },
      });

      const scored = campaigns
        .map((c) => ({ ...c, _score: scoreCampaign(c, sector, budget, risk) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 3);

      if (scored.length === 0) {
        return NextResponse.json({
          reply:
            "Şu anda profilinize tam uyan canlı bir kampanya bulunamadı, ancak yakında yenileri ekleniyor. Gönüllü destek projelerini incelemek ister misiniz?",
          action: "no-match",
        });
      }

      return NextResponse.json({
        reply: `Profilinize göre ${scored.length} kampanya buldum. İşte size en uygun olanlar:`,
        campaigns: scored.map((c) => ({
          name: c.company.name,
          sector: c.company.sector,
          slug: c.slug,
          title: c.title,
          progress: Math.round((c.committedAmountKurus / c.targetAmountKurus) * 100),
          equity: c.equityOfferedBps / 100,
          riskRating: c.riskRating,
        })),
        action: "show-campaigns",
      });
    }

    const faqAnswer = faqMatch(message ?? "");
    if (faqAnswer) {
      return NextResponse.json({ reply: faqAnswer, action: "faq" });
    }

    return NextResponse.json({
      reply:
        "Sorunuzu tam anlayamadım. KYC, escrow, soğuma süresi, pay oranı veya güvenlik konularında soru sorabilir ya da yatırım profilinizi oluşturmak için sol taraftaki seçenekleri kullanabilirsiniz.",
      action: "fallback",
    });
  } catch {
    return NextResponse.json(
      { reply: "Bir hata oluştu, lütfen tekrar deneyin.", action: "error" },
      { status: 500 }
    );
  }
}
