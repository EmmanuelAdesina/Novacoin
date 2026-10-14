import Link from "next/link";
import type { ReactNode } from "react";
import {
  categoryLabel,
  cn,
  formatAccuracy,
  formatNgn,
  formatPct,
  formatPrice,
  formatSignedNgn,
  formatWhen,
  itemKindLabel,
  kindLabel,
  rewardDetail,
  rewardLabel,
} from "@/lib/format";

export { cn };

export const btn =
  "inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btnForest = `${btn} bg-forest text-[#f6f1e7] hover:bg-leaf`;
export const btnClay = `${btn} bg-clay text-white hover:bg-clay-ink`;
export const btnGhost = `${btn} border border-line bg-paper text-ink hover:border-ink`;
export const btnQuiet = `${btn} px-2 text-muted hover:text-ink`;

export function Mark({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", light ? "text-[#f6f1e7]" : "text-ink")}>
      <svg width={compact ? 18 : 22} height={compact ? 18 : 22} viewBox="0 0 22 22" aria-hidden>
        <circle cx="11" cy="11" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3.2 13.6c2.2-3.8 4.8-5.7 7.8-5.7s5.6 1.9 7.8 5.7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11" cy="8.4" r="1.25" fill="#E7D3A8" />
      </svg>
      <span className={cn("font-serif italic leading-none tracking-[-0.03em]", compact ? "text-xl" : "text-[1.65rem]")}>
        Sabi
      </span>
    </span>
  );
}

export function Avatar({
  initials,
  hue,
  size = 40,
}: {
  initials: string;
  hue: string;
  size?: number;
}) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-medium tracking-wide text-[#f6f1e7]"
      style={{ background: hue, width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Money({
  value,
  signed = false,
  className = "",
}: {
  value: number;
  signed?: boolean;
  className?: string;
}) {
  const abs = Math.abs(Math.round(value)).toLocaleString("en-NG");
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  return (
    <span className={cn("num", className)}>
      {sign}
      <span className="font-sans">₦</span>
      {abs}
    </span>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{children}</p>;
}

export function DemoChip({ children = "Demo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-line bg-paper px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
      {children}
    </span>
  );
}

export function CategoryMark({ id }: { id: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-clay-ink">{categoryLabel(id)}</span>
  );
}

export function RewardMark({ type }: { type: string }) {
  const tone =
    type === "contest_prize" ? "border-gold text-gold" : type === "guaranteed" ? "border-forest text-forest" : "border-line text-muted";
  return (
    <span className={cn("inline-flex border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]", tone)}>
      {rewardLabel(type)}
    </span>
  );
}

export function StatusMark({ status }: { status: "open" | "upcoming" | "closed" }) {
  const label = status === "open" ? "Open" : status === "upcoming" ? "Starts soon" : "Finished";
  return <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>;
}

export function PriceBar({ label, bps, emphasis = false }: { label: string; bps: number; emphasis?: boolean }) {
  return (
    <div className="grid grid-cols-[88px_1fr_52px] items-center gap-3">
      <span className={cn("text-sm", emphasis ? "font-medium text-ink" : "text-muted")}>{label}</span>
      <span className="h-1.5 bg-mist">
        <span className={cn("block h-1.5", emphasis ? "bg-forest" : "bg-gold")} style={{ width: `${bps / 100}%` }} />
      </span>
      <span className="num text-right text-sm">{formatPrice(bps)}</span>
    </div>
  );
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="border border-dashed border-line px-5 py-8">
      <p className="font-serif text-2xl tracking-[-0.03em]">{title}</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{body}</p>
      {href && action ? (
        <Link href={href} className={`${btnGhost} mt-4`}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-forest pl-3 text-sm leading-6 text-ink">{children}</p>;
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm leading-6 text-rose">
      {children}
    </p>
  );
}

export function Success({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-6 text-forest">{children}</p>;
}

export function When({ value }: { value: string }) {
  return <span className="num">{formatWhen(value)}</span>;
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={`${part}-${index}`} className="bg-gold-soft text-ink">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

export function PersonLink({
  handle,
  displayName,
  initials,
  hue,
  meta,
}: {
  handle: string;
  displayName: string;
  initials: string;
  hue: string;
  meta?: string;
}) {
  return (
    <Link href={`/u/${handle}`} className="group flex min-w-0 items-center gap-3">
      <Avatar initials={initials} hue={hue} size={36} />
      <span className="min-w-0">
        <span className="block truncate font-medium group-hover:underline">{displayName}</span>
        {meta ? <span className="block truncate text-xs text-muted">{meta}</span> : null}
      </span>
    </Link>
  );
}

export function RuleList({
  items,
}: {
  items: Array<{ label: string; body: string }>;
}) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <div key={item.label} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr] sm:gap-6">
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{item.label}</dt>
          <dd className="text-sm leading-6">{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

export function StandingParts({
  parts,
  score,
}: {
  parts: { accuracy: number; recent: number; rooms: number; return: number };
  score: number | null;
}) {
  const rows = [
    ["Accuracy", parts.accuracy, 50],
    ["Recent", parts.recent, 20],
    ["Rooms", parts.rooms, 20],
    ["Return", parts.return, 10],
  ] as const;
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Standing out of 100</p>
        <p className="font-serif text-3xl leading-none num">{score === null ? "—" : score.toFixed(1)}</p>
      </div>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value, max]) => (
          <div key={label} className="grid grid-cols-[72px_1fr_48px] items-center gap-2 text-xs">
            <span className="text-muted">{label}</span>
            <span className="h-1 bg-mist">
              <span className="block h-1 bg-forest" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
            </span>
            <span className="num text-right">
              {value.toFixed(1)}/{max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function moneyTone(value: number) {
  if (value > 0) return "text-leaf";
  if (value < 0) return "text-rose";
  return "text-ink";
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-2xl leading-none tracking-[-0.03em] num">{value}</p>
      {hint ? <p className="mt-1 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

export function formatRecordLine(accuracy: number | null, settled: number, returnPct: number | null) {
  return `${formatAccuracy(accuracy)} on ${settled} · ${formatPct(returnPct, 0)} return`;
}

export { formatNgn, formatSignedNgn, formatPrice, formatWhen, rewardDetail, kindLabel, itemKindLabel, categoryLabel };
