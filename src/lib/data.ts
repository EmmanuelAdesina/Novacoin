import { cache } from "react";
import { connection } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { comments, follows, markets, outcomes, positions, users } from "@/db/schema";

// Traders need this many settled positions before they appear on the leaderboard.
export const RANK_MIN_SETTLED = 3;
// Positions at or above this stake are flagged as big bets in the feed.
export const BIG_BET_NGN = 20_000;

export type MarketStatus = "open" | "closed" | "settled";
export type PositionStatus = "open" | "won" | "lost";

export type Person = {
  id: string;
  handle: string;
  name: string;
  initials: string;
  hue: string;
};

export type Outcome = {
  id: string;
  key: string;
  label: string;
  priceBps: number;
};

export type Trader = Person & {
  city: string;
  country: string;
  bio: string;
  style: string;
  isYou: boolean;
  joinedAt: string;
  openingBalance: number;
  balance: number;
  followers: string[];
  following: string[];
  settled: number;
  wins: number;
  accuracy: number | null;
  invested: number;
  returned: number;
  profit: number;
  returnRatio: number | null;
  openCount: number;
  openStake: number;
  ranked: boolean;
};

export type Position = {
  id: number;
  trader: Person;
  marketId: string;
  question: string;
  category: string;
  outcomeId: string;
  outcomeLabel: string;
  stake: number;
  priceBps: number;
  potential: number;
  payout: number | null;
  status: PositionStatus;
  thesis: string | null;
  createdAt: string;
  bigBet: boolean;
  marketStatus: MarketStatus;
};

export type Comment = {
  id: number;
  trader: Person;
  body: string;
  createdAt: string;
};

export type Market = {
  id: string;
  question: string;
  category: string;
  summary: string;
  source: string;
  rules: string;
  closesAt: string;
  resolvesAt: string;
  status: MarketStatus;
  featured: boolean;
  settledOutcomeId: string | null;
  settledLabel: string | null;
  outcomes: Outcome[];
  positions: Position[];
  traderCount: number;
  volume: number;
  comments: Comment[];
};

export type Data = {
  you: Trader;
  traders: Trader[];
  markets: Market[];
  positions: Position[];
  generatedAt: string;
};

function iso(date: Date) {
  return date.toISOString();
}

