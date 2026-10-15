import Link from "next/link";
import { ResetButton } from "@/components/widgets";
import { DemoTag, EmptyState, StatusTag, cn } from "@/components/ui";
import { getData } from "@/lib/data";
import { formatAccuracy, formatChance, formatNgn, formatReturn, formatSignedNgn, formatDate } from "@/lib/format";

export const metadata = { title: "My Bets" };

export default async function PortfolioPage() {
  const data = getData();
  const you = data.you;
  const mine = data.positions.filter((p: any) => p.trader.id === you.id);
  const open = mine.filter((p) => p.status === "open");
  const settled = mine.filter((p) => p.status !== "open");

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-6xl">💰 My Bets</h1>
      <section className="glow rounded-[28px] border border-line p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <DemoTag>Demo money only</DemoTag>
          <span className="text-sm text-muted">No real cash. Just play.</span>
        </div>
        <p className="mt-6 text-sm font-medium text-muted">Your demo balance</p>
        <p className="num mt-1 text-5xl font-bold tracking-[-0.04em] md:text-7xl">{formatNgn(you.balance)}</p>
        <p className="mt-3 text-sm text-muted">
          You start with {formatNgn(you.openingBalance)}.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
          <Stat label="Still running" value={String(open.length)} hint={`${formatNgn(you.openStake)} put down`} />
          <Stat label="Don end" value={String(settled.length)} hint={`${formatAccuracy(you.accuracy)} correct`} />
          <Stat
            label="Profit/Loss"
            value={formatReturn(you.returnRatio)}
            hint={you.settled ? `${formatSignedNgn(you.profit)} total` : "No bets don end yet"}
            tone={you.profit > 0 ? "yes" : you.profit < 0 ? "no" : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="open-heading">
        <div className="flex items-end justify-between">
          <h2 id="open-heading" className="text-2xl font-bold tracking-[-0.02em]">
            🎯 Bets still running
          </h2>
          <span className="num text-sm text-muted">{open.length}</span>
        </div>
        <div className="mt-5 space-y-3">
          {open.length ? (
            open.map((p: any) => <PositionRow key={p.id} position={p} />)
          ) : (
            <EmptyState
              title="You never put any bet"
              body="Go look markets, pick one, put your demo money."
              href="/markets"
              action="See markets"
            />
          )}
        </div>
      </section>

      <section aria-labelledby="settled-heading">
        <div className="flex items-end justify-between">
          <h2 id="settled-heading" className="text-2xl font-bold tracking-[-0.02em]">
            ✅ Bets wey don end
          </h2>
          <span className="num text-sm text-muted">{settled.length}</span>
        </div>
        <div className="mt-5 space-y-3">
          {settled.length ? (
            settled.map((p: any) => <PositionRow key={p.id} position={p} />)
          ) : (
            <p className="text-sm text-muted">When your bets end, result go show here.</p>
          )}
        </div>
      </section>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-semibold">Reset demo</p>
        <p className="mt-1 text-sm text-muted">If you want start everything from scratch, click here. All your bets go vanish.</p>
        <div className="mt-3">
          <ResetButton />
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "yes" | "no";
}) {
  return (
    <div className="rounded-2xl border border-line bg-bg/50 p-4 md:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          "num mt-2 text-2xl font-bold tracking-[-0.02em] md:text-3xl",
          tone === "yes" && "text-yes",
          tone === "no" && "text-no",
        )}
      >
        {value}
      </p>
      <p className="num mt-1 text-xs leading-5 text-faint">{hint}</p>
    </div>
  );
}

function PositionRow({ position }: { position: any }) {
  const settled = position.status !== "open";
  const pct = Math.round(position.priceBps / 100);
  return (
    <Link
      href={`/markets/${position.marketId}`}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-panel p-5 transition hover:border-brand/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{position.question}</p>
        <p className="num mt-1 text-sm text-muted">
          You pick <strong>{position.outcomeLabel}</strong> ({pct}%) · Put {formatNgn(position.stake)} · {formatDate(position.createdAt)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
        <StatusTag status={position.status} />
        <div className="num text-sm min-w-[100px]">
          {settled ? (
            <span className={cn("font-bold", position.status === "won" ? "text-yes" : "text-no")}>
              {position.status === "won" ? `+${formatNgn((position.payout ?? 0) - position.stake)} profit` : `-${formatNgn(position.stake)}`}
            </span>
          ) : (
            <span className="text-muted">
              Win → {formatNgn(position.potential)} back
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
