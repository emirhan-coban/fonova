export type AdapterResult = {
  ok: boolean;
  reference: string;
  code: string;
  message: string;
};

export interface MkkAdapter {
  decreaseLimit(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
  increaseLimit(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
  registerRightOwner(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
}

export interface EscrowAdapter {
  holdFunds(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
  releaseFunds(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
  refundFunds(input: { investorId: string; campaignId: string; amountKurus: number }): Promise<AdapterResult>;
}

export interface KycAdapter {
  verifyIdentity(input: { userId: string; fullName: string; identityHint: string }): Promise<AdapterResult>;
}
