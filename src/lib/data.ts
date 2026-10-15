// Simple in-memory data store - NO DATABASE NEEDED
// Everything resets when you restart the dev server (perfect for a prototype)

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
  priceBps: number; // 10000 = 100%
};

export type Trader = Person & {
  city: string;
  bio: string;
  style: string;
  isYou: boolean;
  openingBalance: number;
  followers: string[];
  following: string[];
};

export type Position = {
  id: number;
  traderId: string;
  marketId: string;
  outcomeId: string;
  stake: number;
  priceBps: number;
  payout: number | null;
  status: PositionStatus;
  thesis: string | null;
  createdAt: number;
};

export type Comment = {
  id: number;
  traderId: string;
  marketId: string;
  body: string;
  createdAt: number;
};

export type Market = {
  id: string;
  question: string;
  category: string;
  simpleExplain: string; // Simple breakdown for students
  howWeDecide: string;
  closesAt: number;
  resolvesAt: number;
  status: MarketStatus;
  featured: boolean;
  settledOutcomeId: string | null;
  outcomes: Outcome[];
};

type AppState = {
  traders: Trader[];
  markets: Market[];
  positions: Position[];
  comments: Comment[];
  nextPositionId: number;
  nextCommentId: number;
};

// ------------ SEED DATA (relatable Nigerian youth content) ------------

const PEOPLE: Omit<Trader, "followers" | "following">[] = [
  {
    id: "you",
    handle: "you",
    name: "You",
    city: "Your Campus",
    bio: "Just getting started. We will grow step by step.",
    style: "New on the block",
    initials: "YU",
    hue: "#2FD47F",
    isYou: true,
    openingBalance: 100000,
  },
  {
    id: "chidi",
    handle: "chidiboi",
    name: "Chidi 'Sharp' Okoro",
    city: "UNILAG",
    bio: "Sports expert. If you need match tips, follow me. I do not miss.",
    style: "Sports analyst",
    initials: "CO",
    hue: "#3B82F6",
    isYou: false,
    openingBalance: 280000,
  },
  {
    id: "amina",
    handle: "aminaa",
    name: "Amina Yusuf",
    city: "ABU Zaria",
    bio: "I follow Nollywood and reality TV closely.",
    style: "Entertainment plug",
    initials: "AY",
    hue: "#F97316",
    isYou: false,
    openingBalance: 150000,
  },
  {
    id: "tobi",
    handle: "tobithegreat",
    name: "Tobi Bakare",
    city: "UI Ibadan",
    bio: "Tech enthusiast in training. I know when Apple or Google will release something.",
    style: "Tech & gadgets",
    initials: "TB",
    hue: "#A855F7",
    isYou: false,
    openingBalance: 95000,
  },
  {
    id: "nesa",
    handle: "nesaofficial",
    name: "Nesa Edoho",
    city: "UNIPORT",
    bio: "Politics and policy. CBN rate decisions do not pass me by.",
    style: "Policy watcher",
    initials: "NE",
    hue: "#14B8A6",
    isYou: false,
    openingBalance: 320000,
  },
  {
    id: "fave",
    handle: "favegirl",
    name: "Favour Okonkwo",
    city: "FUTA",
    bio: "Music, movies and trends. If it is trending, I see it first.",
    style: "Pop culture",
    initials: "FO",
    hue: "#EC4899",
    isYou: false,
    openingBalance: 75000,
  },
];

