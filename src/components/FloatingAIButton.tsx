"use client";

import { useState } from "react";
import { Brain, X } from "@phosphor-icons/react";
import { AIAdvisorChat } from "./AIAdvisor";

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Fonova AI Danışman"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_48px_-16px_rgba(46,9,136,0.5)] transition-all duration-500 hover:bg-accent-hover hover:shadow-[0_24px_56px_-16px_rgba(46,9,136,0.6)] active:scale-[0.97]"
      >
        <Brain size={20} weight="duotone" />
        <span className="hidden sm:block">AI Danışman</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="fixed bottom-20 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:max-w-md">
            <div className="flex h-[540px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(46,9,136,0.3)]">
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4">
                <div className="grid size-8 place-items-center rounded-xl bg-accent text-white">
                  <Brain size={18} weight="duotone" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Fonova AI</p>
                  <p className="text-[10px] text-slate-500">Demo danışman</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto rounded-xl border border-slate-200 p-1.5 text-slate-500 transition-colors hover:text-slate-900"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <AIAdvisorChat />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
