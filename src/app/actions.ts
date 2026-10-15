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
  if (stake === null) return { ok: false, error: "Type a correct amount (numbers only, no commas)." };
  if (stake < MIN_POSITION_NGN) return { ok: false, error: `Smallest bet na ₦${MIN_POSITION_NGN.toLocaleString("en-NG")}.` };
  if (stake > MAX_POSITION_NGN) return { ok: false, error: `Biggest bet na ₦${MAX_POSITION_NGN.toLocaleString("en-NG")}.` };

  const thesis = (input.thesis ?? "").trim();
  if (thesis.length > MAX_NOTE_LENGTH) return { ok: false, error: `Your reason too long. Use less than ${MAX_NOTE_LENGTH} letters.` };

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
  if (body.length < 2) return { ok: false, error: "Write something small first." };
  if (body.length > MAX_COMMENT_LENGTH) return { ok: false, error: `Comment too long. Keep am under ${MAX_COMMENT_LENGTH} letters.` };

  const result = postComment(input.marketId, body);
  refresh();
  return result;
}

export async function resetDemoAction(): Promise<ActionResult> {
  const result = resetDemo();
  refresh();
  return result;
}