const MARKETS: Market[] = [
  {
    id: "eagles-next",
    question: "Will Super Eagles win their next match?",
    category: "Sports",
    simpleExplain: "Nigeria national team match. A win in 90 minutes counts as Yes. A draw or loss counts as No.",
    howWeDecide: "We use the official full-time score from CAF/FIFA. Extra time does not count.",
    closesAt: Date.now() + 8 * 3600 * 1000,
    resolvesAt: Date.now() + 14 * 3600 * 1000,
    status: "open",
    featured: true,
    settledOutcomeId: null,
    outcomes: [
      { id: "eagles-next__yes", key: "yes", label: "Yes, they will win", priceBps: 5800 },
      { id: "eagles-next__no", key: "no", label: "No (draw or loss)", priceBps: 4200 },
    ],
  },
  {
    id: "cbn-rate",
    question: "Will the CBN change the interest rate next week?",
    category: "Money Matter",
    simpleExplain: "Central Bank meeting. If the rate stays the same, it is Hold. If it changes, it is Change.",
    howWeDecide: "We read the official CBN statement after the meeting.",
    closesAt: Date.now() + 72 * 3600 * 1000,
    resolvesAt: Date.now() + 75 * 3600 * 1000,
    status: "open",
    featured: true,
    settledOutcomeId: null,
    outcomes: [
      { id: "cbn-rate__hold", key: "hold", label: "Hold (no change)", priceBps: 6500 },
      { id: "cbn-rate__change", key: "change", label: "Change it", priceBps: 3500 },
    ],
  },
  {
    id: "bbnaija-winner",
    question: "Who will win Big Brother Naija next season?",
    category: "Entertainment",
    simpleExplain: "Pick who you think will win the ₦100M prize. Do not just follow online noise.",
    howWeDecide: "Official winner announcement on the live finale show.",
    closesAt: Date.now() + 720 * 3600 * 1000,
    resolvesAt: Date.now() + 745 * 3600 * 1000,
    status: "open",
    featured: true,
    settledOutcomeId: null,
    outcomes: [
      { id: "bbnaija-winner__korede", key: "korede", label: "Korede", priceBps: 2800 },
      { id: "bbnaija-winner__zara", key: "zara", label: "Zara", priceBps: 2400 },
      { id: "bbnaija-winner__ebuka", key: "ebuka", label: "Ebuka", priceBps: 2200 },
      { id: "bbnaija-winner__other", key: "other", label: "Another person", priceBps: 2600 },
    ],
  },
  {
    id: "fuel-price",
    question: "Will fuel price go up before December?",
    category: "Money Matter",
    simpleExplain: "If the petrol pump price increases anywhere before December 1, it is Yes.",
    howWeDecide: "We check the official NNPCL pump price nationwide.",
    closesAt: Date.now() + 960 * 3600 * 1000,
    resolvesAt: Date.now() + 985 * 3600 * 1000,
    status: "open",
    featured: false,
    settledOutcomeId: null,
    outcomes: [
      { id: "fuel-price__yes", key: "yes", label: "Yes, it will increase", priceBps: 4100 },
      { id: "fuel-price__no", key: "no", label: "No, it will stay the same", priceBps: 5900 },
    ],
  },
  {
    id: "asuu-strike",
    question: "Will ASUU call a strike this semester?",
    category: "Campus",
    simpleExplain: "If ASUU declares a nationwide strike before the semester ends, it is Yes.",
    howWeDecide: "Official ASUU press release or circular.",
    closesAt: Date.now() + 480 * 3600 * 1000,
    resolvesAt: Date.now() + 504 * 3600 * 1000,
    status: "open",
    featured: false,
    settledOutcomeId: null,
    outcomes: [
      { id: "asuu-strike__yes", key: "yes", label: "Yes, a strike will happen", priceBps: 3800 },
      { id: "asuu-strike__no", key: "no", label: "No strike", priceBps: 6200 },
    ],
  },
  {
    id: "davido-album",
    question: "Will Davido release a new album before the end of the year?",
    category: "Entertainment",
    simpleExplain: "If OBO releases a full album (not singles) before December 31, it is Yes.",
    howWeDecide: "Official release on streaming platforms (Spotify, Apple Music, etc).",
    closesAt: Date.now() + 1440 * 3600 * 1000,
    resolvesAt: Date.now() + 1464 * 3600 * 1000,
    status: "open",
    featured: false,
    settledOutcomeId: null,
    outcomes: [
      { id: "davido-album__yes", key: "yes", label: "Yes, album drops", priceBps: 5200 },
      { id: "davido-album__no", key: "no", label: "No", priceBps: 4800 },
    ],
  },
  {
    id: "iphone-nigeria",
    question: "Will the iPhone 16 sell for less than ₦1.5M in Nigeria before January?",
    category: "Tech",
    simpleExplain: "If the official or slot price drops below ₦1.5M for the base model, it is Yes.",
    howWeDecide: "We check Slot, Jumia and official Apple stores.",
    closesAt: Date.now() + 1200 * 3600 * 1000,
    resolvesAt: Date.now() + 1224 * 3600 * 1000,
    status: "open",
    featured: false,
    settledOutcomeId: null,
    outcomes: [
      { id: "iphone-nigeria__yes", key: "yes", label: "Yes, price will drop", priceBps: 3300 },
      { id: "iphone-nigeria__no", key: "no", label: "No, it will stay high", priceBps: 6700 },
    ],
  },
  {
    id: "arsenal-title",
    question: "Will Arsenal win the Premier League this season?",
    category: "Sports",
    simpleExplain: "If Arsenal finish top of the EPL table in May, it is Yes.",
    howWeDecide: "Final Premier League table at end of season.",
    closesAt: Date.now() + 3600 * 3600 * 1000,
    resolvesAt: Date.now() + 3650 * 3600 * 1000,
    status: "open",
    featured: false,
    settledOutcomeId: null,
    outcomes: [
      { id: "arsenal-title__yes", key: "yes", label: "Yes, they will win it", priceBps: 2700 },
      { id: "arsenal-title__no", key: "no", label: "No, another club wins", priceBps: 7300 },
    ],
  },
  // Settled examples (past results)
  {
    id: "r-eagles-last",
    question: "Super Eagles win their last friendly?",
    category: "Sports",
    simpleExplain: "That match has ended. The result is out.",
    howWeDecide: "Official match report.",
    closesAt: Date.now() - 96 * 3600 * 1000,
    resolvesAt: Date.now() - 72 * 3600 * 1000,
    status: "settled",
    featured: false,
    settledOutcomeId: "r-eagles-last__yes",
    outcomes: [
      { id: "r-eagles-last__yes", key: "yes", label: "Yes", priceBps: 5000 },
      { id: "r-eagles-last__no", key: "no", label: "No", priceBps: 5000 },
    ],
  },
  {
    id: "r-asuu-last",
    question: "ASUU call strike last semester?",
    category: "Campus",
    simpleExplain: "That one has ended. ASUU did not call a strike.",
    howWeDecide: "ASUU official statement.",
    closesAt: Date.now() - 500 * 3600 * 1000,
    resolvesAt: Date.now() - 480 * 3600 * 1000,
    status: "settled",
    featured: false,
    settledOutcomeId: "r-asuu-last__no",
    outcomes: [
      { id: "r-asuu-last__yes", key: "yes", label: "Yes", priceBps: 4000 },
      { id: "r-asuu-last__no", key: "no", label: "No", priceBps: 6000 },
    ],
  },
];

