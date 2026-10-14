export const CATEGORIES = [
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
  { id: "entertainment", label: "Entertainment" },
  { id: "business", label: "Business" },
  { id: "world", label: "World" },
  { id: "politics", label: "Politics" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const INTERESTS = [
  ...CATEGORIES,
  { id: "competitions", label: "Rooms & contests" },
] as const;

export const DEMO_POOL_NGN = 750_000;

export const COPY = {
  banner:
    "Demonstration circuit. Invented profiles, simulated purses, scripted activity. Nothing here can be withdrawn.",
  affiliation:
    "Questions may name public topics for familiarity. Sabi is not affiliated with those clubs, companies, or institutions.",
  notIncome:
    "A demo call is speculative. It is not income, not a wage, and not a contest prize.",
  notVerified:
    "Demonstration record. Not an independently verified real-world result.",
  notAsset:
    "Not a token, not a resale item, and not a claim that anything here will rise in value.",
  adult: "Sabi is an 18+ concept. This demo does not collect ID or connect a bank account.",
};

export function categoryLabel(id: string) {
  if (id === "competitions") return "Rooms & contests";
  if (id === "mixed") return "Mixed";
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function formatNgn(value: number) {
  const neg = value < 0;
  const abs = Math.abs(Math.round(value)).toLocaleString("en-NG");
  return `${neg ? "−" : ""}₦${abs}`;
}

export function formatSignedNgn(value: number) {
  if (value > 0) return `+${formatNgn(value)}`;
  return formatNgn(value);
}

export function formatPct(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return "—";
  const pct = value * 100;
  const body = digits === 0 ? Math.round(pct).toString() : pct.toFixed(digits);
  return `${pct > 0 ? "+" : ""}${body}%`;
}

export function formatAccuracy(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function formatPrice(bps: number) {
  const pct = bps / 100;
  const body = Number.isInteger(pct) ? pct.toString() : pct.toFixed(1);
  return `${body}%`;
}

export function payoutFor(stake: number, priceBps: number) {
  if (stake <= 0 || priceBps <= 0) return 0;
  return Math.floor((stake * 10000) / priceBps);
}

export function formatWhen(date: Date | string, now = Date.now()) {
  const t = typeof date === "string" ? new Date(date).getTime() : date.getTime();
  const diff = t - now;
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60000);
  if (min < 1) return diff >= 0 ? "now" : "just now";
  if (min < 60) return diff >= 0 ? `in ${min}m` : `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 48) return diff >= 0 ? `in ${h}h` : `${h}h ago`;
  const d = Math.round(h / 24);
  return diff >= 0 ? `in ${d}d` : `${d}d ago`;
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  return letters || "YO";
}

export function rewardLabel(type: string) {
  if (type === "guaranteed") return "Guaranteed recognition";
  if (type === "contest_prize") return "Contest prize";
  if (type === "recognition") return "Recognition only";
  return type;
}

export function rewardDetail(type: string) {
  if (type === "guaranteed") return "Every finisher receives this. It is not cash.";
  if (type === "contest_prize") {
    return "Only placed finishers receive the illustrated prize. Not funded by other players' losses.";
  }
  if (type === "recognition") return "Points, a badge, or a line on a record. No purse.";
  return "";
}

export function kindLabel(kind: string) {
  if (kind === "forecasting") return "Forecasting";
  if (kind === "skill") return "Skill";
  if (kind === "community") return "Community";
  if (kind === "sponsored") return "Sponsored";
  if (kind === "tournament") return "Tournament";
  if (kind === "achievement") return "Achievement";
  if (kind === "access") return "Access pass";
  if (kind === "privilege") return "Privilege";
  return kind;
}

export function itemKindLabel(kind: string) {
  return kindLabel(kind);
}

export function levelFor(settled: number, score: number | null) {
  if (settled >= 15 && (score ?? 0) >= 55) return "Desk";
  if (settled >= 8) return "Regular";
  if (settled >= 1) return "Reader";
  return "New";
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
