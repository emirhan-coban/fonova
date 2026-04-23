import { PrismaClient, CampaignStatus, CompanyStatus, KycStatus, Role, InvestorTier, InvestmentStatus, LedgerEntryType, ComplianceStatus, ReviewDecision, SupportProjectStatus } from "@prisma/client";

const prisma = new PrismaClient();

const tl = (value: number) => Math.round(value * 100);

async function main() {
  await prisma.volunteerContribution.deleteMany();
  await prisma.supportProject.deleteMany();
  await prisma.mockLedgerEntry.deleteMany();
  await prisma.complianceCheck.deleteMany();
  await prisma.documentView.deleteMany();
  await prisma.investmentIntent.deleteMany();
  await prisma.adminReview.deleteMany();
  await prisma.campaignDocument.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.company.deleteMany();
  await prisma.investorProfile.deleteMany();
  await prisma.user.deleteMany();

  const investor = await prisma.user.create({
    data: {
      email: "yatirimci@starthub.test",
      name: "Deniz Arman",
      password: "demo1234",
      role: Role.INVESTOR,
      investorProfile: {
        create: {
          tier: InvestorTier.RETAIL,
          kycStatus: KycStatus.VERIFIED,
          annualIncomeKurus: tl(8_400_000),
          yearlyLimitKurus: tl(840_000),
          usedLimitKurus: tl(180_000),
          mkkSicilNo: "MKK-TR-827194",
          riskScore: 38
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: "proyatirimci@starthub.test",
      name: "Selin Koral",
      password: "demo1234",
      role: Role.INVESTOR,
      investorProfile: {
        create: {
          tier: InvestorTier.QUALIFIED,
          kycStatus: KycStatus.VERIFIED,
          annualIncomeKurus: tl(18_000_000),
          yearlyLimitKurus: tl(2_000_000),
          usedLimitKurus: tl(640_000),
          mkkSicilNo: "MKK-TR-440219",
          riskScore: 24
        }
      }
    }
  });

  const founder = await prisma.user.create({
    data: {
      email: "kurucu@starthub.test",
      name: "Ece Yalın",
      password: "demo1234",
      role: Role.FOUNDER
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@starthub.test",
      name: "Mert Sancak",
      password: "demo1234",
      role: Role.ADMIN
    }
  });

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        founderId: founder.id,
        name: "Nuvia Robotics",
        slug: "nuvia-robotics",
        sector: "Robotik",
        city: "İstanbul",
        foundedYear: 2023,
        incorporationType: "Anonim Şirket",
        description: "Depo operasyonları için yerli otonom taşıma robotları geliştiren donanım ve yazılım girişimi.",
        status: CompanyStatus.APPROVED,
        logoSeed: "nuvia-metal"
      }
    }),
    prisma.company.create({
      data: {
        founderId: founder.id,
        name: "Lodos BioMaterials",
        slug: "lodos-biomaterials",
        sector: "Sürdürülebilir Malzeme",
        city: "Izmir",
        foundedYear: 2022,
        incorporationType: "Anonim Şirket",
        description: "Zeytin posasından kompostlanabilir ambalaj ham maddesi üreten iklim teknolojisi şirketi.",
        status: CompanyStatus.APPROVED,
        logoSeed: "lodos-fiber"
      }
    }),
    prisma.company.create({
      data: {
        founderId: founder.id,
        name: "AstraPay Labs",
        slug: "astrapay-labs",
        sector: "Fintech",
        city: "Ankara",
        foundedYear: 2024,
        incorporationType: "Limited Şirket",
        description: "KOBİ'ler için fatura temlikini sade hale getiren erken ödeme ve risk skorlama platformu.",
        status: CompanyStatus.UNDER_REVIEW,
        logoSeed: "astrapay-ledger"
      }
    })
  ]);

  const now = new Date();
  const liveStart = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8);
  const liveEnd = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 22);

  const nuvia = await prisma.campaign.create({
    data: {
      companyId: companies[0].id,
      slug: "nuvia-robotics-tohum-turu",
      title: "Otonom depo robotları için seri üretim turu",
      summary: "Nuvia, orta ölçekli depolarda 47 dakikada kurulabilen robot filosu ile taşıma maliyetini düşürüyor.",
      longPitch: "Nuvia Robotics, e-ticaret depolarında pik saatlerde ortaya çıkan insan gücü darboğazını hedefliyor. MVP robotlar üç pilot depoda 1.840 saat çalıştı ve hasarlı taşıma oranını belirgin biçimde azalttı. Bu tur, yerli üretim kalıplarının tamamlanması, filo yönetim yazılımının güvenlik sertifikasyonu ve İstanbul merkezli satış ekibinin kurulması için kullanılacak.",
      status: CampaignStatus.LIVE,
      targetAmountKurus: tl(7_500_000),
      minInvestmentKurus: tl(5_000),
      committedAmountKurus: tl(4_280_000),
      equityOfferedBps: 850,
      startDate: liveStart,
      endDate: liveEnd,
      publishedAt: liveStart,
      approvedAt: new Date(liveStart.getTime() - 1000 * 60 * 60 * 18),
      coverSeed: "nuvia-robotics-warehouse",
      riskRating: "Orta",
      leadInvestorName: "Kuzey Portfoy Girisim Fonu",
      leadCommitmentKurus: tl(1_200_000),
      documents: {
        create: [
          {
            title: "Yatırımcı Sunumu",
            pageCount: 18,
            restricted: true,
            watermarkEnabled: true,
            views: 214,
            engagementScore: 82
          }
        ]
      }
    }
  });

  await prisma.campaign.create({
    data: {
      companyId: companies[1].id,
      slug: "lodos-biomaterials-iklim-turu",
      title: "Zeytin atığından endüstriyel ambalaj ham maddesi",
      summary: "Lodos, Ege bölgesindeki tarımsal atığı yüksek marjlı biyomalzemeye dönüştüren üretim hattını büyütüyor.",
      longPitch: "Lodos BioMaterials, gıda ve kozmetik markalarının plastik ambalaj baskısını azaltması için zeytin posası bazlı kompozit granüller üretiyor. Laboratuvar ölçeğinden pilot hatta geçildi; fon, aylık kapasitenin 14 tondan 58 tona çıkarılmasını ve iki kurumsal tedarik sözleşmesinin finansmanını kapsayacak.",
      status: CampaignStatus.LIVE,
      targetAmountKurus: tl(5_200_000),
      minInvestmentKurus: tl(3_000),
      committedAmountKurus: tl(2_130_000),
      equityOfferedBps: 720,
      startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
      endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 27),
      publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3),
      approvedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
      coverSeed: "lodos-biomaterial-factory",
      riskRating: "Orta-Yuksek",
      leadInvestorName: "Marmara Impact Angels",
      leadCommitmentKurus: tl(680_000),
      documents: {
        create: [
          {
            title: "Üretim ve Finansal Model",
            pageCount: 22,
            restricted: true,
            watermarkEnabled: true,
            views: 148,
            engagementScore: 76
          }
        ]
      }
    }
  });

  await prisma.campaign.create({
    data: {
      companyId: companies[2].id,
      slug: "astrapay-labs-inceleme",
      title: "KOBİ erken ödeme ağı için ön inceleme",
      summary: "AstraPay, fatura riskini canlı skorlayan ve alacak finansmanını sadeleştiren bir fintech altyapısı kuruyor.",
      longPitch: "AstraPay Labs henüz komite incelemesinde. Model, KOBİ'lerin onaylı faturalarını tedarik zinciri verileriyle skorlayarak erken ödeme tekliflerine dönüştürüyor. MVP'de bu kampanya yatırımcıya açık değil, yönetim kuyruğunda karar bekliyor.",
      status: CampaignStatus.UNDER_REVIEW,
      targetAmountKurus: tl(6_400_000),
      minInvestmentKurus: tl(10_000),
      committedAmountKurus: 0,
      equityOfferedBps: 930,
      startDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      endDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 37),
      coverSeed: "astrapay-fintech-ledger",
      riskRating: "Yuksek",
      leadInvestorName: "Onay Bekliyor",
      leadCommitmentKurus: 0,
      documents: {
        create: [
          {
            title: "Komite Bilgi Formu Taslağı",
            pageCount: 15,
            restricted: true,
            watermarkEnabled: true,
            views: 24,
            engagementScore: 41
          }
        ]
      }
    }
  });

  const coolingOffEndsAt = new Date(now.getTime() + 1000 * 60 * 60 * 35);
  const investment = await prisma.investmentIntent.create({
    data: {
      campaignId: nuvia.id,
      investorId: investor.id,
      amountKurus: tl(80_000),
      status: InvestmentStatus.PENDING_COOLING_OFF,
      coolingOffEndsAt,
      mkkReference: "MKK-MOCK-7731",
      escrowReference: "ESCROW-MOCK-5508",
      ledgerEntries: {
        create: [
          {
            type: LedgerEntryType.ESCROW_HOLD,
            amountKurus: tl(80_000),
            description: "Takasbank blokaj hesabı simülasyonu oluşturuldu."
          },
          {
            type: LedgerEntryType.LIMIT_DECREASE,
            amountKurus: tl(80_000),
            description: "MKK limit düşümü simülasyonu kaydedildi."
          }
        ]
      }
    }
  });

  await prisma.complianceCheck.createMany({
    data: [
      {
        userId: investor.id,
        campaignId: nuvia.id,
        investmentId: investment.id,
        type: "INVESTOR_LIMIT",
        status: ComplianceStatus.PASSED,
        code: "ELM00",
        message: "Yatırımcı yıllık limit içinde.",
        metadata: JSON.stringify({ adapter: "MockMkkAdapter", remainingLimitKurus: tl(580_000) })
      },
      {
        campaignId: nuvia.id,
        type: "COMMITTEE_REVIEW",
        status: ComplianceStatus.PASSED,
        code: "KOM00",
        message: "Komite onayı ve bilgi formu kontrolü tamamlandı.",
        metadata: JSON.stringify({ reviewer: admin.email })
      }
    ]
  });

  await prisma.adminReview.create({
    data: {
      campaignId: nuvia.id,
      reviewerId: admin.id,
      decision: ReviewDecision.APPROVED,
      note: "Demo veri seti için kampanya yayına alınmıştır."
    }
  });

  await prisma.supportProject.createMany({
    data: [
      {
        title: "Anadolu kurucuları için gönüllü mentorluk ağı",
        organization: "Fonova Etki Programı",
        city: "Eskişehir",
        category: "Mentorluk",
        summary: "İlk kez şirket kuran ekiplerin finansal model, ürün anlatısı ve yatırımcı sunumu hazırlıklarına destek olur.",
        goal: "40 mentor görüşmesi",
        progress: 62,
        volunteersNeeded: 18,
        supportType: "Zaman ve uzmanlık",
        seed: "starthub-volunteer-mentorship",
        status: SupportProjectStatus.ACTIVE
      },
      {
        title: "İklim girişimleri için saha doğrulama laboratuvarı",
        organization: "Açık İnovasyon Gönüllüleri",
        city: "İzmir",
        category: "Saha desteği",
        summary: "Erken aşama iklim teknolojilerinin prototip testlerinde mühendislik, ölçüm ve raporlama desteği sağlar.",
        goal: "12 saha testi",
        progress: 48,
        volunteersNeeded: 9,
        supportType: "Teknik gönüllülük",
        seed: "starthub-climate-lab",
        status: SupportProjectStatus.ACTIVE
      },
      {
        title: "Kadın kurucular için topluluk destek havuzu",
        organization: "Fonova Topluluk",
        city: "İstanbul",
        category: "Topluluk",
        summary: "Gönüllü mikro destekler, tasarım yardımı ve görünürlük katkısıyla kadın kurucuların ilk müşteri görüşmelerini hızlandırır.",
        goal: "120 destekçi",
        progress: 71,
        volunteersNeeded: 32,
        supportType: "Gönüllü katkı",
        seed: "starthub-women-founders",
        status: SupportProjectStatus.ACTIVE
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
