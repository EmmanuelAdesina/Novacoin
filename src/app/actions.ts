"use server";

import { revalidatePath } from "next/cache";
import { parseNgnInput } from "@/lib/format";
import {
  MAX_COMMENT_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_POSITION_NGN,
  MIN_POSITION_NGN,
  postComment,
  placePosition,
  resetDemo,
  settleMarket,
  toggleFollow,
} from "@/lib/data";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

function refresh() {
  revalidatePath("/", "layout");
}

export async function placePositionAction(input: {
  marketId: string;
  outcomeId: string;
  stakeRaw: string;
  thesis?: string;
}): Promise<ActionResult> {
  const stake = parseNgnInput(input.stakeRaw);
  if (stake === null) return { ok: false, error: "Enter a valid amount using numbers only, without commas." };
  if (stake < MIN_POSITION_NGN) return { ok: false, error: `Minimum bet is ₦${MIN_POSITION_NGN.toLocaleString("en-NG")}.` };
  if (stake > MAX_POSITION_NGN) return { ok: false, error: `Maximum bet is ₦${MAX_POSITION_NGN.toLocaleString("en-NG")}.` };

  const thesis = (input.thesis ?? "").trim();
  if (thesis.length > MAX_NOTE_LENGTH) return { ok: false, error: `Your reason is too long. Use fewer than ${MAX_NOTE_LENGTH} letters.` };

  const result = placePosition(input.marketId, input.outcomeId, stake, thesis);
  refresh();
  return result;
}

export async function settleMarketAction(input: { marketId: string; outcomeId: string }): Promise<ActionResult> {
  const result = settleMarket(input.marketId, input.outcomeId);
  refresh();
  return result;
}

export async function toggleFollowAction(handle: string): Promise<ActionResult> {
  const result = toggleFollow(handle);
  refresh();
  return result;
}

export async function postCommentAction(input: { marketId: string; body: string }): Promise<ActionResult> {
  const body = input.body.trim();
  if (body.length < 2) return { ok: false, error: "Please write a comment first." };
  if (body.length > MAX_COMMENT_LENGTH) return { ok: false, error: `Comment is too long. Keep it under ${MAX_COMMENT_LENGTH} letters.` };

  const result = postComment(input.marketId, body);
  refresh();
  return result;
}

export async function resetDemoAction(): Promise<ActionResult> {
  const result = resetDemo();
  refresh();
  return result;
}
