export type SupportProject = {
  id: string;
  title: string;
  organization: string;
  city: string;
  category: string;
  summary: string;
  goal: string;
  progress: number;
  volunteersNeeded: number;
  supportType: string;
  seed: string;
};

export const supportProjects: SupportProject[] = [
  {
    id: "mentorluk-aglari",
    title: "Anadolu kurucuları için gönüllü mentorluk ağı",
    organization: "Fonova Etki Programı",
    city: "Eskişehir",
    category: "Mentorluk",
    summary: "İlk kez şirket kuran ekiplerin finansal model, ürün anlatısı ve yatırımcı sunumu hazırlıklarına destek olur.",
    goal: "40 mentor görüşmesi",
    progress: 62,
    volunteersNeeded: 18,
    supportType: "Zaman ve uzmanlık",
    seed: "starthub-volunteer-mentorship"
  },
  {
    id: "iklim-lab",
    title: "İklim girişimleri için saha doğrulama laboratuvarı",
    organization: "Açık İnovasyon Gönüllüleri",
    city: "İzmir",
    category: "Saha desteği",
    summary: "Erken aşama iklim teknolojilerinin prototip testlerinde mühendislik, ölçüm ve raporlama desteği sağlar.",
    goal: "12 saha testi",
    progress: 48,
    volunteersNeeded: 9,
    supportType: "Teknik gönüllülük",
    seed: "starthub-climate-lab"
  },
  {
    id: "kadin-kurucu-fonu",
    title: "Kadın kurucular için topluluk destek havuzu",
    organization: "Fonova Topluluk",
    city: "İstanbul",
    category: "Topluluk",
    summary: "Gönüllü mikro destekler, tasarım yardımı ve görünürlük katkısıyla kadın kurucuların ilk müşteri görüşmelerini hızlandırır.",
    goal: "120 destekçi",
    progress: 71,
    volunteersNeeded: 32,
    supportType: "Gönüllü katkı",
    seed: "starthub-women-founders"
  }
];
