import { cache } from "react";
import { connection } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  activity,
  comments,
  competitionEntries,
  competitions,
  follows,
  holdings,
  items,
  markets,
  notifications,
  outcomes,
  positions,
  users,
} from "@/db/schema";
import { levelFor } from "@/lib/format";
import { computePerformance, type Performance, type SortId, type WindowId } from "@/lib/metrics";

export type OutcomeView = {
  id: string;
  key: string;
  label: string;
  priceBps: number;
};

export type ReaderView = {
  handle: string;
  displayName: string;
  initials: string;
  hue: string;
  outcomeKey: string;
  outcomeLabel: string;
  stake: number;
  priceBps: number;
  thesis: string | null;
  settled: boolean;
  correct: boolean | null;
  createdAt: string;
};

export type CommentView = {
  id: number;
  handle: string;
  displayName: string;
  initials: string;
  hue: string;
  body: string;
  createdAt: string;
};

export type MarketView = {
  id: string;
  question: string;
  category: string;
  summary: string;
  resolutionSource: string;
  resolutionRule: string;
  demoNote: string;
  closesAt: string;
  resolvesAt: string;
  resolvedOutcomeId: string | null;
  resolvedLabel: string | null;
  featured: boolean;
  open: boolean;
  outcomes: OutcomeView[];
  readers: ReaderView[];
  readerCount: number;
  committed: number;
  comments: CommentView[];
};

export type SeatView = {
  handle: string;
  displayName: string;
  initials: string;
  hue: string;
  city: string;
  isYou: boolean;
  score: number | null;
  points: number;
};

export type RoomView = {
  id: string;
  title: string;
  category: string;
  kind: string;
  summary: string;
  rules: string;
  eligibility: string;
  scoring: string;
  rewardSource: string;
  rewardType: string;
  prizeSummary: string;
  sponsorName: string | null;
  requiresItemId: string | null;
  spots: number | null;
  featured: boolean;
  startsAt: string;
  endsAt: string;
  status: "upcoming" | "open" | "closed";
  entrants: number;
  standings: SeatView[];
};

export type CategorySlice = {
  category: string;
  settled: number;
  accuracy: number | null;
  pnl: number;
  returnPct: number | null;
};

export type Person = {
  id: string;
  handle: string;
  displayName: string;
  city: string;
  country: string;
  bio: string;
  style: string;
  initials: string;
  hue: string;
  isYou: boolean;
  onboarded: boolean;
  interests: string[];
  joinedAt: string;
  purse: number;
  followers: number;
  following: number;
  followerHandles: string[];
  followingHandles: string[];
  holdingIds: string[];
  level: string;
  record: Performance;
  categories: CategorySlice[];
  bestCategory: string | null;
};

export type PositionView = {
  id: number;
  userId: string;
  marketId: string;
  question: string;
  category: string;
  outcomeLabel: string;
  outcomeKey: string;
  stake: number;
  priceBps: number;
  payout: number | null;
  potentialPayout: number;
  settled: boolean;
  correct: boolean | null;
  thesis: string | null;
  createdAt: string;
  marketOpen: boolean;
};

export type ActivityView = {
  id: number;
  userId: string;
  handle: string;
  displayName: string;
  initials: string;
  hue: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: string;
};

export type NoteView = {
  id: number;
  title: string;
  body: string;
  href: string | null;
  kind: string;
  read: boolean;
  createdAt: string;
};

export type ItemView = {
  id: string;
  kind: string;
  name: string;
  utility: string;
  howEarned: string;
  season: string;
  illustratedPriceNgn: number | null;
  boundary: string;
  sortOrder: number;
};

export type HoldingView = {
  userId: string;
  itemId: string;
  source: string;
  earnedAt: string;
};

export type EntryView = {
  competitionId: string;
  title: string;
  userId: string;
  score: number | null;
  points: number;
  createdAt: string;
  status: RoomView["status"];
  rewardType: string;
  category: string;
  prizeSummary: string;
};

export type Circuit = {
  you: Person;
  people: Person[];
  markets: MarketView[];
  rooms: RoomView[];
  positions: PositionView[];
  activity: ActivityView[];
  notes: NoteView[];
  items: ItemView[];
  holdings: HoldingView[];
  entries: EntryView[];
  generatedAt: string;
};

const CATEGORY_IDS = ["sports", "technology", "entertainment", "business", "world", "politics"];

function iso(date: Date) {
  return date.toISOString();
}

function roomStatus(start: Date, end: Date, now: number): RoomView["status"] {
  if (end.getTime() < now) return "closed";
  if (start.getTime() > now) return "upcoming";
  return "open";
}

