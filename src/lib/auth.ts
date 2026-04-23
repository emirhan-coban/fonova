import { prisma } from "@/lib/db";

export async function getDemoUser() {
  const email = "yatirimci@starthub.test";
  return prisma.user.findUnique({
    where: { email },
    include: { investorProfile: true }
  });
}

export async function getDemoAdmin() {
  return prisma.user.findUnique({
    where: { email: "admin@starthub.test" }
  });
}
