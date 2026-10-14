// Pricing for simulated positions. Prices are basis points: 10000 = 100%.
// A position on an outcome at price p pays stake / p if that outcome wins.

export const MIN_POSITION_NGN = 500;
export const MAX_POSITION_NGN = 2_000_000;
export const MAX_NOTE_LENGTH = 180;
export const MAX_COMMENT_LENGTH = 320;

// Demo liquidity used to move prices a little after each position.
const PRICE_DEPTH_NGN = 750_000;
const MIN_PRICE_BPS = 200;
const MAX_PRICE_BPS = 9600;

export function payoutFor(stake: number, priceBps: number) {
  if (stake <= 0 || priceBps <= 0) return 0;
  return Math.floor((stake * 10000) / priceBps);
}

// Returns new prices after a position on `chosenId`. The chosen outcome gets a little more
// likely, the others a little less, and the total always stays at 10000.
export function movePrices<T extends { id: string; priceBps: number }>(
  outs: T[],
  chosenId: string,
  stake: number,
): T[] {
  const next = outs.map((o) => ({ ...o }));
  const chosen = next.find((o) => o.id === chosenId);
  if (!chosen) return next;
  const shift = Math.min(400, Math.round((stake / (PRICE_DEPTH_NGN + stake)) * 10000));
  const room = Math.min(MAX_PRICE_BPS, chosen.priceBps + shift) - chosen.priceBps;
  chosen.priceBps += room;

  const others = next.filter((o) => o.id !== chosen.id);
  let remaining = room;
  const otherSum = others.reduce((sum, o) => sum + o.priceBps, 0) || 1;
  others.forEach((o, index) => {
    if (index === others.length - 1) {
      o.priceBps = Math.max(MIN_PRICE_BPS, o.priceBps - remaining);
    } else {
      const cut = Math.min(remaining, Math.round((room * o.priceBps) / otherSum));
      o.priceBps = Math.max(MIN_PRICE_BPS, o.priceBps - cut);
      remaining -= cut;
    }
  });

  const drift = 10000 - next.reduce((sum, o) => sum + o.priceBps, 0);
  const anchor = next.find((o) => o.priceBps + drift >= MIN_PRICE_BPS) ?? next[0];
  anchor.priceBps += drift;
  return next;
}
