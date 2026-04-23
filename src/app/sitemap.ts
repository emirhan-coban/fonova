import type { MetadataRoute } from "next";
import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fonova.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: [CampaignStatus.LIVE, CampaignStatus.FUNDED] } },
    select: { slug: true, updatedAt: true }
  });

  const campaignEntries: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${SITE_URL}/campaigns/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "daily",
    priority: 0.9
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/compliance`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/founder`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/architecture`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 }
  ];

  return [...staticPages, ...campaignEntries];
}
