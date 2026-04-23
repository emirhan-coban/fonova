export function tlToKurus(value: number) {
  return Math.round(value * 100);
}

export function formatTRY(kurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(kurus / 100);
}

export function formatCompactTRY(kurus: number) {
  return new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(kurus / 100) + " TL";
}

export function parseAmountToKurus(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") {
    return 0;
  }

  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Math.round(value * 100);
}