export const getData = cache(async (): Promise<Data> => {
  await connection();
  await ensureSeeded();
  const now = Date.now();

  const [userRows, followRows, marketRows, outcomeRows, positionRows, commentRows] = await Promise.all([
    db.select().from(users),
    db.select().from(follows),
    db.select().from(markets),
    db.select().from(outcomes),
    db.select().from(positions).orderBy(desc(positions.createdAt)),
    db.select().from(comments).orderBy(desc(comments.createdAt)),
  ]);

  const userById = new Map(userRows.map((u) => [u.id, u]));
  const person = (id: string): Person => {
    const u = userById.get(id);
    return {
      id,
      handle: u?.handle ?? id,
      name: u?.displayName ?? "Trader",
      initials: u?.initials ?? "??",
      hue: u?.hue ?? "#6B7280",
    };
  };

  const marketRowById = new Map(marketRows.map((m) => [m.id, m]));
  const outcomeById = new Map(outcomeRows.map((o) => [o.id, o]));

  const positionViews: Position[] = positionRows.map((p) => {
    const market = marketRowById.get(p.marketId);
    const outcome = outcomeById.get(p.outcomeId);
    const settled = Boolean(market?.resolvedOutcomeId);
    const marketStatus: MarketStatus = settled
      ? "settled"
      : market && market.closesAt.getTime() > now
        ? "open"
        : "closed";
    const status: PositionStatus = !settled ? "open" : p.correct ? "won" : "lost";
    return {
      id: p.id,
      trader: person(p.userId),
      marketId: p.marketId,
      question: market?.question ?? "Market",
      category: market?.category ?? "world",
      outcomeId: p.outcomeId,
      outcomeLabel: outcome?.label ?? "Outcome",
      stake: p.stakeNgn,
      priceBps: p.priceBps,
      potential: Math.floor((p.stakeNgn * 10000) / Math.max(p.priceBps, 1)),
      payout: settled ? (p.payoutNgn ?? 0) : null,
      status,
      thesis: p.thesis,
      createdAt: iso(p.createdAt),
      bigBet: p.stakeNgn >= BIG_BET_NGN,
      marketStatus,
    };
  });

  const traders: Trader[] = userRows.map((u) => {
    const mine = positionViews.filter((p) => p.trader.id === u.id);
    const settledRows = mine.filter((p) => p.status !== "open");
    const openRows = mine.filter((p) => p.status === "open");
    const wins = settledRows.filter((p) => p.status === "won").length;
    const invested = settledRows.reduce((sum, p) => sum + p.stake, 0);
    const returned = settledRows.reduce((sum, p) => sum + (p.payout ?? 0), 0);
    const settled = settledRows.length;
    const openStake = openRows.reduce((sum, p) => sum + p.stake, 0);
    return {
      ...person(u.id),
      city: u.city,
      country: u.country,
      bio: u.bio,
      style: u.style,
      isYou: u.isYou,
      joinedAt: iso(u.joinedAt),
      openingBalance: u.openingBalanceNgn,
      balance:
        u.openingBalanceNgn - openStake + settledRows.reduce((sum, p) => sum + (p.payout ?? 0), 0),
      followers: followRows.filter((f) => f.followingId === u.id).map((f) => f.followerId),
      following: followRows.filter((f) => f.followerId === u.id).map((f) => f.followingId),
      settled,
      wins,
      accuracy: settled === 0 ? null : wins / settled,
      invested,
      returned,
      profit: returned - invested,
      returnRatio: invested === 0 ? null : (returned - invested) / invested,
      openCount: openRows.length,
      openStake,
      ranked: settled >= RANK_MIN_SETTLED,
    };
  });

  const you = traders.find((t) => t.isYou);
  if (!you) throw new Error("The demo account is missing.");

  const marketViews: Market[] = marketRows.map((m) => {
    const outs = outcomeRows
      .filter((o) => o.marketId === m.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((o) => ({ id: o.id, key: o.key, label: o.label, priceBps: o.priceBps }));
    const resolved = outs.find((o) => o.id === m.resolvedOutcomeId) ?? null;
    const marketPositions = positionViews.filter((p) => p.marketId === m.id);
    const status: MarketStatus = resolved ? "settled" : m.closesAt.getTime() > now ? "open" : "closed";
    return {
      id: m.id,
      question: m.question,
      category: m.category,
      summary: m.summary,
      source: m.source,
      rules: m.rules,
      closesAt: iso(m.closesAt),
      resolvesAt: iso(m.resolvesAt),
      status,
      featured: m.featured,
      settledOutcomeId: m.resolvedOutcomeId,
      settledLabel: resolved?.label ?? null,
      outcomes: outs,
      positions: marketPositions,
      traderCount: new Set(marketPositions.map((p) => p.trader.id)).size,
      volume: marketPositions.reduce((sum, p) => sum + p.stake, 0),
      comments: commentRows
        .filter((c) => c.marketId === m.id)
        .map((c) => ({ id: c.id, trader: person(c.userId), body: c.body, createdAt: iso(c.createdAt) })),
    };
  });

  return {
    you,
    traders: traders.sort((a, b) => a.name.localeCompare(b.name)),
    markets: marketViews.sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime()),
    positions: positionViews,
    generatedAt: new Date(now).toISOString(),
  };
});

export function traderByHandle(data: Data, handle: string) {
  return data.traders.find((t) => t.handle.toLowerCase() === handle.toLowerCase()) ?? null;
}

export function marketById(data: Data, id: string) {
  return data.markets.find((m) => m.id === id) ?? null;
}

// Traders ranked on the leaderboard, plus everyone who is not ranked yet.
export function leaderboard(data: Data, sort: "return" | "accuracy") {
  const ranked = data.traders.filter((t) => t.ranked);
  ranked.sort((a, b) => {
    if (sort === "accuracy") {
      return (b.accuracy ?? 0) - (a.accuracy ?? 0) || b.settled - a.settled;
    }
    return (b.returnRatio ?? 0) - (a.returnRatio ?? 0) || b.wins - a.wins;
  });
  const unranked = data.traders.filter((t) => !t.ranked);
  return { ranked, unranked };
}

export function feedFor(data: Data, scope: "following" | "everyone") {
  const followed = new Set(data.you.following);
  return data.positions.filter((p) => {
    if (p.trader.id === data.you.id) return scope === "everyone";
    return scope === "everyone" || followed.has(p.trader.id);
  });
}

export function trendingMarkets(data: Data, limit = 4) {
  return data.markets
    .filter((m) => m.status === "open")
    .sort((a, b) => b.traderCount - a.traderCount || b.volume - a.volume)
    .slice(0, limit);
}

// Followed traders who hold a position in this market.
export function followedInMarket(data: Data, market: Market) {
  const followed = new Set(data.you.following);
  const found = new Map<string, Person>();
  for (const p of market.positions) {
    if (followed.has(p.trader.id)) found.set(p.trader.id, p.trader);
  }
  return [...found.values()];
}
