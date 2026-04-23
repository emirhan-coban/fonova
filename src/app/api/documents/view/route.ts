import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { recordDocumentView } from "@/lib/services/documents";

const schema = z.object({
  documentId: z.string().min(1),
  page: z.number().int().min(1),
  seconds: z.number().int().min(1).max(600)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Doküman görüntüleme kaydı doğrulanamadı." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: "yatirimci@starthub.test" } });
  if (!user) {
    return NextResponse.json({ ok: false, message: "Demo yatırımcı bulunamadı." }, { status: 404 });
  }

  await recordDocumentView({
    ...parsed.data,
    userId: user.id
  });

  return NextResponse.json({ ok: true, message: "Doküman görüntüleme kaydı oluşturuldu." });
}
