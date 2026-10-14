"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { clearAll, ensureSeeded, insertSeed } from "@/db/seed";
import {
  activity,
  comments,
  competitionEntries,
  competitions,
  follows,
  holdings,
  markets,
  notifications,
  outcomes,
  positions,
  users,
} from "@/db/schema";
import { DEMO_POOL_NGN, INTERESTS, initialsFrom, parseNgnInput } from "@/lib/format";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

const ALLOWED_INTERESTS = new Set<string>(INTERESTS.map((item) => item.id));

function refresh() {
  revalidatePath("/", "layout");
}

async function viewer() {
  await ensureSeeded();
  const [you] = await db.select().from(users).where(eq(users.isYou, true));
  if (!you) throw new Error("Demonstration seat is missing.");
  return you;
}

async function grant(userId: string, itemId: string, source: string) {
  await db
    .insert(holdings)
    .values({
      userId,
      itemId,
      source,
      earnedAt: new Date(),
      offsetMinutes: null,
    })
    .onConflictDoNothing();
}

async function syncMarks(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return;
  const mine = await db.select().from(positions).where(eq(positions.userId, userId));
  if (mine.length >= 1) await grant(userId, "first-call", "Earned by recording a demo call");
  if (mine.filter((p) => p.thesis).length >= 5) {
    await grant(userId, "readers-mark", "Earned with five written theses");
  }
  const following = await db.select().from(follows).where(eq(follows.followerId, userId));
  if (following.length >= 5) await grant(userId, "compare-lens", "Earned by following five records");
  const campus = await db
    .select()
    .from(competitionEntries)
    .where(and(eq(competitionEntries.userId, userId), eq(competitionEntries.competitionId, "campus-circuit")));
  if (campus.length) await grant(userId, "campus-lantern", "Earned by taking a Campus Circuit seat");
  const seat = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.userId, userId), eq(holdings.itemId, "season-seat")));
  if (seat.length) await grant(userId, "pitch-pass", "Bundled with the demonstration season seat");

  const business = mine.filter((p) => p.settled);
  const businessIds = new Set(
    (await db.select().from(markets).where(eq(markets.category, "business"))).map((m) => m.id),
  );
  const biz = business.filter((p) => businessIds.has(p.marketId));
  const bizCorrect = biz.filter((p) => p.correct).length;
  if (biz.length >= 8 && bizCorrect / biz.length >= 0.6) {
    await grant(userId, "city-desk", "Earned on the business record");
  }
}

