import { SupportProjectStatus, VolunteerStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ServiceResult } from "./types";

export async function listActiveSupportProjects() {
  return prisma.supportProject.findMany({
    where: { status: SupportProjectStatus.ACTIVE },
    include: {
      contributions: {
        where: { status: { in: [VolunteerStatus.ACCEPTED, VolunteerStatus.COMPLETED] } }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getSupportProject(id: string) {
  return prisma.supportProject.findUnique({
    where: { id },
    include: {
      contributions: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function applyToVolunteer(input: {
  supportProjectId: string;
  userEmail: string;
  message: string;
}): Promise<ServiceResult<{ contributionId: string }>> {
  const [user, project] = await Promise.all([
    prisma.user.findUnique({ where: { email: input.userEmail } }),
    prisma.supportProject.findUnique({ where: { id: input.supportProjectId } })
  ]);

  if (!user) {
    return { ok: false, message: "Kullanıcı bulunamadı." };
  }

  if (!project) {
    return { ok: false, message: "Destek projesi bulunamadı." };
  }

  if (project.status !== SupportProjectStatus.ACTIVE) {
    return { ok: false, message: "Bu destek projesi şu anda aktif değil." };
  }

  const existing = await prisma.volunteerContribution.findFirst({
    where: {
      supportProjectId: project.id,
      userId: user.id,
      status: { in: [VolunteerStatus.APPLIED, VolunteerStatus.ACCEPTED] }
    }
  });

  if (existing) {
    return { ok: false, message: "Bu projeye zaten başvurunuz bulunmaktadır." };
  }

  const contribution = await prisma.volunteerContribution.create({
    data: {
      supportProjectId: project.id,
      userId: user.id,
      message: input.message
    }
  });

  return {
    ok: true,
    message: "Gönüllü başvurunuz alındı.",
    data: { contributionId: contribution.id }
  };
}
