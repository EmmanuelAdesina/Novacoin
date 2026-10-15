import Link from "next/link";
import { PositionItem } from "@/components/cards";
import { ChanceBar, EmptyState, Segmented, cn } from "@/components/ui";
import { feedFor, getData, trendingMarkets } from "@/lib/data";
import { categoryLabel, chanceMeaning, formatChance, formatCompactNgn } from "@/lib/format";

export const metadata = { title: "Activity" };

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope: raw } = await searchParams;
  const data = getData();
  const scope = raw === "everyone" ? "everyone" : "following";
  const youFollow = new Set(data.you.following);
  const items = feedFor(scope).slice(0, 40);
  const trending = trendingMarkets(4);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.04em] md:text-6xl">Activity</h1>
          <p className="mt-3 max-w-xl text-muted md:text-lg">
            See what people are predicting. Follow experienced predictors to keep up with their activity.
          </p>
        </div>
        <Segmented
          items={[
            { href: "/markets", label: "Markets", active: false },
            { href: "/feed", label: "Activity", active: true },
          ]}
        />
      </section>

      <section aria-labelledby="trending-heading">
        <div className="flex items-end justify-between">
          <h2 id="trending-heading" className="text-xl font-bold tracking-[-0.01em]">
            🔥 Trending
          </h2>
          <Link href="/markets" className="text-sm font-semibold text-brand hover:underline">
            See all
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-1 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
          {trending.map((m) => {
            const lead = [...m.outcomes].sort((a, b) => b.priceBps - a.priceBps)[0];
            return (
              <Link
                key={m.id}
                href={`/markets/${m.id}`}
                className="w-[78%] shrink-0 rounded-3xl border border-line bg-panel p-4 transition hover:border-brand/40 md:w-auto"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {categoryLabel(m.category)}
                </p>
                <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm font-semibold leading-6">{m.question}</p>
                {lead ? (
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-muted">{lead.label}</span>
                      <span className="num text-base font-bold text-brand">{formatChance(lead.priceBps)}</span>
                    </div>
                    <p className="text-[10px] text-muted">{chanceMeaning(lead.priceBps)}</p>
                    <div className="mt-2">
                      <ChanceBar bps={lead.priceBps} />
                    </div>
                  </div>
                ) : null}
                <p className="num mt-3 text-xs text-faint">
                  {m.traderCount} people · {formatCompactNgn(m.volume)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="stream-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="stream-heading" className="text-xl font-bold tracking-[-0.01em]">
            Recent bets
          </h2>
          <div className="inline-flex rounded-full border border-line bg-panel p-1 text-sm font-medium">
            {[
              { id: "following", label: "People I follow" },
              { id: "everyone", label: "Everybody" },
            ].map((s) => (
              <Link
                key={s.id}
                href={`/feed?scope=${s.id}`}
                scroll={false}
                aria-current={scope === s.id ? "true" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 transition-colors",
                  scope === s.id ? "bg-ink text-bg" : "text-muted hover:text-ink",
                )}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {items.length ? (
            items.map((position) => (
              <PositionItem
                key={position.id}
                position={position}
                youId={data.you.id}
                following={youFollow.has(position.trader.id)}
              />
            ))
          ) : (
            <EmptyState
              title="Nobody you follow has placed a bet yet"
              body="Follow people from the rankings to see their bets here."
              href="/leaderboard"
              action="See top predictors"
            />
          )}
        </div>
      </section>
    </div>
  );
}
