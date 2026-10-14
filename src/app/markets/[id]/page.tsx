import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm, FollowButton, SettleControls, TradePanel } from "@/components/widgets";
import { Avatar, BinaryChances, ChanceBar, Eyebrow, StatusTag, cn } from "@/components/ui";
import { categoryLabel, closesLabel, formatAgo, formatCents, formatChance, formatCompactNgn, formatDate, formatNgn } from "@/lib/format";
import { getData, marketById, type Market } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const market = marketById(data, id);
  return { title: market ? market.question : "Market" };
}

export default async function MarketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData();
  const market = marketById(data, id);
  if (!market) notFound();

  const followingSet = new Set(data.you.following);
  const mine = market.positions.find((p) => p.trader.id === data.you.id);
  const [first, second] = market.outcomes;
  const binary = market.outcomes.length === 2;
  const sortedPositions = [...market.positions].sort((a, b) => {
    const followA = followingSet.has(a.trader.id) ? 1 : 0;
    const followB = followingSet.has(b.trader.id) ? 1 : 0;
    return followB - followA || b.stake - a.stake;
  });

  return (
    <div className="space-y-8">
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        ← Markets
      </Link>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] md:gap-10">
        {/* Primary column: the market and the trade. On phones this is the first thing you see. */}
        <div className="space-y-6">
          <header>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="font-semibold uppercase tracking-[0.12em]">{categoryLabel(market.category)}</span>
              <span className="text-faint">·</span>
              <StatusTag status={market.status} />
              <span className="text-faint">·</span>
              <span className="num">{market.status === "open" ? closesLabel(market.closesAt) : `Closed ${formatDate(market.closesAt)}`}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] md:text-5xl">{market.question}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{market.summary}</p>
          </header>

          <section className="glow rounded-3xl border border-line p-5 md:p-7">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Current chance</span>
              <span className="num">
                {market.traderCount} traders · {formatCompactNgn(market.volume)} demo volume
              </span>
            </div>
            <div className="mt-4">
              {binary && first && second ? (
                <BinaryChances yes={first} no={second} size="lg" />
              ) : (
                <ul className="space-y-4">
                  {[...market.outcomes]
                    .sort((a, b) => b.priceBps - a.priceBps)
                    .map((o, i) => (
                      <li key={o.id}>
                        <div className="flex items-baseline justify-between">
                          <span className={cn("text-base font-semibold", i === 0 && "text-brand")}>{o.label}</span>
                          <span className="num text-2xl font-semibold tracking-[-0.02em]">{formatChance(o.priceBps)}</span>
                        </div>
                        <div className="mt-2">
                          <ChanceBar bps={o.priceBps} />
                        </div>
                        <p className="num mt-1 text-xs text-muted">{formatCents(o.priceBps)} to win</p>
                      </li>
                    ))}
                </ul>
              )}
            </div>
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

        {/* Secondary column: the rules, who is in, and the discussion. */}
        <aside className="space-y-6">
          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <Eyebrow>How it settles</Eyebrow>
            <p className="mt-3 text-sm leading-6">{market.rules}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              <span className="font-semibold text-ink">Source: </span>
              {market.source}
            </p>
            <p className="mt-3 text-xs text-faint">
              Closes {formatDate(market.closesAt)} · Result expected {formatDate(market.resolvesAt)}
            </p>
          </section>

          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Who is in</Eyebrow>
              <span className="num text-xs text-muted">{market.positions.length}</span>
            </div>
            {sortedPositions.length ? (
              <ul className="mt-4 divide-y divide-line">
                {sortedPositions.map((p) => {
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
                          {p.outcomeLabel} at {formatCents(p.priceBps)} · {formatNgn(p.stake)} · {formatAgo(p.createdAt)}
                        </p>
                      </div>
                      {!isYou ? <FollowButton handle={p.trader.handle} following={followingSet.has(p.trader.id)} /> : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">No positions yet. Be the first to take a side.</p>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-panel p-5 md:p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Comments</Eyebrow>
              <span className="num text-xs text-muted">{market.comments.length}</span>
            </div>
            <CommentForm marketId={market.id} />
            <CommentList market={market} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function CommentList({ market }: { market: Market }) {
  if (!market.comments.length) {
    return <p className="mt-5 text-sm text-muted">No comments yet.</p>;
  }
  return (
    <ul className="mt-5 space-y-4">
      {market.comments.slice(0, 12).map((c) => (
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