// Demo positions people have already placed
const SEED_POSITIONS: Omit<Position, "id" | "createdAt">[] = [
  // You
  { traderId: "you", marketId: "eagles-next", outcomeId: "eagles-next__yes", stake: 5000, priceBps: 5800, payout: null, status: "open", thesis: "Home advantage. The team is in good form right now." },
  { traderId: "you", marketId: "cbn-rate", outcomeId: "cbn-rate__hold", stake: 8000, priceBps: 6500, payout: null, status: "open", thesis: "CBN does not rush to change things." },
  { traderId: "you", marketId: "r-eagles-last", outcomeId: "r-eagles-last__yes", stake: 3000, priceBps: 5000, payout: 6000, status: "won", thesis: null },
  { traderId: "you", marketId: "r-asuu-last", outcomeId: "r-asuu-last__yes", stake: 4000, priceBps: 4000, payout: 0, status: "lost", thesis: "I thought a strike would happen. I was wrong." },
  // Chidi
  { traderId: "chidi", marketId: "eagles-next", outcomeId: "eagles-next__yes", stake: 15000, priceBps: 5600, payout: null, status: "open", thesis: "Form is good. A draw is the only risk." },
  { traderId: "chidi", marketId: "arsenal-title", outcomeId: "arsenal-title__no", stake: 20000, priceBps: 7300, payout: null, status: "open", thesis: "Man City is still there. Arsenal will not win it." },
  { traderId: "chidi", marketId: "r-eagles-last", outcomeId: "r-eagles-last__yes", stake: 10000, priceBps: 5000, payout: 20000, status: "won", thesis: null },
  // Amina
  { traderId: "amina", marketId: "bbnaija-winner", outcomeId: "bbnaija-winner__zara", stake: 7000, priceBps: 2500, payout: null, status: "open", thesis: "Zara has fans who do not sleep." },
  { traderId: "amina", marketId: "davido-album", outcomeId: "davido-album__yes", stake: 5000, priceBps: 5200, payout: null, status: "open", thesis: "OBO has not released an album in a while." },
  // Tobi
  { traderId: "tobi", marketId: "iphone-nigeria", outcomeId: "iphone-nigeria__no", stake: 12000, priceBps: 6700, payout: null, status: "open", thesis: "The dollar is still high. Price will not drop." },
  { traderId: "tobi", marketId: "cbn-rate", outcomeId: "cbn-rate__hold", stake: 6000, priceBps: 6500, payout: null, status: "open", thesis: "I do not see the rate changing anytime soon." },
  // Nesa
  { traderId: "nesa", marketId: "cbn-rate", outcomeId: "cbn-rate__hold", stake: 25000, priceBps: 6700, payout: null, status: "open", thesis: "Inflation is still high. Hold is the call." },
  { traderId: "nesa", marketId: "fuel-price", outcomeId: "fuel-price__no", stake: 15000, priceBps: 5900, payout: null, status: "open", thesis: "Subsidy has already settled. No more increase this year." },
  { traderId: "nesa", marketId: "r-asuu-last", outcomeId: "r-asuu-last__no", stake: 8000, priceBps: 6000, payout: 13333, status: "won", thesis: null },
  // Fave
  { traderId: "fave", marketId: "bbnaija-winner", outcomeId: "bbnaija-winner__korede", stake: 4000, priceBps: 2800, payout: null, status: "open", thesis: "Korede has the energy. People love him." },
  { traderId: "fave", marketId: "davido-album", outcomeId: "davido-album__yes", stake: 3000, priceBps: 5200, payout: null, status: "open", thesis: "He has been teasing the album for a while." },
];

