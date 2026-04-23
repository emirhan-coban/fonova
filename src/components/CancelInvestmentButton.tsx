"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CancelInvestmentButton({ investmentId }: { investmentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function cancel() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/investments/${investmentId}/cancel`, { method: "POST" });
      const result = (await response.json()) as { ok: boolean; message: string };
      setMessage(result.message);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={cancel}
        disabled={isPending}
        className="rounded-full border border-danger-muted/40 bg-danger-muted/10 px-4 py-2 text-sm font-medium text-danger-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-danger-muted/[0.16] active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "İade kaydediliyor" : "Cayma hakkını kullan"}
      </button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
