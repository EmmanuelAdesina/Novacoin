import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm, PredictPanel, ResolveTool, ShareButton } from "@/components/widgets";
import { CategoryMark, DemoChip, Kicker, Money, PriceBar, RuleList, When, btnGhost } from "@/components/ui";
import { getCircuit } from "@/lib/circuit";
import { COPY, formatNgn, formatPrice } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const circuit = await getCircuit();
  const market = circuit.markets.find((m) => m.id === id);
  return { title: market ? market.question.slice(0, 72) : "Call" };
}

export default async function CallPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ side?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const circuit = await getCircuit();
  const market = circuit.markets.find((m) => m.id === id);
  if (!market) notFound();
  const yours = circuit.positions.find((p) => p.userId === circuit.you.id && p.marketId === market.id) ?? null;
  const lead = market.outcomes.slice().sort((a, b) => b.priceBps - a.priceBps)[0];

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href="/calls" className="hover:underline">
          Calls
        </Link>{" "}
        / {market.id}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CategoryMark id={market.category} />
        <DemoChip>{market.open ? "Open demonstration" : "Resolved demonstration"}</DemoChip>
        {market.featured ? <DemoChip>On the clock</DemoChip> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.04em] md:text-5xl">{market.question}</h1>
        <ShareButton path={`/calls/${market.id}`} label="Copy call link" />
      </div>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{market.summary}</p>
      <p className="mt-3 text-sm text-muted">
        {market.open ? (
          <>
            Closes <When value={market.closesAt} /> · resolves <When value={market.resolvesAt} />
          </>
        ) : (
          <>
            Resolved <When value={market.resolvesAt} /> · outcome {market.resolvedLabel}
          </>
        )}
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div>
          <div className="grid gap-6 border-y border-ink py-5 md:grid-cols-[160px_1fr] md:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                {market.resolvedLabel ? "Resolved" : "Leading price"}
              </p>
              <p className="font-serif text-6xl leading-none num">
                {market.resolvedLabel ? market.resolvedLabel : lead ? formatPrice(lead.priceBps) : "—"}
              </p>
            </div>
            <div className="space-y-2">
              {market.outcomes.map((o) => (
                <PriceBar
                  key={o.id}
                  label={o.label}
                  bps={o.priceBps}
                  emphasis={market.resolvedOutcomeId ? o.id === market.resolvedOutcomeId : o.id === lead?.id}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            {market.readerCount} named demonstration readers have a call here. <Money value={market.committed} /> of demo
            purse is committed. This is not live liquidity and not a crowd of real users.
          </p>
          <p className="mt-2 text-sm leading-6">{COPY.notIncome}</p>

          <div className="mt-8">
            <Kicker>How a call pays in the demo</Kicker>
            <p className="mt-2 text-sm leading-6">
              You choose one outcome. The demo purse is debited now. If your outcome is the resolution, the purse is
              credited the payout — each ₦{lead ? Math.round(lead.priceBps / 100) : "—"} at the locked price returns ₦100.
              If not, the stake stays spent. Nothing is paid in real naira.
            </p>
          </div>

          <div className="mt-8">
            <PredictPanel
              marketId={market.id}
              outcomes={market.outcomes}
              purse={circuit.you.purse}
              existing={
                yours
                  ? { label: yours.outcomeLabel, stake: yours.stake, priceBps: yours.priceBps }
                  : null
              }
              initialKey={sp.side}
              closedReason={
                market.open
                  ? undefined
                  : `Resolved ${market.resolvedLabel ?? ""}. ${market.demoNote}`
              }
            />
          </div>

          <section id="discussion" className="mt-10">
            <h2 className="font-serif text-3xl tracking-[-0.03em]">Discussion</h2>
            <p className="mt-1 text-sm text-muted">Notes from demonstration profiles, plus anything you add.</p>
            {market.comments.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No notes yet. A useful note asks about the rule, not the vibe.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {market.comments.map((comment) => (
                  <li key={comment.id} className="py-3">
                    <Link href={`/u/${comment.handle}`} className="text-sm font-medium hover:underline">
                      {comment.displayName}
                    </Link>
                    <p className="mt-1 text-sm leading-6">{comment.body}</p>
                    <p className="mt-1 text-xs text-faint">
                      <When value={comment.createdAt} /> · demonstration
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <CommentForm marketId={market.id} />
          </section>

          {market.open ? (
            <div className="mt-8">
              <ResolveTool marketId={market.id} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <RuleList
            items={[
              { label: "Source", body: market.resolutionSource },
              { label: "Rule", body: market.resolutionRule },
              { label: "Status", body: market.demoNote },
              {
                label: "Price",
                body: "Illustrative probability, not an order book. A new call can nudge it against a ₦750,000 demonstration pool. Your payout uses the price you locked.",
              },
            ]}
          />
          <div>
            <h2 className="font-serif text-2xl">Readers</h2>
            {market.readers.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No demonstration calls yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {market.readers.map((reader) => (
                  <li key={reader.handle} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/u/${reader.handle}`} className="text-sm font-medium hover:underline">
                        {reader.displayName}
                      </Link>
                      <span className="text-right text-sm">
                        {reader.outcomeLabel}
                        <span className="block text-xs text-muted">
                          at {formatPrice(reader.priceBps)} · {formatNgn(reader.stake)}
                        </span>
                      </span>
                    </div>
                    {reader.thesis ? <p className="mt-2 text-sm leading-6 text-muted">{reader.thesis}</p> : null}
                    {reader.settled ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                        {reader.correct ? "Called it" : "Missed"} · demo
                      </p>
                    ) : market.open ? (
                      <Link href={`/calls/${market.id}?side=${reader.outcomeKey}#call`} className={`${btnGhost} mt-2`}>
                        Use this side
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
