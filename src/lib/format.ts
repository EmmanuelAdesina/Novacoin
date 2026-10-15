// Simple formatting helpers - no jargon

export const DEMO_NOTE = "Na demo this. No real money dey inside. All results na just practice.";

export function categoryLabel(id: string) {
  return id;
}

export function formatNgn(value: number) {
  const neg = value < 0;
  const abs = Math.abs(Math.round(value)).toLocaleString("en-NG");
  return `${neg ? "−" : ""}₦${abs}`;
}

export function formatCompactNgn(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}₦${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${sign}₦${Math.round(abs / 1000)}K`;
  return `${sign}₦${Math.round(abs)}`;
}

export function formatSignedNgn(value: number) {
  if (value > 0) return `+${formatNgn(value)}`;
  return formatNgn(value);
}

// Return ratio -> simple profit %
export function formatReturn(ratio: number | null) {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  const pct = Math.round(ratio * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export function formatAccuracy(ratio: number | null) {
  if (ratio === null || Number.isNaN(ratio)) return "0%";
  return `${Math.round(ratio * 100)}%`;
}

// Basis points to percentage: 5800 -> "58%", plain and simple
export function formatChance(bps: number) {
  return `${Math.round(bps / 100)}%`;
}

// What does this percentage mean in plain English?
export function chanceMeaning(bps: number): string {
  const pct = Math.round(bps / 100);
  if (pct >= 80) return "Very likely";
  if (pct >= 65) return "Likely";
  if (pct >= 45) return "Almost 50/50";
  if (pct >= 30) return "Not too likely";
  if (pct >= 15) return "Long shot";
  return "Big long shot";
}

// For ₦1000 staked, how much you win if right?
export function potentialWinShort(stake: number, priceBps: number) {
  const win = Math.floor((stake * 10000) / priceBps);
  return formatNgn(win);
}

// Profit only (what you gain extra)
export function profitIfWin(stake: number, priceBps: number) {
  const win = Math.floor((stake * 10000) / priceBps);
  return formatNgn(win - stake);
}

export function formatDate(date: Date | string | number) {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

// "2h ago", "in 3d"
export function formatAgo(date: Date | string | number, now = Date.now()) {
  const t = typeof date === "string" ? new Date(date).getTime() : typeof date === "number" ? date : date.getTime();
  const diff = t - now;
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return diff >= 0 ? `in ${min}m` : `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 48) return diff >= 0 ? `in ${h}h` : `${h}h ago`;
  const d = Math.round(h / 24);
  return diff >= 0 ? `in ${d}d` : `${d}d ago`;
}

// Closes label - plain language
export function closesLabel(closesAt: string | number, now = Date.now()) {
  const t = typeof closesAt === "string" ? new Date(closesAt).getTime() : closesAt;
  const diff = t - now;
  if (diff <= 0) return "Closed";
  const min = Math.round(diff / 60000);
  if (min < 60) return `Closes in ${min}m`;
  const h = Math.round(min / 60);
  if (h < 48) return `Closes in ${h}h`;
  return `Closes in ${Math.round(h / 24)}d`;
}

export function parseNgnInput(raw: string) {
  const cleaned = raw.replace(/[₦,\s]/g, "");
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isSafeInteger(n)) return null;
  return n;
}

export function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || "??";
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
