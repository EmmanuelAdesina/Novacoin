export const CATEGORIES = [
  { id: "sports", label: "Sports" },
  { id: "business", label: "Business" },
  { id: "technology", label: "Technology" },
  { id: "entertainment", label: "Entertainment" },
  { id: "politics", label: "Politics" },
  { id: "world", label: "World" },
] as const;

export const DEMO_NOTE = "Demo balances and results are simulated. No real money moves, and demo results are not official outcomes.";

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
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
  if (abs >= 1_000) return `${sign}₦${Math.round(abs / 1_000)}K`;
  return `${sign}₦${Math.round(abs)}`;
}

export function formatSignedNgn(value: number) {
  if (value > 0) return `+${formatNgn(value)}`;
  return formatNgn(value);
}

// Ratio in, percent out: 0.875 -> "+88%".
export function formatReturn(ratio: number | null) {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  const pct = Math.round(ratio * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

export function formatAccuracy(ratio: number | null) {
  if (ratio === null || Number.isNaN(ratio)) return "—";
  return `${Math.round(ratio * 100)}%`;
}

// Basis points to a probability: 5800 -> "58%".
export function formatChance(bps: number) {
  return `${Math.round(bps / 100)}%`;
}

// Basis points to a price in cents: 5800 -> "58¢".
export function formatCents(bps: number) {
  return `${Math.round(bps / 100)}¢`;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// "2h ago", "in 3d". Used for activity timestamps.
export function formatAgo(date: Date | string, now = Date.now()) {
  const t = typeof date === "string" ? new Date(date).getTime() : date.getTime();
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

// Market timing: "Closes in 3d", "Closes in 4h", "Closed".
export function closesLabel(closesAt: string, now = Date.now()) {
  const diff = new Date(closesAt).getTime() - now;
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
