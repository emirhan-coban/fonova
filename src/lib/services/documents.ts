import { prisma } from "@/lib/db";

export async function recordDocumentView(input: {
  documentId: string;
  userId: string;
  page: number;
  seconds: number;
}) {
  const seconds = Math.max(1, Math.min(600, input.seconds));

  await prisma.$transaction(async (tx) => {
    await tx.documentView.create({
      data: {
        documentId: input.documentId,
        userId: input.userId,
        page: input.page,
        seconds
      }
    });

    await tx.campaignDocument.update({
      where: { id: input.documentId },
      data: {
        views: { increment: 1 },
        engagementScore: { increment: Math.min(3, Math.ceil(seconds / 90)) }
      }
    });
  });
}
