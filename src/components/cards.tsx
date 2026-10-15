import Link from "next/link";
import type { Market, Person, Trader } from "@/lib/data";
import { categoryLabel, closesLabel, formatAgo, formatCompactNgn, formatNgn, formatReturn, formatAccuracy, chanceMeaning } from "@/lib/format";
import { Avatar, BinaryChances, ChanceBar, MultiChance, StatusTag, cn } from "@/components/ui";
import { FollowButton } from "@/components/widgets";

// Market card - clear question + easy-to-understand odds
export function MarketCard({ market, followed = [] }: { market: any; followed?: Person[] }) {
  const binary = market.outcomes.length === 2;
  const [first, second] = market.outcomes;
  const ranked = [...market.outcomes].sort((a, b) => b.priceBps - a.priceBps).slice(0, 3);
  const timing =
    market.status === "settled"
      ? `Result: ${market.settledLabel}`
      : market.status === "closed"
        ? "Don close"
        : closesLabel(market.closesAt);

  return (
    <Link
      href={`/markets/${market.id}`}
      className="group flex flex-col rounded-3xl border border-line bg-panel p-5 transition hover:border-brand/40 hover:bg-panel-2 md:p-6"
    >
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span className="font-semibold uppercase tracking-[0.12em]">{categoryLabel(market.category)}</span>
        <span className="num">{timing}</span>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug group-hover:text-brand md:text-xl">
        {market.question}
      </h3>
      <p className="mt-2 text-sm text-muted line-clamp-2">{market.simpleExplain}</p>

      <div className="mt-5">
        {binary && first && second ? (
          <BinaryChances yes={first} no={second} />
        ) : (
          <ul className="space-y-4">
            {ranked.map((o) => (
              <li key={o.id}>
                <MultiChance outcome={o} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
        <span className="num">
          {market.traderCount} {market.traderCount === 1 ? "person" : "people"} don bet · {formatCompactNgn(market.volume)} total
        </span>
        <StatusTag status={market.status} />
      </div>

      {followed.length ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className="flex -space-x-2">
            {followed.slice(0, 3).map((p) => (
              <span key={p.id} className="ring-2 ring-panel rounded-full">
                <Avatar initials={p.initials} hue={p.hue} size={22} />
              </span>
            ))}
          </span>
          {followed[0].name.split(" ")[0]}
          {followed.length > 1 ? ` and ${followed.length - 1} person you follow don put money` : " don put money here"}
        </p>
      ) : null}
    </Link>
  );
}

export function PositionItem({
  position,
  youId,
  following,
  showMarket = true,
}: {
  position: any;
  youId: string;
  following: boolean;
  showMarket?: boolean;
}) {
  const isYou = position.trader.id === youId;
  const verb = position.status === "open" ? "put money on" : position.status === "won" ? "WON money on" : "lost money on";
  const pct = Math.round(position.priceBps / 100);
  return (
    <article className="rounded-3xl border border-line bg-panel p-5">
      <div className="flex items-start gap-3">
        <Link href={`/u/${position.trader.handle}`} aria-label={`${position.trader.name} profile`}>
          <Avatar initials={position.trader.initials} hue={position.trader.hue} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm">
            <Link href={`/u/${position.trader.handle}`} className="font-semibold hover:underline">
              {isYou ? "You" : position.trader.name}
            </Link>
            <span className="text-muted">@{position.trader.handle}</span>
            <span className="text-faint">· {formatAgo(position.createdAt)}</span>
          </div>
          <p className="mt-1 text-[15px] leading-6">
            <span className="text-muted">{verb} </span>
            <span className="font-semibold">{position.outcomeLabel}</span>
            <span className="text-muted"> ({pct} chance) with </span>
            <span className="num font-semibold">{formatNgn(position.stake)}</span>
          </p>
          {showMarket ? (
            <Link href={`/markets/${position.marketId}`} className="mt-1 block text-sm leading-6 text-muted hover:text-ink">
              {position.question}
            </Link>
          ) : null}
          {position.thesis ? (
            <p className="mt-3 rounded-2xl bg-panel-2 px-4 py-3 text-sm leading-6 text-muted">"{position.thesis}"</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {position.bigBet ? (
              <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold">Big bet 🔥</span>
            ) : null}
            {position.status !== "open" ? (
              <StatusTag status={position.status} />
            ) : (
              <span className="rounded-full bg-yes/12 px-2.5 py-1 text-[11px] font-semibold text-yes">Still running</span>
            )}
            {position.status === "won" && position.payout ? (
              <span className="rounded-full bg-yes/12 px-2.5 py-1 text-[11px] font-semibold text-yes">
                Collected {formatNgn(position.payout)}
              </span>
            ) : null}
          </div>
        </div>
        {!isYou ? <FollowButton handle={position.trader.handle} following={following} /> : null}
      </div>
    </article>
  );
}

export function TraderRow({
  trader,
  youId,
  following,
  rank,
  stats = false,
}: {
  trader: any;
  youId: string;
  following: boolean;
  rank?: number | null;
  stats?: boolean;
}) {
  const isYou = trader.id === youId;
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-line bg-panel px-4 py-4 md:px-5">
      {rank ? (
        <span className={cn("num w-7 shrink-0 text-center text-lg font-bold", rank <= 3 ? "text-gold" : "text-muted")}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
        </span>
      ) : null}
      <Link href={`/u/${trader.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar initials={trader.initials} hue={trader.hue} size={44} />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{isYou ? "You" : trader.name}</span>
          <span className="block truncate text-xs text-muted">
            @{trader.handle} · {trader.city}
          </span>
        </span>
      </Link>
      {stats && trader.settled ? (
        <span className="num shrink-0 text-right">
          <span
            className={cn("block text-base font-bold", (trader.returnRatio ?? 0) >= 0 ? "text-yes" : "text-no")}
          >
            {formatReturn(trader.returnRatio)}
          </span>
          <span className="block text-[11px] text-muted">
            {formatAccuracy(trader.accuracy)} correct · {trader.settled} bets
          </span>
        </span>
      ) : null}
      {!isYou ? <FollowButton handle={trader.handle} following={following} /> : null}
    </div>
  );
}
