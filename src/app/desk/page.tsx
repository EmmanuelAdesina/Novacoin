import Link from "next/link";
import { ResetDemoButton, ShareButton } from "@/components/widgets";
import { CategoryMark, Kicker, Money, Notice, When, moneyTone } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { COPY, formatNgn, formatPct, formatPrice, formatSignedNgn } from "@/lib/format";

export const metadata = { title: "Desk" };

export default async function DeskPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const sp = await searchParams;
  const circuit = await getCircuit();
  const you = circuit.you;
  const mine = circuit.positions.filter((p) => p.userId === you.id);
  const open = mine.filter((p) => !p.settled);
  const settled = mine.filter((p) => p.settled);
  const seats = circuit.entries.filter((e) => e.userId === you.id);
  const history = circuit.activity.filter((a) => a.userId === you.id).slice(0, 12);
  const locked = open.reduce((sum, p) => sum + p.stake, 0);
  const ifWin = open.reduce((sum, p) => sum + (p.potentialPayout - p.stake), 0);
  const realized = you.record.pnl;

  return (
    <div>
      <Kicker>Desk · demonstration</Kicker>
      <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] md:text-5xl">A purse you cannot withdraw.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        {COPY.notIncome} Balances, payouts, and losses on this page are simulated. There is no deposit and no cash-out.
      </p>
      {sp.reset === "1" ? (
        <div className="mt-4">
          <Notice>Demonstration reset. The shared seat is back to the scripted record.</Notice>
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 border-y border-ink py-6 md:grid-cols-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Demo purse</p>
          <p className="mt-1 font-serif text-4xl">
            <Money value={you.purse} />
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Realized</p>
          <p className={`mt-1 font-serif text-4xl ${moneyTone(realized)}`}>{formatSignedNgn(realized)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Already spent</p>
          <p className="mt-1 font-serif text-4xl">
            <Money value={locked} />
          </p>
          <p className="mt-1 text-xs text-muted">Open calls, already out of the purse</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">If every open call hits</p>
          <p className="mt-1 font-serif text-4xl text-leaf">{formatSignedNgn(ifWin)}</p>
          <p className="mt-1 text-xs text-muted">Illustrative. If they all miss, the purse stays where it is.</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Open calls</h2>
        {open.length === 0 ? (
          <p className="mt-3 border border-dashed border-line px-4 py-6 text-sm text-muted">
            No open demo calls. The clock on Now is the place to start. A call is not required to look around.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {open.map((p) => (
              <li key={p.id} className="grid gap-2 py-3 md:grid-cols-[1fr_auto]">
                <div>
                  <CategoryMark id={p.category} />
                  <Link href={`/calls/${p.marketId}`} className="mt-1 block font-serif text-xl hover:underline">
                    {p.question}
                  </Link>
                  <p className="text-sm text-muted">
                    {p.outcomeLabel} locked at {formatPrice(p.priceBps)} · stake {formatNgn(p.stake)} · if right,{" "}
                    {formatNgn(p.potentialPayout)} comes back
                  </p>
                </div>
                <span className="text-xs text-faint">
                  <When value={p.createdAt} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Settled demo calls</h2>
        {settled.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No settled calls on this seat yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {settled.map((p) => {
              const pnl = (p.payout ?? 0) - p.stake;
              return (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                  <div>
                    <Link href={`/calls/${p.marketId}`} className="font-medium hover:underline">
                      {p.question}
                    </Link>
                    <p className="text-sm text-muted">
                      {p.correct ? "Called" : "Missed"} {p.outcomeLabel} · {formatNgn(p.stake)} at {formatPrice(p.priceBps)}
                    </p>
                  </div>
                  <span className={moneyTone(pnl)}>{formatSignedNgn(pnl)}</span>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-muted">
          Return on settled stakes: {formatPct(you.record.returnPct, 0)}. Accuracy {you.record.correct}/{you.record.settled}.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Seats</h2>
        {seats.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No rooms yet. <Link href="/compete" className="underline">Compete</Link> is separate from calls.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {seats.map((seat) => (
              <li key={seat.competitionId} className="py-3">
                <Link href={`/compete/${seat.competitionId}`} className="font-medium hover:underline">
                  {seat.title}
                </Link>
                <p className="text-sm text-muted">
                  {seat.status} · {seat.score === null ? "Entered, not scored" : `Scripted or live score ${seat.score}`} · {seat.points} season points
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl">Activity</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {history.map((item) => (
            <li key={item.id} className="py-3 text-sm">
              <span className="font-medium">{item.title}</span>
              {item.body ? <span className="text-muted"> · {item.body}</span> : null}
              <span className="mt-1 block text-xs text-faint">
                <When value={item.createdAt} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Bring a reader</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Copy a link to your record. There is no referral bonus and no reward for spamming contacts. The reason to
            invite someone is so you can compare.
          </p>
          <div className="mt-3">
            <ShareButton path="/u/you" label="Copy your record link" />
          </div>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Reset</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This preview shares one seat. Reset restores the scripted calls, follows, and purse. It does not touch a real
            account, because there is not one.
          </p>
          <div className="mt-3">
            <ResetDemoButton />
          </div>
        </div>
      </section>
    </div>
  );
}
