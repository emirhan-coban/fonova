"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Brain, PaperPlaneTilt, CircleNotch, ArrowRight } from "@phosphor-icons/react";

interface ChatMessage {
  id: string;
  from: "ai" | "user";
  text: string;
  options?: { label: string; value: string }[];
  campaigns?: CampaignResult[];
}

interface CampaignResult {
  name: string;
  sector: string;
  slug: string;
  title: string;
  progress: number;
  equity: number;
  riskRating: string;
}

type Step = "welcome" | "sector" | "budget" | "risk" | "result" | "qa";

const WELCOME_OPTIONS = [
  { label: "Yatırım yapmak istiyorum", value: "investor" },
  { label: "Girişimimi fonlamak istiyorum", value: "founder" },
  { label: "Mentorluk / gönüllü katkı", value: "support" },
  { label: "Platforma dair sorum var", value: "qa" },
];

const SECTOR_OPTIONS = [
  { label: "Teknoloji", value: "teknoloji" },
  { label: "Robotik", value: "robot" },
  { label: "Sağlık", value: "sağlık" },
  { label: "Sürdürülebilirlik", value: "sürdürülebilir" },
  { label: "Hepsi", value: "hepsi" },
];

const BUDGET_OPTIONS = [
  { label: "₺50.000 altı", value: "low" },
  { label: "₺50K – ₺200K", value: "mid" },
  { label: "₺200.000+", value: "high" },
];

const RISK_OPTIONS = [
  { label: "Düşük risk", value: "low" },
  { label: "Orta risk", value: "mid" },
  { label: "Yüksek risk / yüksek getiri", value: "high" },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    from: "ai",
    text: "Merhaba! Fonova'da size en uygun fırsatı bulmak için buradayım. Ne yapmak istiyorsunuz?",
    options: WELCOME_OPTIONS,
  },
];

async function callAdvisor(body: Record<string, string>) {
  const res = await fetch("/api/ai-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function AIAdvisorChat() {
  const [step, setStep] = useState<Step>("welcome");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [profile, setProfile] = useState<{ sector?: string; budget?: string; risk?: string }>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usedOptionIds, setUsedOptionIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function addMsg(msg: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }

  function disableOptions(id: string) {
    setUsedOptionIds((prev) => new Set(prev).add(id));
  }

  async function handleOption(msgId: string, label: string, value: string) {
    disableOptions(msgId);
    addMsg({ from: "user", text: label });

    if (value === "go-founder") { window.location.href = "/founder"; return; }
    if (value === "go-support") { window.location.href = "/#gonullu-destek"; return; }

    if (step === "welcome") {
      if (value === "investor") {
        setStep("sector");
        setTimeout(() => addMsg({ from: "ai", text: "Hangi sektördeki girişimlerle ilgileniyorsunuz?", options: SECTOR_OPTIONS }), 400);
      } else if (value === "founder") {
        setStep("qa");
        setTimeout(() =>
          addMsg({
            from: "ai",
            text: "Girişiminizi Fonova'ya taşımak için başvuru sayfasına yönlendiriyorum.",
            options: [{ label: "Başvuru sayfasına git →", value: "go-founder" }],
          }), 400
        );
      } else if (value === "support") {
        setStep("qa");
        setTimeout(() =>
          addMsg({
            from: "ai",
            text: "Gönüllü destek projeleri için sizi doğru bölüme yönlendiriyorum.",
            options: [{ label: "Destek projelerini gör →", value: "go-support" }],
          }), 400
        );
      } else if (value === "qa") {
        setStep("qa");
        setTimeout(() =>
          addMsg({
            from: "ai",
            text: "Elbette! KYC, escrow, soğuma süresi, pay oranı veya güvenlik hakkında soru sorabilirsiniz.",
          }), 400
        );
      }
      return;
    }

    if (step === "sector") {
      const p = { ...profile, sector: value };
      setProfile(p);
      setStep("budget");
      setTimeout(() => addMsg({ from: "ai", text: "Ne kadar yatırım düşünüyorsunuz?", options: BUDGET_OPTIONS }), 400);
      return;
    }

    if (step === "budget") {
      const p = { ...profile, budget: value };
      setProfile(p);
      setStep("risk");
      setTimeout(() => addMsg({ from: "ai", text: "Risk toleransınız nedir?", options: RISK_OPTIONS }), 400);
      return;
    }

    if (step === "risk") {
      const p = { ...profile, risk: value };
      setProfile(p);
      setStep("result");
      setIsLoading(true);
      try {
        const data = await callAdvisor({ message: "", sector: p.sector ?? "", budget: p.budget ?? "", risk: value });
        addMsg({ from: "ai", text: data.reply, campaigns: data.campaigns });
      } catch {
        addMsg({ from: "ai", text: "Kampanyalar yüklenirken hata oluştu. Lütfen sayfayı yenileyin." });
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function handleSend() {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    setStep("qa");
    addMsg({ from: "user", text: msg });
    setIsLoading(true);
    try {
      const data = await callAdvisor({ message: msg });
      addMsg({ from: "ai", text: data.reply });
    } catch {
      addMsg({ from: "ai", text: "Bir hata oluştu, lütfen tekrar deneyin." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-2.5 ${msg.from === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.from === "ai"
                  ? "border border-slate-100 bg-slate-50 text-slate-700"
                  : "bg-accent text-white"
                }`}
            >
              {msg.text}
            </div>

            {msg.options && !usedOptionIds.has(msg.id) && (
              <div className="flex max-w-[85%] flex-wrap gap-2">
                {msg.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleOption(msg.id, opt.label, opt.value)}
                    className="rounded-xl border border-accent/20 bg-white px-3.5 py-2 text-sm font-medium text-accent shadow-[0_6px_18px_-14px_rgba(46,9,136,0.2)] transition-all duration-300 hover:bg-accent hover:text-white active:scale-[0.97]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {msg.campaigns && msg.campaigns.length > 0 && (
              <div className="mt-1 grid w-full gap-3 sm:grid-cols-2">
                {msg.campaigns.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/campaigns/${c.slug}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-accent/20 hover:shadow-[0_12px_30px_-20px_rgba(46,9,136,0.14)]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{c.sector}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{c.title}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${Math.min(c.progress, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                      <span>%{c.progress} tamamlandı</span>
                      <span>%{c.equity} pay</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent">
                      <span>Kampanyayı incele</span>
                      <ArrowRight size={12} weight="bold" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <CircleNotch size={16} className="animate-spin text-accent" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder="Soru sorun: KYC, escrow, pay oranı..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-accent/30 focus:bg-white"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="grid place-items-center rounded-xl bg-accent px-3.5 py-2.5 text-white shadow-[0_12px_30px_-20px_rgba(46,9,136,0.42)] transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-40"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIAdvisor() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-accent text-white shadow-[0_12px_30px_-20px_rgba(46,9,136,0.42)]">
            <Brain size={22} weight="duotone" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Yapay Zeka</p>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Fonova AI Danışman</h2>
          </div>
          <span className="ml-auto rounded-full border border-accent/15 bg-accent-muted px-3 py-1 text-xs font-semibold text-accent">
            Demo
          </span>
        </div>

        <div className="flex h-[480px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_62px_-54px_rgba(46,9,136,0.14)]">
          <AIAdvisorChat />
        </div>
      </div>
    </section>
  );
}
