import { NextResponse } from "next/server";
import { z } from "zod";
import { applyToVolunteer, listActiveSupportProjects } from "@/lib/services/donations";
import { checkRateLimit } from "@/lib/security/rate-limiter";

const applySchema = z.object({
  supportProjectId: z.string().min(1),
  userEmail: z.string().email().default("yatirimci@starthub.test"),
  message: z.string().min(1).max(500)
});

export async function GET() {
  const projects = await listActiveSupportProjects();
  return NextResponse.json({ ok: true, data: projects });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, "donations", { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, message: "Çok fazla başvuru isteği. Lütfen bekleyin." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
    );
  }

  const body = await request.json();
  const parsed = applySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Başvuru doğrulanamadı.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await applyToVolunteer(parsed.data);
  return NextResponse.json(result, { status: result.ok ? 201 : 422 });
}
