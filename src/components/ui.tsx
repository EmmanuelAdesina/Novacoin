import Link from "next/link";
import type { ReactNode } from "react";
import { cn, formatChance, formatCents } from "@/lib/format";

export { cn };

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-2 bg-transparent px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-50";
export const btnSmall =
  "inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Avatar({ initials, hue, size = 40 }: { initials: string; hue: string; size?: number }) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-bg"
      style={{ background: hue, width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.16em] text-muted", className)}>{children}</p>;
}

export function DemoTag({ children = "Demo" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-gold">
      {children}
    </span>
  );
}

export function StatusTag({ status }: { status: "open" | "closed" | "settled" | "won" | "lost" }) {
  const map = {
    open: { label: "Open", cls: "bg-yes/12 text-yes" },
    closed: { label: "Closed", cls: "bg-line text-muted" },
    settled: { label: "Settled", cls: "bg-line text-ink" },
    won: { label: "Won", cls: "bg-yes/15 text-yes" },
    lost: { label: "Lost", cls: "bg-no/15 text-no" },
  } as const;
  const item = map[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", item.cls)}>{item.label}</span>;
}

// A single horizontal probability bar. The fill is the chance of that outcome.
export function ChanceBar({ bps, tone = "ink" }: { bps: number; tone?: "yes" | "no" | "ink" }) {
  const fill = tone === "yes" ? "bg-yes" : tone === "no" ? "bg-no" : "bg-brand";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" aria-hidden>
      <div className={cn("h-full rounded-full", fill)} style={{ width: `${Math.max(2, Math.min(100, bps / 100))}%` }} />
    </div>
  );
}

// Yes/No pair used on market cards: the price is the chance.
export function BinaryChances({
  yes,
  no,
  size = "md",
}: {
  yes: { label: string; priceBps: number };
  no: { label: string; priceBps: number };
  size?: "md" | "lg";
}) {
  const big = size === "lg";
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-yes/10 px-4 py-3 text-yes">
        <p className={cn("font-medium", big ? "text-sm" : "text-xs")}>{yes.label}</p>
        <p className={cn("num font-semibold leading-none tracking-[-0.03em]", big ? "mt-2 text-5xl" : "mt-1.5 text-2xl")}>
          {formatChance(yes.priceBps)}
        </p>
        <p className="num mt-1 text-xs opacity-70">{formatCents(yes.priceBps)} to win</p>
      </div>
      <div className="rounded-2xl bg-no/10 px-4 py-3 text-no">
        <p className={cn("font-medium", big ? "text-sm" : "text-xs")}>{no.label}</p>
        <p className={cn("num font-semibold leading-none tracking-[-0.03em]", big ? "mt-2 text-5xl" : "mt-1.5 text-2xl")}>
          {formatChance(no.priceBps)}
        </p>
        <p className="num mt-1 text-xs opacity-70">{formatCents(no.priceBps)} to win</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line-2 bg-panel/60 px-6 py-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{body}</p>
      {href && action ? (
        <Link href={href} className={cn(btnPrimary, "mt-5")}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-no/10 px-4 py-3 text-sm text-no">{children}</p>;
}

export function Success({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-yes/10 px-4 py-3 text-sm leading-6 text-yes">{children}</p>;
}

// Segmented control that switches between views using links, so it works without JavaScript.
export function Segmented({
  items,
}: {
  items: Array<{ href: string; label: string; active: boolean }>;
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-panel p-1 text-sm font-medium" role="tablist">
      {items.map((item) => (
        <Link
          key={item.href + item.label}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          scroll={false}
          className={cn(
            "rounded-full px-4 py-2 transition-colors",
            item.active ? "bg-ink text-bg" : "text-muted hover:text-ink",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