const SEED_COMMENTS: Omit<Comment, "id" | "createdAt">[] = [
  { traderId: "chidi", body: "The Eagles defence is solid now. I do not see a loss here.", marketId: "eagles-next" } as any,
  { traderId: "tobi", body: "It is not only about defence. An away match is a different thing.", marketId: "eagles-next" } as any,
  { traderId: "nesa", body: "Do not listen to news headlines. Read the CBN communique before you place a bet.", marketId: "cbn-rate" } as any,
  { traderId: "amina", body: "Zara fans are different on Twitter. They do not play.", marketId: "bbnaija-winner" } as any,
];

// Fix - add marketId to comments
const COMMENTS_DATA: Array<{ traderId: string; marketId: string; body: string }> = [
  { traderId: "chidi", marketId: "eagles-next", body: "The Eagles defence is solid now. I do not see a loss here." },
  { traderId: "tobi", marketId: "eagles-next", body: "It is not only about defence. An away match is a different thing." },
  { traderId: "nesa", marketId: "cbn-rate", body: "Do not listen to news headlines. Read the CBN communique before you place a bet." },
  { traderId: "amina", marketId: "bbnaija-winner", body: "Zara fans are different on Twitter. They do not sleep." },
  { traderId: "fave", marketId: "davido-album", body: "OBO has posted studio pictures 3 times this month. Album loading." },
];

const FOLLOWS: [string, string][] = [
  ["you", "chidi"],
  ["you", "amina"],
  ["you", "tobi"],
  ["chidi", "nesa"],
  ["amina", "fave"],
  ["tobi", "nesa"],
];

// ------------ STATE MANAGEMENT ------------

