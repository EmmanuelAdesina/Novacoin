"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { clearAll, ensureSeeded, insertSeed } from "@/db/seed";
import { comments, follows, markets, outcomes, positions, users } from "@/db/schema";
import { parseNgnInput } from "@/lib/format";
import {
  MAX_COMMENT_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_POSITION_NGN,
  MIN_POSITION_NGN,
  movePrices,
  payoutFor,
} from "@/lib/market";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

function refresh() {
  revalidatePath("/", "layout");
}

async function viewer() {
  await ensureSeeded();
  const [you] = await db.select().from(users).where(eq(users.isYou, true));
  if (!you) throw new Error("The demo account is missing.");
  return you;
}

export async function placePosition(input: {
  marketId: string;
  outcomeId: string;
  stakeRaw: string;
  thesis?: string;
}): Promise<ActionResult> {
  const you = await viewer();
  const stake = parseNgnInput(input.stakeRaw);
  if (stake === null) return { ok: false, error: "Enter a whole naira amount, without kobo." };
  if (stake < MIN_POSITION_NGN) return { ok: false, error: `The smallest position is ₦${MIN_POSITION_NGN.toLocaleString("en-NG")}.` };
  if (stake > MAX_POSITION_NGN) return { ok: false, error: `The largest position is ₦${MAX_POSITION_NGN.toLocaleString("en-NG")}.` };
  const thesis = (input.thesis ?? "").trim();
  if (thesis.length > MAX_NOTE_LENGTH) return { ok: false, error: `Keep your note under ${MAX_NOTE_LENGTH} characters.` };

  try {
    const result = await db.transaction(async (tx) => {
      const [market] = await tx.select().from(markets).where(eq(markets.id, input.marketId));
      if (!market) return { ok: false as const, error: "We could not find that market." };
      if (market.resolvedOutcomeId) return { ok: false as const, error: "This market has already settled." };
      if (market.closesAt.getTime() <= Date.now()) return { ok: false as const, error: "Trading on this market has closed." };

      const [outcome] = await tx.select().from(outcomes).where(eq(outcomes.id, input.outcomeId));
      if (!outcome || outcome.marketId !== market.id) {
        return { ok: false as const, error: "Pick an outcome for this market." };
      }

      const existing = await tx
        .select()
        .from(positions)
        .where(and(eq(positions.userId, you.id), eq(positions.marketId, market.id)));
      if (existing.length) {
        return { ok: false as const, error: "You already have a position in this market." };
      }

      const mine = await tx.select().from(positions).where(eq(positions.userId, you.id));
      const balance =
        you.openingBalanceNgn -
        mine.filter((p) => !p.settled).reduce((sum, p) => sum + p.stakeNgn, 0) +
        mine.filter((p) => p.settled).reduce((sum, p) => sum + (p.payoutNgn ?? 0), 0);
      if (stake > balance) return { ok: false as const, error: "Your demo balance cannot cover that amount." };

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
      const moved = movePrices(
        allOutcomes.map((o) => ({ id: o.id, priceBps: o.priceBps })),
        outcome.id,
        stake,
      );
      for (const o of moved) {
        await tx.update(outcomes).set({ priceBps: o.priceBps }).where(eq(outcomes.id, o.id));
      }

      const newPrice = moved.find((o) => o.id === outcome.id)?.priceBps ?? entryPrice;
      const potential = payoutFor(stake, entryPrice);
      return {
        ok: true as const,
        message: `Position placed: ${outcome.label} at ${Math.round(entryPrice / 100)}¢. If it wins, ₦${potential.toLocaleString("en-NG")} comes back. The price is now ${Math.round(newPrice / 100)}¢. No real money moved.`,
      };
    });
    if (!result.ok) return result;
    refresh();
    return result;
  } catch {
    return { ok: false, error: "Your position did not go through. Nothing was spent. Try again." };
  }
}

export async function settleMarket(input: { marketId: string; outcomeId: string }): Promise<ActionResult> {
  await viewer();
  try {
    const result = await db.transaction(async (tx) => {
      const [market] = await tx.select().from(markets).where(eq(markets.id, input.marketId));
      if (!market) return { ok: false as const, error: "We could not find that market." };
      if (market.resolvedOutcomeId) return { ok: false as const, error: "This market has already settled." };
      const [winner] = await tx.select().from(outcomes).where(eq(outcomes.id, input.outcomeId));
      if (!winner || winner.marketId !== market.id) return { ok: false as const, error: "Pick an outcome to settle on." };

      await tx.update(markets).set({ resolvedOutcomeId: winner.id }).where(eq(markets.id, market.id));
      const book = await tx.select().from(positions).where(eq(positions.marketId, market.id));
      for (const position of book) {
        if (position.settled) continue;
        const correct = position.outcomeId === winner.id;
        const payout = correct ? payoutFor(position.stakeNgn, position.priceBps) : 0;
        await tx
          .update(positions)
          .set({ settled: true, correct, payoutNgn: payout })
          .where(eq(positions.id, position.id));
      }
      return {
        ok: true as const,
        message: `Settled as ${winner.label} in the demo. Positions on this market are updated. This is a demo result, not an official outcome.`,
      };
    });
    if (!result.ok) return result;
    refresh();
    return result;
  } catch {
    return { ok: false, error: "Settling did not finish. The market was left open." };
  }
}

export async function toggleFollow(handle: string): Promise<ActionResult> {
  const you = await viewer();
  const [target] = await db.select().from(users).where(eq(users.handle, handle));
  if (!target) return { ok: false, error: "We could not find that trader." };
  if (target.id === you.id) return { ok: false, error: "You cannot follow yourself." };
  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, you.id), eq(follows.followingId, target.id)));
  if (existing.length) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    refresh();
    return { ok: true, message: `You unfollowed ${target.displayName}.` };
  }
  await db.insert(follows).values({
    followerId: you.id,
    followingId: target.id,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  refresh();
  return { ok: true, message: `You are following ${target.displayName}. Their positions now show in your feed.` };
}

export async function postComment(input: { marketId: string; body: string }): Promise<ActionResult> {
  const you = await viewer();
  const body = input.body.trim();
  if (body.length < 2) return { ok: false, error: "Write a sentence before posting." };
  if (body.length > MAX_COMMENT_LENGTH) return { ok: false, error: `Keep comments under ${MAX_COMMENT_LENGTH} characters.` };
  const [market] = await db.select().from(markets).where(eq(markets.id, input.marketId));
  if (!market) return { ok: false, error: "We could not find that market." };
  await db.insert(comments).values({
    marketId: market.id,
    userId: you.id,
    body,
    createdAt: new Date(),
    offsetMinutes: null,
  });
  refresh();
  return { ok: true, message: "Comment posted." };
}

export async function resetDemo() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(84216421)`);
    await clearAll(tx);
    await insertSeed(tx);
  });
  refresh();
  return { ok: true as const, message: "Demo reset. Balances, positions and follows are back to the starting state." };
}
