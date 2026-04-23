"use client";

import { useState, useTransition } from "react";

type KycVerificationPanelProps = {
  currentStatus: string;
  investorEmail: string;
};

export function KycVerificationPanel({ currentStatus, investorEmail }: KycVerificationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [tcKimlikNo, setTcKimlikNo] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (currentStatus === "VERIFIED") {
    return (
      <div className="rounded-2xl border border-teal/20 bg-teal/5 p-4">
        <p className="text-sm font-medium text-teal">KYC doğrulaması tamamlanmış</p>
        <p className="mt-1 text-xs text-slate-400">Kimlik doğrulama adımı geçildi. Yatırım yapabilirsiniz.</p>
      </div>
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        const response = await fetch("/api/kyc/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ investorEmail, fullName, tcKimlikNo })
        });
        const data = await response.json();
        setResult(data);
      } catch {
        setResult({ ok: false, message: "Bağlantı hatası oluştu." });
      }
    });
  }

  return (
    <div className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
      <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
        <h2 className="text-xl font-semibold text-white">Kimlik Doğrulama (KYC)</h2>
        <p className="mt-2 text-sm text-slate-400">
          Yatırım yapabilmek için kimlik doğrulama adımını tamamlamanız gerekiyor.
        </p>

        {result && (
          <div className={`mt-4 rounded-xl border p-3 text-sm ${result.ok ? "border-teal/30 bg-teal/10 text-teal" : "border-red-500/30 bg-red-500/10 text-red-400"}`}>
            {result.message}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="kyc-fullname" className="mb-1.5 block text-xs font-medium text-slate-400">
              Ad Soyad
            </label>
            <input
              id="kyc-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Deniz Arman"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor="kyc-tc" className="mb-1.5 block text-xs font-medium text-slate-400">
              TC Kimlik Numarası
            </label>
            <input
              id="kyc-tc"
              type="text"
              value={tcKimlikNo}
              onChange={(e) => setTcKimlikNo(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="12345678901"
              maxLength={11}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 font-mono text-sm text-white placeholder:text-slate-600 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>
          <button
            type="button"
            disabled={isPending || fullName.length < 2 || tcKimlikNo.length !== 11}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-22px_rgba(46,9,136,0.42)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Doğrulanıyor..." : "Kimliği Doğrula"}
          </button>
        </div>

        <p className="mt-4 text-[10px] text-slate-500">
          Demo ortamında kimlik doğrulama simülasyon ile gerçekleşir. Gerçek ortamda e-Devlet veya banka API&apos;si kullanılacaktır.
        </p>
      </div>
    </div>
  );
}