function createInitialState(): AppState {
  const traders: Trader[] = PEOPLE.map((p) => ({
    ...p,
    followers: [],
    following: [],
  }));

  // Apply follows
  for (const [followerId, followingId] of FOLLOWS) {
    const follower = traders.find((t) => t.id === followerId);
    const following = traders.find((t) => t.id === followingId);
    if (follower && following) {
      follower.following.push(followingId);
      following.followers.push(followerId);
    }
  }

  let posId = 1;
  let cmtId = 1;
  const positions: Position[] = SEED_POSITIONS.map((p) => ({
    ...p,
    id: posId++,
    createdAt: Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000),
  }));
  const comments: Comment[] = COMMENTS_DATA.map((c) => ({
    ...c,
    id: cmtId++,
    createdAt: Date.now() - Math.floor(Math.random() * 3 * 24 * 3600 * 1000),
  }));

  return {
    traders,
    markets: MARKETS.map((m) => ({ ...m })),
    positions,
    comments,
    nextPositionId: posId,
    nextCommentId: cmtId,
  };
}

// Global state (resets on server restart - perfect for prototype)
let state: AppState = createInitialState();

export function resetState() {
  state = createInitialState();
}

// ------------ GETTERS ------------

export function personFromId(id: string): Person {
  const t = state.traders.find((t) => t.id === id);
  if (!t) return { id, handle: "unknown", name: "Unknown", initials: "??", hue: "#6B7280" };
  return { id: t.id, handle: t.handle, name: t.name, initials: t.initials, hue: t.hue };
}

export function getYou() {
  return state.traders.find((t) => t.isYou)!;
}

export function calculateBalance(traderId: string): number {
  const trader = state.traders.find((t) => t.id === traderId);
  if (!trader) return 0;
  let bal = trader.openingBalance;
  for (const p of state.positions.filter((p) => p.traderId === traderId)) {
    if (p.status === "open") {
      bal -= p.stake;
    } else if (p.status === "won") {
      bal -= p.stake;
      bal += p.payout ?? 0;
    } else if (p.status === "lost") {
      bal -= p.stake;
    }
  }
  return bal;
}

export function getTraderStats(traderId: string) {
  const mine = state.positions.filter((p) => p.traderId === traderId);
  const settled = mine.filter((p) => p.status !== "open");
  const open = mine.filter((p) => p.status === "open");
  const wins = settled.filter((p) => p.status === "won").length;
  const invested = settled.reduce((s, p) => s + p.stake, 0);
  const returned = settled.reduce((s, p) => s + (p.payout ?? 0), 0);
  return {
    settled: settled.length,
    wins,
    openCount: open.length,
    accuracy: settled.length ? wins / settled.length : null,
    profit: returned - invested,
    returnRatio: invested ? (returned - invested) / invested : null,
    balance: calculateBalance(traderId),
  };
}

export function getMarketViews() {
  const now = Date.now();
  return state.markets.map((m) => {
    let status = m.status;
    if (status === "open" && m.closesAt <= now) status = "closed";

    const marketPositions = state.positions.filter((p) => p.marketId === m.id);
    const traderCount = new Set(marketPositions.map((p) => p.traderId)).size;
    const volume = marketPositions.reduce((s, p) => s + p.stake, 0);
    const comments = state.comments
      .filter((c) => c.marketId === m.id)
      .map((c) => ({ ...c, trader: personFromId(c.traderId) }))
      .sort((a, b) => b.createdAt - a.createdAt);

    const resolvedOutcome = m.settledOutcomeId
      ? m.outcomes.find((o) => o.id === m.settledOutcomeId) ?? null
      : null;

    return {
      ...m,
      status,
      settledLabel: resolvedOutcome?.label ?? null,
      traderCount,
      volume,
      positions: marketPositions.map((p) => positionToView(p)),
      comments,
    };
  });
}

export function positionToView(p: Position) {
  const market = state.markets.find((m) => m.id === p.marketId)!;
  const outcome = market.outcomes.find((o) => o.id === p.outcomeId)!;
  const marketStatus = market.status === "settled" ? "settled" as const
    : market.closesAt <= Date.now() ? "closed" as const
    : "open" as const;
  return {
    id: p.id,
    trader: personFromId(p.traderId),
    traderId: p.traderId,
    marketId: p.marketId,
    question: market.question,
    category: market.category,
    outcomeId: p.outcomeId,
    outcomeLabel: outcome.label,
    stake: p.stake,
    priceBps: p.priceBps,
    potential: payoutFor(p.stake, p.priceBps),
    payout: p.payout,
    status: p.status,
    thesis: p.thesis,
    createdAt: new Date(p.createdAt).toISOString(),
    bigBet: p.stake >= 15000,
    marketStatus,
  };
}