export async function placeCall(input: {
  marketId: string;
  outcomeId: string;
  stakeRaw: string;
  thesis?: string;
}): Promise<ActionResult> {
  const you = await viewer();
  const stake = parseNgnInput(input.stakeRaw);
  if (stake === null) return { ok: false, error: "Enter a whole naira amount, without kobo." };
  if (stake < 500) return { ok: false, error: "The smallest demonstration call is ₦500." };
  if (stake > 2_000_000) return { ok: false, error: "Demo calls are capped at ₦2,000,000." };
  const thesis = (input.thesis ?? "").trim();
  if (thesis.length > 180) return { ok: false, error: "Keep the thesis under 180 characters." };

  try {
    const result = await db.transaction(async (tx) => {
      const [market] = await tx.select().from(markets).where(eq(markets.id, input.marketId));
      if (!market) return { ok: false as const, error: "That call is not on the circuit." };
      if (market.resolvedOutcomeId) return { ok: false as const, error: "This question is already resolved in the demo." };
      if (market.closesAt.getTime() <= Date.now()) return { ok: false as const, error: "This question has closed." };
      const [outcome] = await tx.select().from(outcomes).where(eq(outcomes.id, input.outcomeId));
      if (!outcome || outcome.marketId !== market.id) {
        return { ok: false as const, error: "Pick an outcome on this question." };
      }
      const existing = await tx
        .select()
        .from(positions)
        .where(and(eq(positions.userId, you.id), eq(positions.marketId, market.id)));
      if (existing.length) {
        return { ok: false as const, error: "You already have one demo call on this question." };
      }
      const mine = await tx.select().from(positions).where(eq(positions.userId, you.id));
      const purse =
        you.openingPurseNgn -
        mine.reduce((sum, p) => sum + p.stakeNgn, 0) +
        mine.filter((p) => p.settled).reduce((sum, p) => sum + (p.payoutNgn ?? 0), 0);
      if (stake > purse) return { ok: false as const, error: "The demo purse cannot cover that stake." };

      const entryPrice = outcome.priceBps;
      await tx.insert(positions).values({
        userId: you.id,
        marketId: market.id,
        outcomeId: outcome.id,
        stakeNgn: stake,
        priceBps: entryPrice,
        payoutNgn: null,
        settled: false,
        correct: null,
        thesis: thesis || null,
        createdAt: new Date(),
        offsetMinutes: null,
      });

      const allOutcomes = await tx.select().from(outcomes).where(eq(outcomes.marketId, market.id));
      const shift = Math.min(400, Math.round((stake / (DEMO_POOL_NGN + stake)) * 10000));
      const next = allOutcomes.map((o) => ({ id: o.id, priceBps: o.priceBps }));
      const chosen = next.find((o) => o.id === outcome.id);
      if (!chosen) return { ok: false as const, error: "Pick an outcome on this question." };
      const room = Math.min(9600, chosen.priceBps + shift) - chosen.priceBps;
      chosen.priceBps += room;
      const others = next.filter((o) => o.id !== chosen.id);
      let remaining = room;
      const otherSum = others.reduce((sum, o) => sum + o.priceBps, 0) || 1;
      others.forEach((o, index) => {
        if (index === others.length - 1) o.priceBps = Math.max(200, o.priceBps - remaining);
        else {
          const cut = Math.min(remaining, Math.round((room * o.priceBps) / otherSum));
          o.priceBps = Math.max(200, o.priceBps - cut);
          remaining -= cut;
        }
      });
      const drift = 10000 - next.reduce((sum, o) => sum + o.priceBps, 0);
      const anchor = next.find((o) => o.priceBps + drift >= 200) ?? next[0];
      anchor.priceBps += drift;
      for (const o of next) {
        await tx.update(outcomes).set({ priceBps: o.priceBps }).where(eq(outcomes.id, o.id));
      }

      await tx.insert(activity).values({
        userId: you.id,
        kind: "call",
        title: `Backed ${outcome.label}`,
        body: market.question,
        href: `/calls/${market.id}`,
        createdAt: new Date(),
        offsetMinutes: null,
      });
      await tx.insert(notifications).values({
        userId: you.id,
        title: "Demo call recorded",
        body: `You backed ${outcome.label}. The illustrative price moved for the next reader. No real money moved.`,
        href: `/calls/${market.id}`,
        kind: "call",
        read: false,
        createdAt: new Date(),
        offsetMinutes: null,
      });

      const from = (entryPrice / 100).toFixed(1);
      const to = (chosen.priceBps / 100).toFixed(1);
      return {
        ok: true as const,
        message: `Recorded ${outcome.label} at ${from}%. Your return uses that price. The illustrative price for the next reader is ${to}%. No real money moved.`,
      };
    });
    if (!result.ok) return result;
    await syncMarks(you.id).catch(() => undefined);
    refresh();
    return result;
  } catch {
    return { ok: false, error: "The demo call did not record. Nothing was spent. Try again." };
  }
}

export async function simulateResolution(marketId: string): Promise<ActionResult> {
  const you = await viewer();
  try {
    const result = await db.transaction(async (tx) => {
      const [market] = await tx.select().from(markets).where(eq(markets.id, marketId));
      if (!market) return { ok: false as const, error: "That call is not on the circuit." };
      if (market.resolvedOutcomeId) return { ok: false as const, error: "This question is already resolved." };
      const outs = await tx.select().from(outcomes).where(eq(outcomes.marketId, marketId));
      const winner = outs.slice().sort((a, b) => b.priceBps - a.priceBps || a.sortOrder - b.sortOrder)[0];
      if (!winner) return { ok: false as const, error: "There is no outcome to simulate." };
      await tx.update(markets).set({ resolvedOutcomeId: winner.id }).where(eq(markets.id, marketId));
      const book = await tx.select().from(positions).where(eq(positions.marketId, marketId));
      let note = "You had no call on this question.";
      for (const position of book) {
        if (position.settled) continue;
        const correct = position.outcomeId === winner.id;
        const payout = correct ? Math.floor((position.stakeNgn * 10000) / position.priceBps) : 0;
        await tx
          .update(positions)
          .set({ settled: true, correct, payoutNgn: payout })
          .where(eq(positions.id, position.id));
        if (position.userId === you.id) {
          note = correct
            ? `Your demo call matched. ₦${payout.toLocaleString("en-NG")} returned to the demo purse.`
            : "Your demo call missed. The stake stays spent in the demo purse.";
        }
      }
      await tx.insert(notifications).values({
        userId: you.id,
        title: `Simulated outcome: ${winner.label}`,
        body: `${note} The tool used the leading illustrative price, not a real resolution source.`,
        href: `/calls/${market.id}`,
        kind: "result",
        read: false,
        createdAt: new Date(),
        offsetMinutes: null,
      });
      await tx.insert(activity).values({
        userId: you.id,
        kind: "result",
        title: `Simulated resolution · ${winner.label}`,
        body: market.question,
        href: `/calls/${market.id}`,
        createdAt: new Date(),
        offsetMinutes: null,
      });
      return {
        ok: true as const,
        message: `Simulated resolution: ${winner.label}. ${note} This was not a real event.`,
      };
    });
    if (!result.ok) return result;
    await syncMarks(you.id);
    refresh();
    return result;
  } catch {
    return { ok: false, error: "The simulation did not finish. The question was left open." };
  }
}

