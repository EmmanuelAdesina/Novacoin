import Link from "next/link";
import { MarketCard, PositionItem, TraderRow } from "@/components/cards";
import { BinaryChances, DemoTag, btnGhost, btnPrimary } from "@/components/ui";
import { feedFor, followedInMarket, getData, leaderboard, trendingMarkets } from "@/lib/data";
import { formatChance } from "@/lib/format";

export default async function Home() {
  const data = await getData();
  const youFollow = new Set(data.you.following);
  const markets = trendingMarkets(data, 3);
  const lead = markets[0];
  const latest = feedFor(data, "everyone").slice(0, 3);
  const top = leaderboard(data, "return").ranked.slice(0, 3);

  return (
    <div className="space-y-14 md:space-y-20">
      <section className="glow relative overflow-hidden rounded-[32px] border border-line px-6 py-10 md:px-14 md:py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <DemoTag>Demo · simulated balances</DemoTag>
            <h1 className="mt-6 text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.045em] md:text-[4.5rem]">
              Predict events. Trade your view. Follow top traders.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg md:leading-8">
              Take positions on real-world outcomes, see what others are backing, and follow the people making the best
              calls.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/markets" className={btnPrimary}>
                Explore markets
              </Link>
              <Link href="/leaderboard" className={btnGhost}>
                View leaderboard
              </Link>
            </div>
          </div>

          {lead ? (
            <Link
              href={`/markets/${lead.id}`}
              className="group block rounded-3xl border border-line-2 bg-bg/70 p-5 backdrop-blur transition hover:border-brand/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Trending now</p>
              <p className="mt-3 text-xl font-semibold leading-snug group-hover:text-brand">{lead.question}</p>
              <div className="mt-5">
                {lead.outcomes.length === 2 ? (
                  <BinaryChances yes={lead.outcomes[0]} no={lead.outcomes[1]} />
                ) : (
                  <p className="num text-sm text-muted">
                    {lead.outcomes
                      .slice(0, 3)
                      .map((o) => `${o.label} ${formatChance(o.priceBps)}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <p className="num mt-4 text-xs text-muted">
                {lead.traderCount} traders backing this
              </p>
            </Link>
          ) : null}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Live markets</h2>
          <Link href="/markets" className="text-sm font-semibold text-brand hover:underline">
            All markets
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} followed={followedInMarket(data, market)} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-10">
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Latest positions</h2>
            <Link href="/feed" className="text-sm font-semibold text-brand hover:underline">
              Open feed
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {latest.map((position) => (
              <PositionItem
                key={position.id}
                position={position}
                youId={data.you.id}
                following={youFollow.has(position.trader.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Top traders</h2>
            <Link href="/leaderboard" className="text-sm font-semibold text-brand hover:underline">
              Leaderboard
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {top.map((trader, index) => (
              <TraderRow
                key={trader.id}
                trader={trader}
                youId={data.you.id}
                following={youFollow.has(trader.id)}
                rank={index + 1}
                stats
              />
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-faint">
            Demo record. Ranked on simulated positions, not verified real-world results.
          </p>
        </section>
      </div>
    </div>
  );
}