export const getCircuit = cache(async (): Promise<Circuit> => {
  await connection();
  await ensureSeeded();
  const now = Date.now();
  const [
    userRows,
    followRows,
    marketRows,
    outcomeRows,
    positionRows,
    commentRows,
    roomRows,
    entryRows,
    itemRows,
    holdingRows,
    noteRows,
    activityRows,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(follows),
    db.select().from(markets),
    db.select().from(outcomes),
    db.select().from(positions).orderBy(desc(positions.createdAt)),
    db.select().from(comments).orderBy(desc(comments.createdAt)),
    db.select().from(competitions),
    db.select().from(competitionEntries),
    db.select().from(items),
    db.select().from(holdings),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)),
    db.select().from(activity).orderBy(desc(activity.createdAt)),
  ]);

  const outcomesByMarket = new Map<string, typeof outcomeRows>();
  for (const outcome of outcomeRows) {
    const list = outcomesByMarket.get(outcome.marketId) ?? [];
    list.push(outcome);
    outcomesByMarket.set(outcome.marketId, list);
  }

  const positionViews: PositionView[] = positionRows.map((p) => {
    const market = marketRows.find((m) => m.id === p.marketId);
    const outcome = outcomeRows.find((o) => o.id === p.outcomeId);
    const resolved = Boolean(market?.resolvedOutcomeId);
    const open = Boolean(market && !resolved && market.closesAt.getTime() > now);
    return {
      id: p.id,
      userId: p.userId,
      marketId: p.marketId,
      question: market?.question ?? "Call",
      category: market?.category ?? "mixed",
      outcomeLabel: outcome?.label ?? "Outcome",
      outcomeKey: outcome?.key ?? "",
      stake: p.stakeNgn,
      priceBps: p.priceBps,
      payout: p.payoutNgn,
      potentialPayout: Math.floor((p.stakeNgn * 10000) / Math.max(p.priceBps, 1)),
      settled: p.settled,
      correct: p.correct,
      thesis: p.thesis,
      createdAt: iso(p.createdAt),
      marketOpen: open,
    };
  });

  const holdingViews: HoldingView[] = holdingRows.map((h) => ({
    userId: h.userId,
    itemId: h.itemId,
    source: h.source,
    earnedAt: iso(h.earnedAt),
  }));

  const people: Person[] = userRows.map((user) => {
    const followerHandles = followRows.filter((f) => f.followingId === user.id).map((f) => f.followerId);
    const followingHandles = followRows.filter((f) => f.followerId === user.id).map((f) => f.followingId);
    const mine = positionViews.filter((p) => p.userId === user.id);
    const myEntries = entryRows.filter((e) => e.userId === user.id);
    const posInput = mine.map((p) => ({
      createdAt: new Date(p.createdAt).getTime(),
      settled: p.settled,
      correct: p.correct,
      stake: p.stake,
      payout: p.settled ? (p.payout ?? 0) : 0,
      category: p.category,
    }));
    const entryInput = myEntries.map((e) => ({
      createdAt: e.createdAt.getTime(),
      points: e.points,
      category: roomRows.find((r) => r.id === e.competitionId)?.category ?? "mixed",
    }));
    const record = computePerformance(posInput, entryInput, "season", "all", now);
    const categories: CategorySlice[] = CATEGORY_IDS.map((category) => {
      const slice = computePerformance(posInput, entryInput, "season", category, now);
      return {
        category,
        settled: slice.settled,
        accuracy: slice.accuracy,
        pnl: slice.pnl,
        returnPct: slice.returnPct,
      };
    }).filter((c) => c.settled > 0);
    const best = [...categories].sort((a, b) => b.settled - a.settled || (b.accuracy ?? 0) - (a.accuracy ?? 0))[0];
    const purse =
      user.openingPurseNgn -
      mine.reduce((sum, p) => sum + p.stake, 0) +
      mine.filter((p) => p.settled).reduce((sum, p) => sum + (p.payout ?? 0), 0);
    return {
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      city: user.city,
      country: user.country,
      bio: user.bio,
      style: user.style,
      initials: user.initials,
      hue: user.hue,
      isYou: user.isYou,
      onboarded: user.onboarded,
      interests: user.interests.split(",").map((s) => s.trim()).filter(Boolean),
      joinedAt: iso(user.joinedAt),
      purse,
      followers: followerHandles.length,
      following: followingHandles.length,
      followerHandles,
      followingHandles,
      holdingIds: holdingViews.filter((h) => h.userId === user.id).map((h) => h.itemId),
      level: levelFor(record.settled, record.score),
      record,
      categories,
      bestCategory: best?.category ?? null,
    };
  });

  const personById = new Map(people.map((p) => [p.id, p]));
  const you = people.find((p) => p.isYou);
  if (!you) throw new Error("Demonstration seat is missing.");

  const marketsView: MarketView[] = marketRows.map((market) => {
    const outs = (outcomesByMarket.get(market.id) ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const resolved = outs.find((o) => o.id === market.resolvedOutcomeId) ?? null;
    const readers = positionViews
      .filter((p) => p.marketId === market.id)
      .map((p) => {
        const person = personById.get(p.userId);
        return {
          handle: person?.handle ?? p.userId,
          displayName: person?.displayName ?? "Reader",
          initials: person?.initials ?? "?",
          hue: person?.hue ?? "#1B4636",
          outcomeKey: p.outcomeKey,
          outcomeLabel: p.outcomeLabel,
          stake: p.stake,
          priceBps: p.priceBps,
          thesis: p.thesis,
          settled: p.settled,
          correct: p.correct,
          createdAt: p.createdAt,
        };
      })
      .sort((a, b) => b.stake - a.stake);
    const marketComments = commentRows
      .filter((c) => c.marketId === market.id)
      .map((c) => {
        const person = personById.get(c.userId);
        return {
          id: c.id,
          handle: person?.handle ?? c.userId,
          displayName: person?.displayName ?? "Reader",
          initials: person?.initials ?? "?",
          hue: person?.hue ?? "#1B4636",
          body: c.body,
          createdAt: iso(c.createdAt),
        };
      });
    return {
      id: market.id,
      question: market.question,
      category: market.category,
      summary: market.summary,
      resolutionSource: market.resolutionSource,
      resolutionRule: market.resolutionRule,
      demoNote: market.demoNote,
      closesAt: iso(market.closesAt),
      resolvesAt: iso(market.resolvesAt),
      resolvedOutcomeId: market.resolvedOutcomeId,
      resolvedLabel: resolved?.label ?? null,
      featured: market.featured,
      open: !market.resolvedOutcomeId && market.closesAt.getTime() > now,
      outcomes: outs.map((o) => ({ id: o.id, key: o.key, label: o.label, priceBps: o.priceBps })),
      readers,
      readerCount: readers.length,
      committed: readers.reduce((sum, r) => sum + r.stake, 0),
      comments: marketComments,
    };
  });

  const rooms: RoomView[] = roomRows.map((room) => {
    const status = roomStatus(room.startsAt, room.endsAt, now);
    const standings = entryRows
      .filter((e) => e.competitionId === room.id)
      .map((e) => {
        const person = personById.get(e.userId);
        return {
          handle: person?.handle ?? e.userId,
          displayName: person?.displayName ?? "Reader",
          initials: person?.initials ?? "?",
          hue: person?.hue ?? "#1B4636",
          city: person?.city ?? "",
          isYou: Boolean(person?.isYou),
          score: e.score,
          points: e.points,
        };
      })
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    return {
      id: room.id,
      title: room.title,
      category: room.category,
      kind: room.kind,
      summary: room.summary,
      rules: room.rules,
      eligibility: room.eligibility,
      scoring: room.scoring,
      rewardSource: room.rewardSource,
      rewardType: room.rewardType,
      prizeSummary: room.prizeSummary,
      sponsorName: room.sponsorName,
      requiresItemId: room.requiresItemId,
      spots: room.spots,
      featured: room.featured,
      startsAt: iso(room.startsAt),
      endsAt: iso(room.endsAt),
      status,
      entrants: standings.length,
      standings,
    };
  });

  const entries: EntryView[] = entryRows.map((e) => {
    const room = rooms.find((r) => r.id === e.competitionId);
    return {
      competitionId: e.competitionId,
      title: room?.title ?? "Room",
      userId: e.userId,
      score: e.score,
      points: e.points,
      createdAt: iso(e.createdAt),
      status: room?.status ?? "closed",
      rewardType: room?.rewardType ?? "recognition",
      category: room?.category ?? "mixed",
      prizeSummary: room?.prizeSummary ?? "",
    };
  });

  const activityViews: ActivityView[] = activityRows.map((row) => {
    const person = personById.get(row.userId);
    return {
      id: row.id,
      userId: row.userId,
      handle: person?.handle ?? row.userId,
      displayName: person?.displayName ?? "Reader",
      initials: person?.initials ?? "?",
      hue: person?.hue ?? "#1B4636",
      kind: row.kind,
      title: row.title,
      body: row.body,
      href: row.href,
      createdAt: iso(row.createdAt),
    };
  });

  const notes: NoteView[] = noteRows
    .filter((n) => n.userId === you.id)
    .map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      href: n.href,
      kind: n.kind,
      read: n.read,
      createdAt: iso(n.createdAt),
    }));

  return {
    you,
    people: people.sort((a, b) => (b.record.score ?? -1) - (a.record.score ?? -1)),
    markets: marketsView.sort((a, b) => new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime()),
    rooms,
    positions: positionViews,
    activity: activityViews,
    notes,
    items: itemRows
      .map((item) => ({
        id: item.id,
        kind: item.kind,
        name: item.name,
        utility: item.utility,
        howEarned: item.howEarned,
        season: item.season,
        illustratedPriceNgn: item.illustratedPriceNgn,
        boundary: item.boundary,
        sortOrder: item.sortOrder,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    holdings: holdingViews,
    entries,
    generatedAt: new Date(now).toISOString(),
  };
});

export function personByHandle(circuit: Circuit, handle: string) {
  return circuit.people.find((p) => p.handle.toLowerCase() === handle.toLowerCase()) ?? null;
}

export type BoardRow = {
  person: Person;
  perf: Performance;
  rank: number | null;
  reason: string | null;
};

export function rankBoard(
  circuit: Circuit,
  window: WindowId,
  category: string,
  sort: SortId,
  now = Date.now(),
): { ranked: BoardRow[]; unranked: BoardRow[] } {
  const minSettled = category === "all" ? 4 : 3;
  const recentMin = 3;
  const rows = circuit.people.map((person) => {
    const pos = circuit.positions
      .filter((p) => p.userId === person.id)
      .map((p) => ({
        createdAt: new Date(p.createdAt).getTime(),
        settled: p.settled,
        correct: p.correct,
        stake: p.stake,
        payout: p.settled ? (p.payout ?? 0) : 0,
        category: p.category,
      }));
    const entries = circuit.entries
      .filter((e) => e.userId === person.id)
      .map((e) => ({
        createdAt: new Date(e.createdAt).getTime(),
        points: e.points,
        category: e.category,
      }));
    const perf = computePerformance(pos, entries, window, category, now, minSettled);
    let reason: string | null = null;
    let ranked = perf.ranked;
    if (!ranked) {
      reason = `Needs ${minSettled} settled demo calls in this view. Has ${perf.settled}.`;
    }
    if (sort === "recent" && perf.recentSettled < recentMin) {
      ranked = false;
      reason = `Recent sort needs ${recentMin} settled calls in the recent slice. Has ${perf.recentSettled}.`;
    }
    return { person, perf, rank: null as number | null, reason };
  });

  const actuallyRanked = rows.filter((r) => {
    if (sort === "recent") return r.perf.recentSettled >= recentMin && r.perf.recentAccuracy !== null;
    return r.perf.ranked;
  });
  const unranked = rows.filter((r) => !actuallyRanked.includes(r));

  actuallyRanked.sort((a, b) => {
    if (sort === "return") return (b.perf.returnPct ?? -99) - (a.perf.returnPct ?? -99);
    if (sort === "accuracy") return (b.perf.accuracy ?? -1) - (a.perf.accuracy ?? -1);
    if (sort === "recent") return (b.perf.recentAccuracy ?? -1) - (a.perf.recentAccuracy ?? -1);
    return (b.perf.score ?? -1) - (a.perf.score ?? -1);
  });
  actuallyRanked.forEach((row, index) => {
    row.rank = index + 1;
    row.reason = null;
  });
  unranked.forEach((row) => {
    row.rank = null;
    if (!row.reason) row.reason = "Not enough settled calls in this view.";
  });
  return { ranked: actuallyRanked, unranked };
}

export function progressFor(circuit: Circuit) {
  const you = circuit.you;
  const theses = circuit.positions.filter((p) => p.userId === you.id && p.thesis).length;
  const business = you.categories.find((c) => c.category === "business");
  return {
    theses,
    thesisTarget: 5,
    following: you.following,
    followTarget: 5,
    businessSettled: business?.settled ?? 0,
    businessAccuracy: business?.accuracy ?? null,
    businessTarget: 8,
    campus: circuit.entries.some((e) => e.userId === you.id && e.competitionId === "campus-circuit"),
    seasonSeat: you.holdingIds.includes("season-seat"),
  };
}
