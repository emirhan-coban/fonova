import { ComplianceStatus, KycStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { mockKycAdapter } from "@/lib/adapters/mock";
import type { ServiceResult } from "./types";

export async function verifyInvestorKyc(input: {
  investorEmail: string;
  fullName: string;
  tcKimlikNo: string;
}): Promise<ServiceResult<{ kycStatus: KycStatus }>> {
  const user = await prisma.user.findUnique({
    where: { email: input.investorEmail },
    include: { investorProfile: true }
  });

  if (!user || !user.investorProfile) {
    return { ok: false, message: "Yatırımcı profili bulunamadı." };
  }

  if (user.investorProfile.kycStatus === KycStatus.VERIFIED) {
    return {
      ok: true,
      message: "KYC doğrulaması zaten tamamlanmış.",
      data: { kycStatus: KycStatus.VERIFIED }
    };
  }

  const result = await mockKycAdapter.verifyIdentity({
    userId: user.id,
    fullName: input.fullName,
    tcKimlikNo: input.tcKimlikNo
  });

  if (!result.ok) {
    await prisma.complianceCheck.create({
      data: {
        userId: user.id,
        type: "KYC_VERIFICATION",
        status: ComplianceStatus.BLOCKED,
        code: result.code,
        message: result.message,
        metadata: JSON.stringify({ reference: result.reference })
      }
    });
    return {
      ok: false,
      message: result.message,
      data: { kycStatus: KycStatus.REJECTED }
    };
  }

  await prisma.$transaction([
    prisma.investorProfile.update({
      where: { userId: user.id },
      data: { kycStatus: KycStatus.VERIFIED }
    }),
    prisma.complianceCheck.create({
      data: {
        userId: user.id,
        type: "KYC_VERIFICATION",
        status: ComplianceStatus.PASSED,
        code: result.code,
        message: result.message,
        metadata: JSON.stringify({ reference: result.reference })
      }
    })
  ]);

  return {
    ok: true,
    message: "KYC doğrulaması başarıyla tamamlandı.",
    data: { kycStatus: KycStatus.VERIFIED }
  };
}

export async function getKycStatus(investorEmail: string): Promise<ServiceResult<{ kycStatus: KycStatus }>> {
  const user = await prisma.user.findUnique({
    where: { email: investorEmail },
    include: { investorProfile: true }
  });

  if (!user || !user.investorProfile) {
    return { ok: false, message: "Yatırımcı profili bulunamadı." };
  }

  return {
    ok: true,
    message: `KYC durumu: ${user.investorProfile.kycStatus}`,
    data: { kycStatus: user.investorProfile.kycStatus }
  };
}
