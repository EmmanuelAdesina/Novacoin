import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm, FollowButton, SettleControls, TradePanel } from "@/components/widgets";
import { Avatar, BinaryChances, ChanceBar, Eyebrow, MultiChance, StatusTag, cn } from "@/components/ui";
import { categoryLabel, closesLabel, formatAgo, formatCompactNgn, formatDate, formatNgn } from "@/lib/format";
import { getData, marketById } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getData();
  const market = marketById(id);
  return { title: market ? market.question : "Market" };
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getData();
  const market = marketById(id);
  if (!market) notFound();

  const followingSet = new Set(data.you.following);
  const mine = market.positions.find((p: any) => p.traderId === data.you.id);
  const binary = market.outcomes.length === 2;
  const sortedPositions: any[] = [...market.positions].sort((a: any, b: any) => {
    const followA = followingSet.has(a.trader.id) ? 1 : 0;
    const followB = followingSet.has(b.trader.id) ? 1 : 0;
    return followB - followA || b.stake - a.stake;
  });

  return (
    <div className="space-y-8">
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        ← Back to markets
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] md:gap-10">
        <div className="space-y-6">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold uppercase tracking-[0.12em]">{categoryLabel(market.category)}</span>
              <span className="text-faint">·</span>
              <StatusTag status={market.status} />
              <span className="text-faint">·</span>
              <span className="num">{market.status === "open" ? closesLabel(market.closesAt) : `Closed ${formatDate(market.closesAt)}`}</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.035em] md:text-5xl">{market.question}</h1>
            <div className="mt-4 rounded-2xl bg-panel-2 p-4 max-w-2xl">
              <p className="text-sm font-semibold">Simple break down:</p>
              <p className="mt-1 text-base leading-7">{market.simpleExplain}</p>
            </div>
          </header>

          {/* THE CHANCE DISPLAY - BIG AND CLEAR */}
          <section className="glow rounded-3xl border border-line p-5 md:p-7">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold">What people think (current odds)</span>
              <span className="num">
                {market.traderCount} {market.traderCount === 1 ? "person" : "people"} don bet · {formatCompactNgn(market.volume)} total
              </span>
            </div>
            <div className="mt-4">
              {binary ? (
                <BinaryChances yes={market.outcomes[0]} no={market.outcomes[1]} size="lg" />
              ) : (
                <ul className="space-y-5">
                  {[...market.outcomes]
                    .sort((a, b) => b.priceBps - a.priceBps)
                    .map((o) => (
                      <li key={o.id}>
                        <MultiChance outcome={o} showPayoutExample={true} />
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">
              💡 Remember: High percentage no mean e must happen. E just mean many people believe am.
            </p>
          </section>

          <TradePanel
            marketId={market.id}
            outcomes={market.outcomes}
            balance={data.you.balance}
            status={market.status}
            settledLabel={market.settledLabel}
            existing={
              mine
                ? { label: mine.outcomeLabel, stake: mine.stake, priceBps: mine.priceBps, status: mine.status }
                : null
            }
          />

          {market.status !== "settled" ? <SettleControls marketId={market.id} outcomes={market.outcomes} /> : null}
        </div>

        {/* SIDE BAR */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <Eyebrow>How we take decide winner?</Eyebrow>
            <p className="mt-3 text-sm leading-6">{market.howWeDecide}</p>
            <p className="mt-3 text-xs text-faint">
              Closes: {formatDate(market.closesAt)} · Result around: {formatDate(market.resolvesAt)}
            </p>
          </section>

          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>People wey don bet</Eyebrow>
              <span className="num text-xs text-muted">{market.positions.length}</span>
            </div>
            {sortedPositions.length ? (
              <ul className="mt-4 divide-y divide-line">
                {sortedPositions.map((p: any) => {
                  const isYou = p.trader.id === data.you.id;
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <Link href={`/u/${p.trader.handle}`} aria-label={`${p.trader.name} profile`}>
                        <Avatar initials={p.trader.initials} hue={p.trader.hue} size={36} />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {isYou ? "You" : p.trader.name}
                          {followingSet.has(p.trader.id) ? <span className="ml-2 text-xs font-medium text-brand">Following</span> : null}
                        </p>
                        <p className="num text-xs text-muted">
                          {p.outcomeLabel} ({Math.round(p.priceBps / 100)}%) · {formatNgn(p.stake)} · {formatAgo(p.createdAt)}
                        </p>
                      </div>
                      {!isYou ? <FollowButton handle={p.trader.handle} following={followingSet.has(p.trader.id)} /> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Nobody don bet here yet. Be first!</p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Comments ({market.comments.length})</Eyebrow>
            </div>
            <CommentForm marketId={market.id} />
            <CommentList comments={market.comments} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function CommentList({ comments }: { comments: any[] }) {
  if (!comments.length) {
    return <p className="mt-5 text-sm text-muted">No comment yet. Be first to talk.</p>;
  }
  return (
    <ul className="mt-5 space-y-4">
      {comments.slice(0, 12).map((c: any) => (
        <li key={c.id} className="flex gap-3">
          <Avatar initials={c.trader.initials} hue={c.trader.hue} size={32} />
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{c.trader.name}</span>
              <span className="text-faint"> · {formatAgo(c.createdAt)}</span>
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
