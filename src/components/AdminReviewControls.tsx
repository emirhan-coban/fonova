"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision } from "@prisma/client";

export function AdminReviewControls({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(decision: ReviewDecision) {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, decision, note })
      });
      const result = (await response.json()) as { ok: boolean; message: string };
      setMessage(result.message);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="min-h-24 w-full resize-none rounded-2xl border border-white/[0.08] bg-navy-950/60 px-4 py-3 text-sm text-white outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] focus:border-accent/50"
        placeholder="Komite notu"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(ReviewDecision.APPROVED)}
          className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(29,184,154,0.25)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-teal-light hover:shadow-[0_4px_16px_rgba(29,184,154,0.35)] active:scale-[0.98] disabled:opacity-50"
        >
          Yayına al
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(ReviewDecision.CHANGES_REQUESTED)}
          className="rounded-full border border-warn-muted/40 bg-warn-muted/10 px-4 py-2 text-sm font-medium text-warn-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-warn-muted/[0.16] active:scale-[0.98] disabled:opacity-50"
        >
          Revizyon iste
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => submit(ReviewDecision.REJECTED)}
          className="rounded-full border border-danger-muted/40 bg-danger-muted/10 px-4 py-2 text-sm font-medium text-danger-muted transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-danger-muted/[0.16] active:scale-[0.98] disabled:opacity-50"
        >
          Reddet
        </button>
      </div>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
