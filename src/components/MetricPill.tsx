export function MetricPill({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "teal" | "accent" | "mint" | "brass" }) {
  const toneClass =
    tone === "teal" || tone === "mint"
      ? "border-teal/30 bg-teal/10 text-teal"
    : tone === "accent" || tone === "brass"
        ? "border-accent/30 bg-accent/10 text-accent"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-full border px-3 py-1.5 ${toneClass}`}>
      <span className="mr-2 text-[10px] uppercase tracking-[0.18em] opacity-70">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
