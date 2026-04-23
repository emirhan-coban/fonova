"use client";

import { useState } from "react";
import { CheckCircle, Heart } from "@phosphor-icons/react";

export function VolunteerSupportButton({ projectTitle }: { projectTitle: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setSubmitted(true)}
      className="mt-6 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:bg-slate-50 active:scale-[0.98]"
      aria-label={`${projectTitle} için gönüllü destek ver`}
    >
      <span>{submitted ? "Gönüllü destek talebin alındı" : "Gönüllü destek ver"}</span>
      <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-accent">
        {submitted ? <CheckCircle size={16} weight="duotone" /> : <Heart size={16} weight="duotone" />}
      </span>
    </button>
  );
}