export function getData() {
  const markets = getMarketViews();
  const positions = markets.flatMap((m) => m.positions).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const you = getYou();
  const youStats = getTraderStats(you.id);

  const traders = state.traders.map((t) => {
    const stats = getTraderStats(t.id);
    return {
      ...t,
      ...stats,
      openStake: state.positions.filter((p) => p.traderId === t.id && p.status === "open").reduce((s, p) => s + p.stake, 0),
      ranked: stats.settled >= 2,
    };
  });

  return {
    you: traders.find((t) => t.isYou)!,
    traders,
    markets: markets.sort((a, b) => a.closesAt - b.closesAt),
    positions,
    generatedAt: new Date().toISOString(),
  };
}

// ------------ MUTATIONS ------------

export const MIN_POSITION_NGN = 500;
export const MAX_POSITION_NGN = 2000000;
export const MAX_NOTE_LENGTH = 180;
export const MAX_COMMENT_LENGTH = 280;

const PRICE_DEPTH_NGN = 500000;
const MIN_PRICE_BPS = 500;
const MAX_PRICE_BPS = 9500;

export function payoutFor(stake: number, priceBps: number) {
  if (stake <= 0 || priceBps <= 0) return 0;
  return Math.floor((stake * 10000) / priceBps);
}

type ActionResult = { ok: true; message: string } | { ok: false; error: string };

export function placePosition(marketId: string, outcomeId: string, stake: number, thesis: string | null): ActionResult {
  const market = state.markets.find((m) => m.id === marketId);
  if (!market) return { ok: false, error: "We could not find that market." };
  if (market.status === "settled") return { ok: false, error: "This market has already ended." };
  if (market.closesAt <= Date.now()) return { ok: false, error: "Betting has closed for this market." };

  const outcome = market.outcomes.find((o) => o.id === outcomeId);
  if (!outcome) return { ok: false, error: "Please pick one option." };

  const existing = state.positions.find((p) => p.traderId === "you" && p.marketId === marketId);
  if (existing) return { ok: false, error: "You have already placed a bet on this market. Only one bet per market." };

  const bal = calculateBalance("you");
  if (stake > bal) return { ok: false, error: `Your demo balance is not enough. You have ₦${bal.toLocaleString("en-NG")}.` };
  if (stake < MIN_POSITION_NGN) return { ok: false, error: `Minimum bet is ₦${MIN_POSITION_NGN}.` };
  if (stake > MAX_POSITION_NGN) return { ok: false, error: `Maximum bet is ₦${MAX_POSITION_NGN.toLocaleString("en-NG")}.` };

  const entryPrice = outcome.priceBps;
  state.positions.push({
    id: state.nextPositionId++,
    traderId: "you",
    marketId,
    outcomeId,
    stake,
    priceBps: entryPrice,
    payout: null,
    status: "open",
    thesis: thesis && thesis.trim() ? thesis.trim() : null,
    createdAt: Date.now(),
  });

  // Move prices a bit
  const shift = Math.min(300, Math.round((stake / (PRICE_DEPTH_NGN + stake)) * 10000));
  const room = Math.min(MAX_PRICE_BPS, outcome.priceBps + shift) - outcome.priceBps;
  outcome.priceBps += room;
  const others = market.outcomes.filter((o) => o.id !== outcomeId);
  let remaining = room;
  const otherSum = others.reduce((s, o) => s + o.priceBps, 0) || 1;
  others.forEach((o, idx) => {
    if (idx === others.length - 1) {
      o.priceBps = Math.max(MIN_PRICE_BPS, o.priceBps - remaining);
    } else {
      const cut = Math.min(remaining, Math.round((room * o.priceBps) / otherSum));
      o.priceBps = Math.max(MIN_PRICE_BPS, o.priceBps - cut);
      remaining -= cut;
    }
  });

  const potential = payoutFor(stake, entryPrice);
  return {
    ok: true,
    message: `You placed ₦${stake.toLocaleString("en-NG")} on "${outcome.label}". If you win, you collect ₦${potential.toLocaleString("en-NG")} back. Demo money only, no real cash.`,
  };
}