export async function toggleFollow(handle: string): Promise<ActionResult> {
  const you = await viewer();
  const [target] = await db.select().from(users).where(eq(users.handle, handle));
  if (!target) return { ok: false, error: "That record is not on the circuit." };
  if (target.id === you.id) return { ok: false, error: "You already have your own record." };
  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, you.id), eq(follows.followingId, target.id)));
  if (existing.length) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    refresh();
    return { ok: true, message: `Unfollowed ${target.displayName}.` };
  }
  await db.insert(follows).values({
    followerId: you.id,
    followingId: target.id,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await db.insert(activity).values({
    userId: you.id,
    kind: "follow",
    title: `Followed ${target.displayName}`,
    body: "Their calls can now sit on your Now page. Nothing is copied for you.",
    href: `/u/${target.handle}`,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await db.insert(notifications).values({
    userId: you.id,
    title: `Following ${target.displayName}`,
    body: "You will see their calls on Now. Sabi will not place those calls for you.",
    href: `/u/${target.handle}`,
    kind: "follow",
    read: false,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await syncMarks(you.id);
  refresh();
  return { ok: true, message: `Following ${target.displayName}. Their calls will show on Now.` };
}

export async function joinRoom(competitionId: string): Promise<ActionResult> {
  const you = await viewer();
  const [room] = await db.select().from(competitions).where(eq(competitions.id, competitionId));
  if (!room) return { ok: false, error: "That room is not on the circuit." };
  if (room.endsAt.getTime() < Date.now()) return { ok: false, error: "This room is finished." };
  if (room.requiresItemId) {
    const held = await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.userId, you.id), eq(holdings.itemId, room.requiresItemId)));
    if (!held.length) {
      return { ok: false, error: "This room needs a Season seat. Claim a demonstration seat on Passes — it is not a purchase." };
    }
  }
  const seated = await db.select().from(competitionEntries).where(eq(competitionEntries.competitionId, room.id));
  if (seated.some((s) => s.userId === you.id)) return { ok: false, error: "You already have this seat." };
  if (room.spots !== null && seated.length >= room.spots) return { ok: false, error: "The demonstration seats are full." };
  try {
    await db.insert(competitionEntries).values({
      competitionId: room.id,
      userId: you.id,
      score: null,
      points: 0,
      createdAt: new Date(),
      offsetMinutes: null,
    });
  } catch {
    return { ok: false, error: "You already have this seat." };
  }
  await db.insert(activity).values({
    userId: you.id,
    kind: "seat",
    title: `Took a seat in ${room.title}`,
    body: room.prizeSummary,
    href: `/compete/${room.id}`,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await db.insert(notifications).values({
    userId: you.id,
    title: `Seat recorded · ${room.title}`,
    body: `${room.prizeSummary} This did not move real money.`,
    href: `/compete/${room.id}`,
    kind: "room",
    read: false,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await syncMarks(you.id);
  refresh();
  return { ok: true, message: `Seat recorded in ${room.title}. ${room.rewardType === "contest_prize" ? "The prize is a contest prize, not a guarantee." : "This room does not pay cash."}` };
}

export async function leaveRoom(competitionId: string): Promise<ActionResult> {
  const you = await viewer();
  const [room] = await db.select().from(competitions).where(eq(competitions.id, competitionId));
  if (!room) return { ok: false, error: "That room is not on the circuit." };
  if (room.endsAt.getTime() < Date.now()) return { ok: false, error: "Finished rooms stay on the record." };
  const existing = await db
    .select()
    .from(competitionEntries)
    .where(and(eq(competitionEntries.competitionId, room.id), eq(competitionEntries.userId, you.id)));
  if (!existing.length) return { ok: false, error: "You do not have this seat." };
  await db.delete(competitionEntries).where(eq(competitionEntries.id, existing[0].id));
  refresh();
  return { ok: true, message: `You left ${room.title}. Any scripted points on that seat are gone.` };
}

export async function postComment(input: { marketId: string; body: string }): Promise<ActionResult> {
  const you = await viewer();
  const body = input.body.trim();
  if (body.length < 2) return { ok: false, error: "Write a sentence before posting." };
  if (body.length > 320) return { ok: false, error: "Keep the note under 320 characters." };
  const [market] = await db.select().from(markets).where(eq(markets.id, input.marketId));
  if (!market) return { ok: false, error: "That call is not on the circuit." };
  await db.insert(comments).values({
    marketId: market.id,
    userId: you.id,
    body,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await db.insert(activity).values({
    userId: you.id,
    kind: "comment",
    title: "Left a note",
    body: market.question,
    href: `/calls/${market.id}#discussion`,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  refresh();
  return { ok: true, message: "Note posted to the demonstration thread." };
}

export async function claimSeasonSeat(): Promise<ActionResult> {
  const you = await viewer();
  const existing = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.userId, you.id), eq(holdings.itemId, "season-seat")));
  if (existing.length) {
    return { ok: true, message: "You already hold the demonstration season seat." };
  }
  await grant(you.id, "season-seat", "Demonstration grant, not a purchase");
  await grant(you.id, "pitch-pass", "Bundled with the demonstration season seat");
  await db.insert(notifications).values({
    userId: you.id,
    title: "Demonstration season seat claimed",
    body: "High Table and the weekly briefing are open. This was not a payment, and the seat cannot be resold here.",
    href: "/passes#season-seat",
    kind: "pass",
    read: false,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  await db.insert(activity).values({
    userId: you.id,
    kind: "pass",
    title: "Claimed a demonstration season seat",
    body: "Access to High Table and the briefing. Not a purchase.",
    href: "/passes#season-seat",
    createdAt: new Date(),
    offsetMinutes: null,
  });
  refresh();
  return { ok: true, message: "Season seat claimed. It is a demo grant, not a payment, and it does not change your rank." };
}

export async function markNotificationRead(id: number): Promise<ActionResult> {
  const you = await viewer();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, you.id)));
  refresh();
  return { ok: true, message: "Noted." };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const you = await viewer();
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, you.id));
  refresh();
  return { ok: true, message: "All notices marked read." };
}

export async function completeOnboarding(input: {
  name: string;
  city: string;
  interests: string[];
  skip?: boolean;
}): Promise<ActionResult> {
  const you = await viewer();
  let name = you.displayName;
  let city = you.city;
  const interests = input.skip
    ? you.interests.split(",").map((s) => s.trim()).filter(Boolean)
    : [...new Set(input.interests.filter((id) => ALLOWED_INTERESTS.has(id)))];
  if (!input.skip) {
    const nextName = input.name.trim();
    if (nextName && !/^[\p{L}\s.'-]{2,40}$/u.test(nextName)) {
      return { ok: false, error: "Use 2–40 letters for the demo name." };
    }
    if (nextName) name = nextName;
    const nextCity = input.city.trim();
    if (nextCity && !/^[\p{L}\s.'-]{2,40}$/u.test(nextCity)) {
      return { ok: false, error: "Use 2–40 letters for the city." };
    }
    if (nextCity) city = nextCity;
  }
  await db
    .update(users)
    .set({
      displayName: name,
      initials: initialsFrom(name),
      city,
      onboarded: true,
      interests: input.skip ? you.interests : interests.join(","),
    })
    .where(eq(users.id, you.id));
  refresh();
  redirect(input.skip ? "/" : "/?tuned=1");
}

export async function resetDemo() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(84216421)`);
    await clearAll(tx);
    await insertSeed(tx);
  });
  refresh();
  redirect("/desk?reset=1");
}
