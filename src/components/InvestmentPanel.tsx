"use client";

import React from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import { formatTRY } from "@/lib/money";

export function InvestmentPanel({
  campaignSlug,
  minInvestmentKurus,
  remainingKurus,
  demoRemainingLimitKurus
}: {
  campaignSlug: string;
  minInvestmentKurus: number;
  remainingKurus: number;
  demoRemainingLimitKurus: number;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState(Math.max(minInvestmentKurus, 25_000_00));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cappedAmount = useMemo(() => Math.min(amount, remainingKurus, demoRemainingLimitKurus), [amount, remainingKurus, demoRemainingLimitKurus]);

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug,
          investorEmail: "yatirimci@starthub.test",
          amountKurus: cappedAmount
        })
      });
      const result = (await response.json()) as { ok: boolean; message: string };
      setMessage(result.message);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <section className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
      <div className="inner-bezel rounded-[calc(1.5rem-0.375rem)] p-5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-teal/80">Demo yatırımcı</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Taahhüt oluştur</h2>
          </div>
          <div className="grid size-11 place-items-center rounded-full bg-teal/10 text-teal">
            <ShieldCheck size={22} weight="light" />
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-400">Yatırım tutarı</span>
            <input
              value={Math.round(cappedAmount / 100)}
              onChange={(event) => setAmount(Math.max(0, Number(event.target.value) * 100))}
              className="w-full rounded-2xl border border-white/[0.08] bg-navy-950/60 px-4 py-4 font-mono text-xl text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-accent/50 sm:text-2xl"
              inputMode="numeric"
            />
          </label>

          <input
            type="range"
            min={Math.round(minInvestmentKurus / 100)}
            max={Math.max(Math.round(Math.min(remainingKurus, demoRemainingLimitKurus) / 100), Math.round(minInvestmentKurus / 100))}
            step={1000}
            value={Math.round(cappedAmount / 100)}
            onChange={(event) => setAmount(Number(event.target.value) * 100)}
            className="w-full accent-accent"
          />

          <div className="grid grid-cols-1 gap-3 text-sm min-[390px]:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-slate-500">Kampanya açık limit</p>
              <p className="mt-1 font-mono text-white">{formatTRY(remainingKurus)}</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-slate-500">Demo kalan limit</p>
              <p className="mt-1 font-mono text-white">{formatTRY(demoRemainingLimitKurus)}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={isPending || cappedAmount < minInvestmentKurus || remainingKurus <= 0}
            className="group flex w-full items-center justify-between gap-3 rounded-full bg-accent px-5 py-3 text-left font-semibold text-white shadow-[0_14px_32px_-24px_rgba(124,58,237,0.72)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover hover:shadow-[0_18px_38px_-26px_rgba(124,58,237,0.78)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{isPending ? "Kaydediliyor" : "48 saat cayma hakkıyla taahhüt et"}</span>
            <span className="grid size-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
              <ArrowRight size={18} weight="bold" />
            </span>
          </button>

          {message ? <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-300">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
