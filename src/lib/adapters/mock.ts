import type { EscrowAdapter, KycAdapter, MkkAdapter } from "./types";

function reference(prefix: string) {
  return `${prefix}-MOCK-${Math.floor(10_000 + Math.random() * 89_999)}`;
}

export const mockMkkAdapter: MkkAdapter = {
  async decreaseLimit() {
    return {
      ok: true,
      reference: reference("MKK-LIMIT"),
      code: "ELM00",
      message: "MKK simülasyonu limit düşümü başarılı."
    };
  },
  async increaseLimit() {
    return {
      ok: true,
      reference: reference("MKK-RELEASE"),
      code: "ELR00",
      message: "MKK simülasyonu limit iadesi başarılı."
    };
  },
  async registerRightOwner() {
    return {
      ok: true,
      reference: reference("MKK-RIGHT"),
      code: "MKS00",
      message: "Hak sahipliği kaydı simülasyonu oluşturuldu."
    };
  }
};

export const mockEscrowAdapter: EscrowAdapter = {
  async holdFunds() {
    return {
      ok: true,
      reference: reference("ESCROW-HOLD"),
      code: "TKS00",
      message: "Takasbank blokaj hesabı simülasyonu oluşturuldu."
    };
  },
  async releaseFunds() {
    return {
      ok: true,
      reference: reference("ESCROW-RELEASE"),
      code: "TKS01",
      message: "Takasbank fon çözümü simülasyonu kaydedildi."
    };
  },
  async refundFunds() {
    return {
      ok: true,
      reference: reference("ESCROW-REFUND"),
      code: "TKS02",
      message: "Takasbank iade akışı simülasyonu kaydedildi."
    };
  }
};

export const mockKycAdapter: KycAdapter = {
  async verifyIdentity(input) {
    return {
      ok: true,
      reference: reference("KYC"),
      code: "KYC00",
      message: `${input.fullName} için kimlik doğrulama simülasyonu başarılı.`
    };
  }
};
