import Link from "next/link";
import { ResetButton } from "@/components/widgets";
import { DemoTag, EmptyState, Eyebrow, StatusTag, cn } from "@/components/ui";
import { getData, type Position } from "@/lib/data";
import { formatAccuracy, formatChance, formatCents, formatNgn, formatReturn, formatSignedNgn, formatDate } from "@/lib/format";

export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const data = await getData();
  const you = data.you;
  const mine = data.positions.filter((p) => p.trader.id === you.id);
  const open = mine.filter((p) => p.status === "open");
  const settled = mine.filter((p) => p.status !== "open");

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Portfolio</h1>
      <section className="glow rounded-[28px] border border-line p-6 md:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <DemoTag>Simulated balance</DemoTag>
          <span className="text-sm text-muted">No real money. Results are demo results.</span>
        </div>
        <p className="mt-6 text-sm font-medium text-muted">Demo balance</p>
        <p className="num mt-1 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">{formatNgn(you.balance)}</p>
        <p className="mt-3 text-sm text-muted">
          Started the demo with {formatNgn(you.openingBalance)}.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
          <Stat label="Open" value={String(open.length)} hint={`${formatNgn(you.openStake)} at stake`} />
          <Stat label="Settled" value={String(settled.length)} hint={`${formatAccuracy(you.accuracy)} right`} />
          <Stat
            label="Return"
            value={formatReturn(you.returnRatio)}
            hint={you.settled ? `${formatSignedNgn(you.profit)} on settled` : "No settled positions"}
            tone={you.profit > 0 ? "yes" : you.profit < 0 ? "no" : undefined}
          />
        </div>
      </section>

      <section aria-labelledby="open-heading">
        <div className="flex items-end justify-between">
          <h2 id="open-heading" className="text-2xl font-semibold tracking-[-0.02em]">
            Open positions
          </h2>
          <span className="num text-sm text-muted">{open.length}</span>
        </div>
        <div className="mt-5 space-y-3">
          {open.length ? (
            open.map((p) => <PositionRow key={p.id} position={p} />)
          ) : (
            <EmptyState
              title="No open positions"
              body="Pick a market and take a side. Your position shows here until the market settles."
              href="/markets"
              action="Explore markets"
            />
          )}
        </div>
      </section>

      <section aria-labelledby="settled-heading">
        <div className="flex items-end justify-between">
          <h2 id="settled-heading" className="text-2xl font-semibold tracking-[-0.02em]">
            Settled
          </h2>
          <span className="num text-sm text-muted">{settled.length}</span>
        </div>
        <div className="mt-5 space-y-3">
          {settled.length ? (
            settled.map((p) => <PositionRow key={p.id} position={p} />)
          ) : (
            <p className="text-sm text-muted">Settled positions appear here with their demo result.</p>
          )}
        </div>
      </section>

      <div className="border-t border-line pt-6">
        <Eyebrow>Demo controls</Eyebrow>
        <p className="mt-2 text-sm text-muted">Put the demo back to its starting balances and positions.</p>
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
          "num mt-2 text-2xl font-semibold tracking-[-0.02em] md:text-3xl",
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

function PositionRow({ position }: { position: Position }) {
  const settled = position.status !== "open";
  return (
    <Link
      href={`/markets/${position.marketId}`}
      className="flex flex-col gap-3 rounded-3xl border border-line bg-panel p-5 transition hover:border-line-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{position.question}</p>
        <p className="num mt-1 text-sm text-muted">
          {position.outcomeLabel} at {formatCents(position.priceBps)} · {formatNgn(position.stake)} staked ·{" "}
          {formatDate(position.createdAt)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
        <StatusTag status={position.status} />
        <div className="num text-sm">
          {settled ? (
            <span className={cn("font-semibold", position.status === "won" ? "text-yes" : "text-no")}>
              {position.status === "won" ? `+${formatNgn((position.payout ?? 0) - position.stake)}` : formatSignedNgn(-position.stake)}
            </span>
          ) : (
            <span className="text-muted">
              Returns {formatNgn(position.potential)} if right · {formatChance(position.priceBps)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
