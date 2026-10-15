import Link from "next/link";
import { MarketCard, PositionItem, TraderRow } from "@/components/cards";
import { DemoTag, HowItWorksBox, btnGhost, btnPrimary } from "@/components/ui";
import { feedFor, followedInMarket, getData, leaderboard, trendingMarkets } from "@/lib/data";

export default async function Home() {
  const data = getData();
  const youFollow = new Set(data.you.following);
  const markets = trendingMarkets(3);
  const lead = markets[0];
  const latest = feedFor("everyone").slice(0, 3);
  const top = leaderboard("return").ranked.slice(0, 3);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* HERO SECTION - super clear and friendly */}
      <section className="glow relative overflow-hidden rounded-[32px] border border-line px-6 py-10 md:px-14 md:py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <DemoTag>🎮 Demo only · No real money</DemoTag>
            <h1 className="mt-6 text-[2.25rem] font-bold leading-[1.05] tracking-[-0.03em] md:text-[4rem]">
              Predict things.<br />Win demo money.<br />Follow sharp guys.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted md:text-lg">
              Sabi na app for Nigerian students wey like predict things. Bet on Super Eagles, BBNaija, fuel price, ASUU strike, CBN decisions — with <strong>fake money</strong>. No risk, just vibes and practice.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/markets" className={btnPrimary}>
                See all markets →
              </Link>
              <Link href="/leaderboard" className={btnGhost}>
                Who dey win?
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span>✅ No signup</span>
              <span>✅ No real money</span>
              <span>✅ Just run am with npm</span>
            </div>
          </div>

          {lead ? (
            <Link
              href={`/markets/${lead.id}`}
              className="group block rounded-3xl border border-line-2 bg-bg/70 p-5 backdrop-blur transition hover:border-brand/60"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">🔥 Trending now</p>
              <p className="mt-3 text-xl font-bold leading-snug group-hover:text-brand">{lead.question}</p>
              <p className="mt-2 text-sm text-muted">{lead.simpleExplain}</p>
              <p className="mt-4 text-xs text-muted">
                {lead.traderCount} people don bet · {lead.outcomes.length > 0 ? `${Math.round(lead.outcomes[0].priceBps / 100)}% think ${lead.outcomes[0].label}` : ''}
              </p>
            </Link>
          ) : null}
        </div>
      </section>

      {/* HOW IT WORKS - quick box */}
      <HowItWorksBox />

      {/* HOT MARKETS */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">🔥 Hot markets right now</h2>
          <Link href="/markets" className="text-sm font-semibold text-brand hover:underline">
            See all →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">Things people dey bet on for now.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {markets.map((market: any) => (
            <MarketCard key={market.id} market={market} followed={followedInMarket(market)} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-10">
        {/* RECENT BETS */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">🤑 Recent bets</h2>
            <Link href="/feed" className="text-sm font-semibold text-brand hover:underline">
              See all →
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted">See wetin people dey put their money on.</p>
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

        {/* TOP PREDICTORS */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-[-0.02em] md:text-3xl">🏆 Top predictors</h2>
            <Link href="/leaderboard" className="text-sm font-semibold text-brand hover:underline">
              Leaderboard →
            </Link>
          </div>
          <p className="mt-1 text-sm text-muted">People wey sabi predict well well.</p>
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
            Na demo ranking. Results no real, just practice.
          </p>
        </section>
      </div>
    </div>
  );
}
