import Link from "next/link";
import type { ReactNode } from "react";
import { chanceMeaning, cn, formatChance } from "@/lib/format";

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
    <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-gold">
      {children}
    </span>
  );
}

export function StatusTag({ status }: { status: "open" | "closed" | "settled" | "won" | "lost" }) {
  const map = {
    open: { label: "Still open", cls: "bg-yes/12 text-yes" },
    closed: { label: "Closed", cls: "bg-line text-muted" },
    settled: { label: "Result out", cls: "bg-line text-ink" },
    won: { label: "You win! 🎉", cls: "bg-yes/15 text-yes" },
    lost: { label: "You lose", cls: "bg-no/15 text-no" },
  } as const;
  const item = map[status];
  return <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", item.cls)}>{item.label}</span>;
}

// Simple probability bar
export function ChanceBar({ bps, tone = "brand" }: { bps: number; tone?: "yes" | "no" | "brand" }) {
  const fill = tone === "yes" ? "bg-yes" : tone === "no" ? "bg-no" : "bg-brand";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" aria-hidden>
      <div className={cn("h-full rounded-full", fill)} style={{ width: `${Math.max(2, Math.min(100, bps / 100))}%` }} />
    </div>
  );
}

// Yes/No prediction boxes - CLEAR and SIMPLE for Nigerians
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
  const yesPct = Math.round(yes.priceBps / 100);
  const noPct = Math.round(no.priceBps / 100);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-yes/10 px-4 py-4 text-yes">
        <p className={cn("font-semibold", big ? "text-base" : "text-sm")}>{yes.label}</p>
        <p className={cn("num font-bold leading-none tracking-[-0.03em]", big ? "mt-2 text-5xl" : "mt-1.5 text-3xl")}>
          {yesPct}%
        </p>
        <p className="mt-1 text-xs opacity-80">{chanceMeaning(yes.priceBps)}</p>
        <p className="num mt-1 text-xs opacity-70">For ₦1k bet → ₦{Math.round(1000 * 100 / yesPct).toLocaleString()} back if yes</p>
      </div>
      <div className="rounded-2xl bg-no/10 px-4 py-4 text-no">
        <p className={cn("font-semibold", big ? "text-base" : "text-sm")}>{no.label}</p>
        <p className={cn("num font-bold leading-none tracking-[-0.03em]", big ? "mt-2 text-5xl" : "mt-1.5 text-3xl")}>
          {noPct}%
        </p>
        <p className="mt-1 text-xs opacity-80">{chanceMeaning(no.priceBps)}</p>
        <p className="num mt-1 text-xs opacity-70">For ₦1k bet → ₦{Math.round(1000 * 100 / noPct).toLocaleString()} back if no</p>
      </div>
    </div>
  );
}

// Multi-option chances (like who wins BBNaija)
export function MultiChance({ outcome, showPayoutExample = true }: { outcome: { label: string; priceBps: number }; showPayoutExample?: boolean }) {
  const pct = Math.round(outcome.priceBps / 100);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold">{outcome.label}</span>
        <span className="num text-xl font-bold">{pct}%</span>
      </div>
      <div className="mt-1">
        <ChanceBar bps={outcome.priceBps} />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-muted">
        <span>{chanceMeaning(outcome.priceBps)}</span>
        {showPayoutExample && (
          <span className="num">₦1k bet → ₦{Math.round(1000 * 100 / pct).toLocaleString()} back</span>
        )}
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

// Simple explainer box that tells people how this works
export function HowItWorksBox() {
  return (
    <div className="rounded-2xl bg-brand/8 border border-brand/20 px-5 py-4">
      <p className="text-sm font-semibold text-brand">How does it work?</p>
      <ol className="mt-2 space-y-1 text-sm text-muted leading-6">
        <li>1. The percentage shows what people think will happen.</li>
        <li>2. If an option has 60%, most people think it is likely to happen.</li>
        <li>3. Choose what you believe will happen and place a demo prediction. If you are right, your demo balance increases.</li>
        <li>4. <strong>NO REAL MONEY.</strong> This is practice only.</li>
      </ol>
    </div>
  );
}
