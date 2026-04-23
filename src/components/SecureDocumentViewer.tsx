"use client";

import { useEffect, useState, useTransition } from "react";
import { Eye, LockKey } from "@phosphor-icons/react";

export function SecureDocumentViewer({
  documentId,
  title,
  pageCount,
  watermark
}: {
  documentId: string;
  title: string;
  pageCount: number;
  watermark: string;
}) {
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        await fetch("/api/documents/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId, page, seconds: 47 })
        });
      });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [documentId, page]);

  return (
    <section className="bezel rounded-[1.5rem] p-1.5 sm:rounded-[2rem]">
      <div className="inner-bezel overflow-hidden rounded-[calc(1.5rem-0.375rem)] sm:rounded-[calc(2rem-0.375rem)]">
        <div className="grid gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Güvenli veri odası</p>
            <h3 className="mt-1 font-medium text-white">{title}</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
            <LockKey size={15} weight="light" />
            <span>İndirme kapalı</span>
          </div>
        </div>

        <div className="relative min-h-[320px] bg-navy-950 p-4 sm:min-h-[360px] sm:p-6">
          <div className="absolute inset-0 select-none opacity-[0.04] [background-image:linear-gradient(135deg,white_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute inset-0 grid place-items-center overflow-hidden">
            <p className="-rotate-12 select-none whitespace-nowrap text-center text-xl font-semibold tracking-[0.12em] text-white/[0.06] sm:text-3xl sm:tracking-[0.16em]">
              {watermark} / SAYFA {page} / FONOVA GÜVENLİ GÖRÜNTÜLEME
            </p>
          </div>
          <div className="relative mx-auto flex min-h-[288px] max-w-md flex-col justify-between rounded-3xl border border-white/[0.08] bg-navy-900/80 p-5 shadow-glass sm:min-h-[308px] sm:p-7">
            <div>
              <p className="font-mono text-xs text-teal">GİZLİ SAYFA {page}</p>
              <h4 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-white sm:mt-6 sm:text-3xl">
                Çekiş, birim ekonomi ve tur kullanım planı
              </h4>
              <div className="mt-8 space-y-3">
                <div className="h-3 w-11/12 rounded-full bg-white/[0.12]" />
                <div className="h-3 w-8/12 rounded-full bg-white/[0.08]" />
                <div className="h-3 w-10/12 rounded-full bg-white/[0.06]" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{isPending ? "Görüntüleme işleniyor" : "Görüntüleme kayıtlı"}</span>
              <span>{page}/{pageCount}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/[0.06] px-5 py-4 min-[420px]:grid-cols-[auto_1fr_auto] min-[420px]:items-center">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-full border border-white/[0.08] px-4 py-2 text-sm text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] active:scale-[0.98]"
          >
            Önceki
          </button>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Eye size={16} weight="light" />
            <span>Sayfa davranışı ölçülüyor</span>
          </div>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="rounded-full border border-white/[0.08] px-4 py-2 text-sm text-slate-300 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.06] active:scale-[0.98]"
          >
            Sonraki
          </button>
        </div>
      </div>
    </section>
  );
}