export function settleMarket(marketId: string, outcomeId: string): ActionResult {
  const market = state.markets.find((m) => m.id === marketId);
  if (!market) return { ok: false, error: "Market not found." };
  if (market.status === "settled") return { ok: false, error: "This market has already been settled." };
  const winner = market.outcomes.find((o) => o.id === outcomeId);
  if (!winner) return { ok: false, error: "Please pick a winner." };

  market.status = "settled";
  market.settledOutcomeId = winner.id;

  for (const p of state.positions.filter((p) => p.marketId === marketId)) {
    if (p.outcomeId === winner.id) {
      p.status = "won";
      p.payout = payoutFor(p.stake, p.priceBps);
    } else {
      p.status = "lost";
      p.payout = 0;
    }
  }

  return {
    ok: true,
    message: `Settled: ${winner.label} wins. All bets updated. Remember, this is a demo result.`,
  };
}

export function toggleFollow(targetHandle: string): ActionResult {
  const target = state.traders.find((t) => t.handle === targetHandle);
  const you = getYou();
  if (!target) return { ok: false, error: "Person not found." };
  if (target.id === you.id) return { ok: false, error: "You cannot follow yourself." };

  const youFollowIdx = you.following.indexOf(target.id);
  const targetFollowerIdx = target.followers.indexOf(you.id);

  if (youFollowIdx >= 0) {
    you.following.splice(youFollowIdx, 1);
    if (targetFollowerIdx >= 0) target.followers.splice(targetFollowerIdx, 1);
    return { ok: true, message: `You have unfollowed ${target.name}.` };
  } else {
    you.following.push(target.id);
    target.followers.push(you.id);
    return { ok: true, message: `You are now following ${target.name}.` };
  }
}

export function postComment(marketId: string, body: string): ActionResult {
  const market = state.markets.find((m) => m.id === marketId);
  if (!market) return { ok: false, error: "Market not found." };
  state.comments.push({
    id: state.nextCommentId++,
    traderId: "you",
    marketId,
    body: body.trim(),
    createdAt: Date.now(),
  });
  return { ok: true, message: "Comment posted." };
}

export function resetDemo(): ActionResult {
  resetState();
  return { ok: true, message: "Demo reset. Everything is back to the start." };
}

// Helper functions for views
export function leaderboard(sort: "return" | "accuracy" = "return") {
  const data = getData();
  const ranked = data.traders.filter((t) => t.ranked);
  ranked.sort((a: any, b: any) => {
    if (sort === "accuracy") return (b.accuracy ?? 0) - (a.accuracy ?? 0);
    return (b.returnRatio ?? 0) - (a.returnRatio ?? 0);
  });
  const unranked = data.traders.filter((t) => !t.ranked);
  return { ranked, unranked };
}

export function feedFor(scope: "following" | "everyone") {
  const data = getData();
  const followed = new Set(data.you.following);
  return data.positions.filter((p: any) => {
    if (p.traderId === data.you.id) return scope === "everyone";
    return scope === "everyone" || followed.has(p.traderId);
  });
}

export function trendingMarkets(limit = 4) {
  const data = getData();
  return data.markets
    .filter((m) => m.status === "open")
    .sort((a, b) => b.traderCount - a.traderCount || b.volume - a.volume)
    .slice(0, limit);
}

export function followedInMarket(market: any) {
  const data = getData();
  const followed = new Set(data.you.following);
  const found = new Map<string, Person>();
  for (const p of market.positions) {
    if (followed.has(p.trader.id)) found.set(p.trader.id, p.trader);
  }
  return [...found.values()];
}

export function marketById(id: string) {
  return getData().markets.find((m) => m.id === id) ?? null;
}

export function traderByHandle(handle: string) {
  return getData().traders.find((t) => t.handle.toLowerCase() === handle.toLowerCase()) ?? null;
}

export const CATEGORIES = [
  { id: "Sports", label: "Sports" },
  { id: "Money Matter", label: "Money Matter" },
  { id: "Entertainment", label: "Entertainment" },
  { id: "Campus", label: "Campus" },
  { id: "Tech", label: "Tech" },
];

export function categoryLabel(id: string) {
  return id;
}
