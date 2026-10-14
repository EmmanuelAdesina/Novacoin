import { asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import { appMeta, comments, follows, markets, outcomes, positions, users } from "./schema";
import { payoutFor } from "@/lib/market";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type OutcomeSeed = { key: string; label: string; priceBps: number };
type MarketSeed = {
  id: string;
  question: string;
  category: string;
  summary: string;
  source: string;
  rules: string;
  closeOffsetHours: number;
  resolveOffsetHours: number;
  featured?: boolean;
  resolvedKey?: string;
  outcomes: OutcomeSeed[];
};
type PositionSeed = {
  user: string;
  market: string;
  key: string;
  stake: number;
  priceBps: number;
  offsetMinutes: number;
  thesis?: string;
};

const PEOPLE = [
  {
    id: "you",
    handle: "amaka",
    displayName: "Amaka Okonkwo",
    city: "Lagos",
    country: "Nigeria",
    bio: "Sports and central bank questions. Small positions, written reasons. This is your demo account.",
    style: "Sports & policy",
    initials: "AO",
    hue: "#2FD47F",
    isYou: true,
    openingBalanceNgn: 250_000,
    joinedOffsetMinutes: -60 * 24 * 40,
  },
  {
    id: "ibrahim",
    handle: "ibrahim",
    displayName: "Ibrahim Sule",
    city: "Kano",
    country: "Nigeria",
    bio: "Reads central bank statements and release calendars, not headlines. Few positions, most of them right.",
    style: "Macro, low volume",
    initials: "IS",
    hue: "#3B82F6",
    isYou: false,
    openingBalanceNgn: 520_000,
    joinedOffsetMinutes: -60 * 24 * 210,
  },
  {
    id: "chioma",
    handle: "chioma",
    displayName: "Chioma Eze",
    city: "Abuja",
    country: "Nigeria",
    bio: "Entertainment first. Trailers, box office and reality TV fan bases are different evidence.",
    style: "Culture desk",
    initials: "CE",
    hue: "#F97316",
    isYou: false,
    openingBalanceNgn: 220_000,
    joinedOffsetMinutes: -60 * 24 * 160,
  },
  {
    id: "zainab",
    handle: "zainab",
    displayName: "Zainab Bello",
    city: "Lagos",
    country: "Nigeria",
    bio: "Small stakes, early prices. Looks for markets that the crowd has not priced yet.",
    style: "Early and small",
    initials: "ZB",
    hue: "#A855F7",
    isYou: false,
    openingBalanceNgn: 80_000,
    joinedOffsetMinutes: -60 * 24 * 70,
  },
  {
    id: "lara",
    handle: "lara",
    displayName: "Lara Mensah",
    city: "Accra",
    country: "Ghana",
    bio: "Only backs what a company or regulator has put in writing. Tech and business questions.",
    style: "Primary sources",
    initials: "LM",
    hue: "#14B8A6",
    isYou: false,
    openingBalanceNgn: 340_000,
    joinedOffsetMinutes: -60 * 24 * 130,
  },
  {
    id: "tunde",
    handle: "tunde",
    displayName: "Tunde Bakare",
    city: "Lagos",
    country: "Nigeria",
    bio: "Football volume. Knows the tables better than the pundits and says so when he is wrong.",
    style: "Matchweek regular",
    initials: "TB",
    hue: "#84CC16",
    isYou: false,
    openingBalanceNgn: 260_000,
    joinedOffsetMinutes: -60 * 24 * 240,
  },
  {
    id: "ngozi",
    handle: "ngozi",
    displayName: "Ngozi Okafor",
    city: "Port Harcourt",
    country: "Nigeria",
    bio: "Brings friends into markets. More interested in who finishes than who shouts.",
    style: "Community picks",
    initials: "NO",
    hue: "#EC4899",
    isYou: false,
    openingBalanceNgn: 140_000,
    joinedOffsetMinutes: -60 * 24 * 150,
  },
  {
    id: "samuel",
    handle: "samuel",
    displayName: "Samuel Kariuki",
    city: "Nairobi",
    country: "Kenya",
    bio: "World and politics. Reads the region as a neighbour, and is patient with long-dated questions.",
    style: "World & politics",
    initials: "SK",
    hue: "#EAB308",
    isYou: false,
    openingBalanceNgn: 280_000,
    joinedOffsetMinutes: -60 * 24 * 100,
  },
  {
    id: "daniel",
    handle: "daniel",
    displayName: "Daniel Adeyemi",
    city: "London",
    country: "United Kingdom",
    bio: "Large stakes, ordinary accuracy. A reminder that position size is not the same as skill.",
    style: "Big stakes",
    initials: "DA",
    hue: "#64748B",
    isYou: false,
    openingBalanceNgn: 1_800_000,
    joinedOffsetMinutes: -60 * 24 * 95,
  },
  {
    id: "funke",
    handle: "funke",
    displayName: "Funke Adelaja",
    city: "Ibadan",
    country: "Nigeria",
    bio: "Splits time between the pitch and the screen. Reads the crowd, then checks the source.",
    style: "Mixed slate",
    initials: "FA",
    hue: "#06B6D4",
    isYou: false,
    openingBalanceNgn: 180_000,
    joinedOffsetMinutes: -60 * 24 * 90,
  },
];

const MARKETS: MarketSeed[] = [
  {
    id: "eagles-next",
    question: "Will the Super Eagles win their next competitive match?",
    category: "sports",
    summary: "Form says Yes. A draw is the reason No is still worth a look.",
    source: "Full-time score from the official match report.",
    rules:
      "Yes if Nigeria wins in 90 minutes plus stoppage time. A draw or a defeat is No. Extra time and penalties do not count.",
    closeOffsetHours: 8,
    resolveOffsetHours: 14,
    featured: true,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5800 },
      { key: "no", label: "No", priceBps: 4200 },
    ],
  },
  {
    id: "npfl-table",
    question: "Which club will top the NPFL table after this matchweek?",
    category: "sports",
    summary: "Four ways to be right. Points decide first, then goal difference, then goals scored.",
    source: "Official league table after the final fixture of the matchweek.",
    rules:
      "The club first on points, then goal difference, then goals scored. Any club not listed settles as Other. Only fixtures played before the resolution time count.",
    closeOffsetHours: 11,
    resolveOffsetHours: 20,
    outcomes: [
      { key: "remo", label: "Remo Stars", priceBps: 3100 },
      { key: "enyimba", label: "Enyimba", priceBps: 2700 },
      { key: "rangers", label: "Rangers", priceBps: 2400 },
      { key: "other", label: "Other", priceBps: 1800 },
    ],
  },
  {
    id: "arsenal-next",
    question: "Will Arsenal win their next Premier League match?",
    category: "sports",
    summary: "Short price, long memory. The draw is what makes No interesting.",
    source: "Full-time score from the official Premier League fixture page.",
    rules: "Yes only with a win in 90 minutes plus stoppage time. A draw is No.",
    closeOffsetHours: 15,
    resolveOffsetHours: 22,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6100 },
      { key: "no", label: "No", priceBps: 3900 },
    ],
  },
  {
    id: "lagos-marathon",
    question: "Will the Lagos city marathon sell out its bibs before entries close?",
    category: "sports",
    summary: "Demand against a fixed number of bibs. The organiser decides when entries close.",
    source: "The organiser's sold-out notice on its official entries page.",
    rules:
      "Yes if the organiser announces a sold-out race before entries close. A waiting list on its own is No.",
    closeOffsetHours: 600,
    resolveOffsetHours: 648,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 7200 },
      { key: "no", label: "No", priceBps: 2800 },
    ],
  },
  {
    id: "cbn-hold",
    question: "Will the Central Bank of Nigeria hold its policy rate at the next meeting?",
    category: "business",
    summary: "Hold is the base case. The question is how hard the statement leans the other way.",
    source: "Policy rate published in the CBN's official communiqué.",
    rules:
      "Hold if the published policy rate is unchanged from the previous meeting. A change in either direction settles as Change.",
    closeOffsetHours: 72,
    resolveOffsetHours: 74,
    featured: true,
    outcomes: [
      { key: "hold", label: "Hold", priceBps: 6600 },
      { key: "change", label: "Change", priceBps: 3400 },
    ],
  },
  {
    id: "ai-open-weights",
    question: "Will a top AI lab release a new open-weights model this month?",
    category: "technology",
    summary: "Labs tend to ship open weights when a rival does. Two have said soon this quarter.",
    source: "Model weights published on the lab's official release page or model hub.",
    rules:
      "Yes if a lab in the current top five publishes new open weights before month end. Previews without downloadable weights do not count.",
    closeOffsetHours: 288,
    resolveOffsetHours: 312,
    featured: true,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4800 },
      { key: "no", label: "No", priceBps: 5200 },
    ],
  },
  {
    id: "nollywood-original",
    question: "Will this month's top Nollywood box-office film be an original story?",
    category: "entertainment",
    summary: "Sequels open big. Originals need word of mouth to catch up.",
    source: "Weekend box-office chart from a recognised tracker, read at month end.",
    rules:
      "Yes if the top-grossing film for the month is not a sequel, remake, or adaptation of an existing franchise.",
    closeOffsetHours: 216,
    resolveOffsetHours: 240,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5500 },
      { key: "no", label: "No", priceBps: 4500 },
    ],
  },
  {
    id: "power-bill",
    question: "Will the state assembly pass the power-tariff bill before recess?",
    category: "politics",
    summary: "Bills stall when committees go quiet. Recess is the deadline that matters.",
    source: "Assembly journal or official gazette showing third reading and passage.",
    rules:
      "Yes only if the bill passes third reading before the recess date. Committee approval alone is No.",
    closeOffsetHours: 960,
    resolveOffsetHours: 984,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 3700 },
      { key: "no", label: "No", priceBps: 6300 },
    ],
  },
  {
    id: "foldable",
    question: "Will a top-three phone maker announce a foldable phone before 31 December?",
    category: "technology",
    summary: "Rumours are cheap. An official announcement is not.",
    source: "Official press release or launch event from the manufacturer.",
    rules:
      "Yes on an official announcement that names a device. Leaks, analyst notes and supplier reports do not count.",
    closeOffsetHours: 1440,
    resolveOffsetHours: 1464,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4100 },
      { key: "no", label: "No", priceBps: 5900 },
    ],
  },
  {
    id: "g20-ai",
    question: "Will the next G20 leaders' communiqué name AI regulation directly?",
    category: "world",
    summary: "Communiqués are cautious. One clause decides it.",
    source: "Final communiqué text published by the host government.",
    rules:
      "Yes if the phrase 'AI regulation' or 'regulation of artificial intelligence' appears in the final text. 'AI governance' on its own is No.",
    closeOffsetHours: 2160,
    resolveOffsetHours: 2184,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5200 },
      { key: "no", label: "No", priceBps: 4800 },
    ],
  },
  {
    id: "lagos-after-dark",
    question: "Who wins the next season of Lagos After Dark?",
    category: "entertainment",
    summary: "A loud fan base is not the same as votes. Watch the final-week edits.",
    source: "Official winner announcement from the production.",
    rules:
      "The contestant named as winner in the final episode. Runners-up and eliminated contestants settle as Other.",
    closeOffsetHours: 720,
    resolveOffsetHours: 744,
    featured: true,
    outcomes: [
      { key: "tari", label: "Tari", priceBps: 3200 },
      { key: "jide", label: "Jide", priceBps: 2800 },
      { key: "kemi", label: "Kemi", priceBps: 2100 },
      { key: "other", label: "Other", priceBps: 1900 },
    ],
  },
  // Settled markets. Their results are simulated demo settlements, not official outcomes.
  {
    id: "r-eagles-friendly",
    question: "Did the Super Eagles win their last friendly?",
    category: "sports",
    summary: "Settled last week.",
    source: "Official match report.",
    rules: "Yes if Nigeria won in 90 minutes.",
    closeOffsetHours: -96,
    resolveOffsetHours: -72,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4800 },
      { key: "no", label: "No", priceBps: 5200 },
    ],
  },
  {
    id: "r-npfl-last",
    question: "Who topped the last NPFL matchweek table?",
    category: "sports",
    summary: "Settled after the final fixture.",
    source: "Official league table.",
    rules: "The club first on points, then goal difference, then goals scored.",
    closeOffsetHours: -120,
    resolveOffsetHours: -96,
    resolvedKey: "enyimba",
    outcomes: [
      { key: "remo", label: "Remo Stars", priceBps: 3000 },
      { key: "enyimba", label: "Enyimba", priceBps: 2700 },
      { key: "rangers", label: "Rangers", priceBps: 2600 },
      { key: "other", label: "Other", priceBps: 1700 },
    ],
  },
  {
    id: "r-arsenal-last",
    question: "Did Arsenal win their last Premier League match?",
    category: "sports",
    summary: "Settled on the final whistle.",
    source: "Full-time score from the official fixture page.",
    rules: "Yes only with a win in 90 minutes plus stoppage time.",
    closeOffsetHours: -240,
    resolveOffsetHours: -216,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6100 },
      { key: "no", label: "No", priceBps: 3900 },
    ],
  },
  {
    id: "r-rate-last",
    question: "Did the central bank hold its policy rate at the last meeting?",
    category: "business",
    summary: "Settled when the communiqué was published.",
    source: "Policy rate published in the CBN's official communiqué.",
    rules: "Hold if the rate was unchanged from the previous meeting.",
    closeOffsetHours: -168,
    resolveOffsetHours: -150,
    resolvedKey: "hold",
    outcomes: [
      { key: "hold", label: "Hold", priceBps: 6200 },
      { key: "change", label: "Change", priceBps: 3800 },
    ],
  },
  {
    id: "r-model-card",
    question: "Did a top AI lab publish a model card with its last release?",
    category: "technology",
    summary: "Settled on the lab's release page.",
    source: "The lab's official release page.",
    rules: "Yes if a full model card was published on launch day.",
    closeOffsetHours: -300,
    resolveOffsetHours: -280,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 7800 },
      { key: "no", label: "No", priceBps: 2200 },
    ],
  },
  {
    id: "r-nollywood-last",
    question: "Was last month's top Nollywood film an original story?",
    category: "entertainment",
    summary: "Settled at month end.",
    source: "Weekend box-office chart from a recognised tracker.",
    rules: "Yes if the top-grossing film was not a sequel or adaptation.",
    closeOffsetHours: -400,
    resolveOffsetHours: -380,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5000 },
      { key: "no", label: "No", priceBps: 5000 },
    ],
  },
  {
    id: "r-bill-last",
    question: "Did the assembly pass the tariff bill before its last recess?",
    category: "politics",
    summary: "Settled at recess.",
    source: "Assembly journal.",
    rules: "Yes only if the bill passed third reading before recess.",
    closeOffsetHours: -500,
    resolveOffsetHours: -480,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 3800 },
      { key: "no", label: "No", priceBps: 6200 },
    ],
  },
  {
    id: "r-show-final",
    question: "Who won the last season of Lagos After Dark?",
    category: "entertainment",
    summary: "Settled after the final episode.",
    source: "Official winner announcement from the production.",
    rules: "The contestant named as winner in the final episode.",
    closeOffsetHours: -600,
    resolveOffsetHours: -580,
    resolvedKey: "tari",
    outcomes: [
      { key: "tari", label: "Tari", priceBps: 3500 },
      { key: "jide", label: "Jide", priceBps: 3000 },
      { key: "kemi", label: "Kemi", priceBps: 2000 },
      { key: "other", label: "Other", priceBps: 1500 },
    ],
  },
];

// Demo positions. One per trader per market. Stakes in naira, prices in basis points (10000 = 100%).
const POSITIONS: PositionSeed[] = [
  // Amaka (you)
  { user: "you", market: "eagles-next", key: "yes", stake: 8000, priceBps: 5800, offsetMinutes: -180, thesis: "Home crowd and a settled back line. A draw still leaves me short." },
  { user: "you", market: "cbn-hold", key: "hold", stake: 12000, priceBps: 6600, offsetMinutes: -1200, thesis: "Hold is the base case. I would not pay above 70 for it." },
  { user: "you", market: "lagos-after-dark", key: "tari", stake: 5000, priceBps: 3200, offsetMinutes: -600 },
  { user: "you", market: "r-eagles-friendly", key: "yes", stake: 10000, priceBps: 4800, offsetMinutes: -17280 },
  { user: "you", market: "r-arsenal-last", key: "yes", stake: 8000, priceBps: 6100, offsetMinutes: -12960 },
  { user: "you", market: "r-rate-last", key: "hold", stake: 6000, priceBps: 6200, offsetMinutes: -8640 },
  { user: "you", market: "r-show-final", key: "jide", stake: 5000, priceBps: 3000, offsetMinutes: -4320 },
  // Ibrahim
  { user: "ibrahim", market: "eagles-next", key: "yes", stake: 20000, priceBps: 6000, offsetMinutes: -240, thesis: "Form is better than the table suggests." },
  { user: "ibrahim", market: "cbn-hold", key: "hold", stake: 35000, priceBps: 6900, offsetMinutes: -360, thesis: "A hold is the base case. I would not pay above 70 unless the statement changed." },
  { user: "ibrahim", market: "power-bill", key: "no", stake: 18000, priceBps: 6300, offsetMinutes: -420, thesis: "Recess is close and the committee has not met." },
  { user: "ibrahim", market: "foldable", key: "no", stake: 22000, priceBps: 5900, offsetMinutes: -2880, thesis: "'Later this year' is doing a lot of work in those leaks." },
  { user: "ibrahim", market: "ai-open-weights", key: "yes", stake: 15000, priceBps: 4800, offsetMinutes: -900 },
  { user: "ibrahim", market: "r-eagles-friendly", key: "yes", stake: 12000, priceBps: 4800, offsetMinutes: -17000 },
  { user: "ibrahim", market: "r-npfl-last", key: "enyimba", stake: 6000, priceBps: 2700, offsetMinutes: -21000 },
  { user: "ibrahim", market: "r-arsenal-last", key: "no", stake: 10000, priceBps: 3900, offsetMinutes: -13000 },
  { user: "ibrahim", market: "r-model-card", key: "yes", stake: 8000, priceBps: 7800, offsetMinutes: -9000 },
  { user: "ibrahim", market: "r-nollywood-last", key: "yes", stake: 5000, priceBps: 5000, offsetMinutes: -16000 },
  { user: "ibrahim", market: "r-rate-last", key: "hold", stake: 10000, priceBps: 6200, offsetMinutes: -8000 },
  { user: "ibrahim", market: "r-bill-last", key: "no", stake: 9000, priceBps: 6200, offsetMinutes: -7000 },
  { user: "ibrahim", market: "r-show-final", key: "jide", stake: 6000, priceBps: 3000, offsetMinutes: -6000 },
  // Chioma
  { user: "chioma", market: "nollywood-original", key: "yes", stake: 10000, priceBps: 5500, offsetMinutes: -700, thesis: "Originals are getting word of mouth this year." },
  { user: "chioma", market: "lagos-after-dark", key: "jide", stake: 6000, priceBps: 2800, offsetMinutes: -2000 },
  { user: "chioma", market: "g20-ai", key: "yes", stake: 4000, priceBps: 5200, offsetMinutes: -3000 },
  { user: "chioma", market: "r-nollywood-last", key: "yes", stake: 9000, priceBps: 5000, offsetMinutes: -15000 },
  { user: "chioma", market: "r-model-card", key: "yes", stake: 4000, priceBps: 7800, offsetMinutes: -9500 },
  { user: "chioma", market: "r-bill-last", key: "yes", stake: 6000, priceBps: 3800, offsetMinutes: -7500 },
  { user: "chioma", market: "r-show-final", key: "tari", stake: 8000, priceBps: 3500, offsetMinutes: -5000 },
  // Zainab
  { user: "zainab", market: "lagos-marathon", key: "yes", stake: 3000, priceBps: 7200, offsetMinutes: -500 },
  { user: "zainab", market: "foldable", key: "yes", stake: 2000, priceBps: 4100, offsetMinutes: -1500 },
  { user: "zainab", market: "r-npfl-last", key: "enyimba", stake: 2000, priceBps: 2700, offsetMinutes: -22000 },
  { user: "zainab", market: "r-arsenal-last", key: "yes", stake: 2000, priceBps: 6100, offsetMinutes: -13500 },
  // Lara
  { user: "lara", market: "cbn-hold", key: "change", stake: 16000, priceBps: 3400, offsetMinutes: -1400, thesis: "Rate cuts are on the table. I would rather be early than right on the day." },
  { user: "lara", market: "ai-open-weights", key: "yes", stake: 20000, priceBps: 4800, offsetMinutes: -2400, thesis: "Labs keep shipping weights when a rival does. Expect a second release." },
  { user: "lara", market: "g20-ai", key: "no", stake: 5000, priceBps: 4800, offsetMinutes: -4000 },
  { user: "lara", market: "r-model-card", key: "yes", stake: 12000, priceBps: 7800, offsetMinutes: -9200 },
  { user: "lara", market: "r-rate-last", key: "hold", stake: 9000, priceBps: 6200, offsetMinutes: -8200 },
  // Tunde
  { user: "tunde", market: "eagles-next", key: "yes", stake: 15000, priceBps: 5800, offsetMinutes: -300 },
  { user: "tunde", market: "npfl-table", key: "rangers", stake: 9000, priceBps: 2400, offsetMinutes: -900 },
  { user: "tunde", market: "arsenal-next", key: "yes", stake: 11000, priceBps: 6100, offsetMinutes: -180 },
  { user: "tunde", market: "r-eagles-friendly", key: "yes", stake: 14000, priceBps: 4800, offsetMinutes: -17100 },
  { user: "tunde", market: "r-npfl-last", key: "enyimba", stake: 8000, priceBps: 2700, offsetMinutes: -21500 },
  { user: "tunde", market: "r-arsenal-last", key: "no", stake: 9000, priceBps: 3900, offsetMinutes: -13200 },
  { user: "tunde", market: "r-bill-last", key: "yes", stake: 5000, priceBps: 3800, offsetMinutes: -7200 },
  // Ngozi
  { user: "ngozi", market: "lagos-marathon", key: "yes", stake: 6000, priceBps: 7200, offsetMinutes: -2200 },
  { user: "ngozi", market: "lagos-after-dark", key: "kemi", stake: 4000, priceBps: 2100, offsetMinutes: -1000 },
  { user: "ngozi", market: "r-show-final", key: "kemi", stake: 3000, priceBps: 2000, offsetMinutes: -5500 },
  // Samuel
  { user: "samuel", market: "g20-ai", key: "no", stake: 9000, priceBps: 4800, offsetMinutes: -800, thesis: "Communiqués are cautious. AI is mentioned, regulation less so." },
  { user: "samuel", market: "power-bill", key: "no", stake: 12000, priceBps: 6300, offsetMinutes: -600 },
  { user: "samuel", market: "r-bill-last", key: "no", stake: 7000, priceBps: 6200, offsetMinutes: -7100 },
  { user: "samuel", market: "r-rate-last", key: "hold", stake: 5000, priceBps: 6200, offsetMinutes: -8100 },
  // Daniel
  { user: "daniel", market: "foldable", key: "yes", stake: 150000, priceBps: 4100, offsetMinutes: -300, thesis: "Size is not conviction. This is the amount I can afford to be wrong about." },
  { user: "daniel", market: "eagles-next", key: "no", stake: 80000, priceBps: 4200, offsetMinutes: -200 },
  { user: "daniel", market: "r-arsenal-last", key: "yes", stake: 60000, priceBps: 6100, offsetMinutes: -13400 },
  { user: "daniel", market: "r-eagles-friendly", key: "no", stake: 40000, priceBps: 5200, offsetMinutes: -17200 },
  // Funke
  { user: "funke", market: "arsenal-next", key: "yes", stake: 6000, priceBps: 6100, offsetMinutes: -90 },
  { user: "funke", market: "nollywood-original", key: "no", stake: 4000, priceBps: 4500, offsetMinutes: -3600 },
  { user: "funke", market: "r-npfl-last", key: "rangers", stake: 5000, priceBps: 2600, offsetMinutes: -22500 },
  { user: "funke", market: "r-model-card", key: "yes", stake: 5000, priceBps: 7800, offsetMinutes: -9300 },
];

const COMMENTS: Array<{ market: string; user: string; body: string; offsetMinutes: number }> = [
  { market: "eagles-next", user: "tunde", body: "A draw is the likeliest single result on this sheet. Yes needs more than a point.", offsetMinutes: -90 },
  { market: "eagles-next", user: "funke", body: "The home crowd moves the price more than the team does.", offsetMinutes: -40 },
  { market: "cbn-hold", user: "ibrahim", body: "Hold is the story. Read the wording on the stance, not the headline.", offsetMinutes: -300 },
  { market: "cbn-hold", user: "lara", body: "A change would surprise me. Not by much.", offsetMinutes: -200 },
  { market: "lagos-after-dark", user: "chioma", body: "Jide has the fan base. Tari's edits are cleaner.", offsetMinutes: -150 },
  { market: "lagos-after-dark", user: "ngozi", body: "Kemi's supporters are organised. Organised is not the same as winning.", offsetMinutes: -100 },
  { market: "foldable", user: "lara", body: "No official date and no announcement yet. Still early.", offsetMinutes: -60 },
  { market: "foldable", user: "daniel", body: "Big position, ordinary read. Not a tip.", offsetMinutes: -250 },
  { market: "ai-open-weights", user: "ibrahim", body: "Following the release calendars, not the press.", offsetMinutes: -500 },
  { market: "ai-open-weights", user: "lara", body: "Two labs said soon this quarter. Soon is doing a lot of work.", offsetMinutes: -700 },
  { market: "nollywood-original", user: "chioma", body: "Sequels still open big. Originals are catching up on word of mouth.", offsetMinutes: -360 },
  { market: "power-bill", user: "samuel", body: "Recess is close. The committee calendar is still empty.", offsetMinutes: -400 },
];

const FOLLOWS: Array<[string, string, number]> = [
  ["you", "ibrahim", -20000],
  ["you", "tunde", -15000],
  ["you", "lara", -9000],
  ["you", "chioma", -6000],
  ["ibrahim", "tunde", -12000],
  ["ibrahim", "lara", -8000],
  ["ibrahim", "samuel", -4000],
  ["chioma", "ibrahim", -11000],
  ["chioma", "funke", -3000],
  ["chioma", "lara", -2000],
  ["zainab", "ibrahim", -5000],
  ["zainab", "tunde", -4000],
  ["zainab", "chioma", -3000],
  ["lara", "ibrahim", -7000],
  ["lara", "samuel", -3500],
  ["tunde", "ibrahim", -9000],
  ["tunde", "funke", -2000],
  ["ngozi", "tunde", -1000],
  ["ngozi", "chioma", -1500],
  ["ngozi", "zainab", -800],
  ["samuel", "ibrahim", -6000],
  ["samuel", "lara", -2500],
  ["daniel", "ibrahim", -2000],
  ["funke", "tunde", -2500],
  ["funke", "chioma", -1800],
  ["funke", "lara", -1600],
  ["funke", "ibrahim", -1000],
];

function assertSeed() {
  const peopleIds = new Set(PEOPLE.map((p) => p.id));
  const handles = new Set(PEOPLE.map((p) => p.handle));
  if (handles.size !== PEOPLE.length) throw new Error("Duplicate handles in seed");
  if (PEOPLE.filter((p) => p.isYou).length !== 1) throw new Error("Seed needs exactly one demo account");
  for (const market of MARKETS) {
    const sum = market.outcomes.reduce((s, o) => s + o.priceBps, 0);
    if (sum !== 10000) throw new Error(`Prices for ${market.id} sum to ${sum}`);
    if (market.resolvedKey && !market.outcomes.some((o) => o.key === market.resolvedKey)) {
      throw new Error(`Missing resolved key on ${market.id}`);
    }
  }
  const resolved = new Map(MARKETS.filter((m) => m.resolvedKey).map((m) => [m.id, m.resolvedKey]));
  const seen = new Set<string>();
  const balance = new Map<string, number>(PEOPLE.map((p) => [p.id, p.openingBalanceNgn]));
  for (const pos of POSITIONS) {
    if (!peopleIds.has(pos.user)) throw new Error(`Unknown trader ${pos.user}`);
    const market = MARKETS.find((m) => m.id === pos.market);
    if (!market) throw new Error(`Unknown market ${pos.market}`);
    if (!market.outcomes.some((o) => o.key === pos.key)) throw new Error(`Bad outcome ${pos.market}:${pos.key}`);
    const pair = `${pos.user}:${pos.market}`;
    if (seen.has(pair)) throw new Error(`Duplicate position ${pair}`);
    seen.add(pair);
    let delta = -pos.stake;
    if (resolved.get(pos.market) === pos.key) delta += payoutFor(pos.stake, pos.priceBps);
    balance.set(pos.user, (balance.get(pos.user) ?? 0) + delta);
  }
  for (const [id, value] of balance) {
    if (value < 0) throw new Error(`Negative demo balance for ${id}: ${value}`);
  }
}

export async function clearAll(tx: Tx) {
  await tx.delete(comments);
  await tx.delete(positions);
  await tx.delete(follows);
  await tx.delete(outcomes);
  await tx.delete(markets);
  await tx.delete(users);
  await tx.delete(appMeta);
}

export async function insertSeed(tx: Tx) {
  assertSeed();
  const now = new Date();
  await tx.insert(users).values(
    PEOPLE.map((p) => ({
      id: p.id,
      handle: p.handle,
      displayName: p.displayName,
      city: p.city,
      country: p.country,
      bio: p.bio,
      style: p.style,
      initials: p.initials,
      hue: p.hue,
      isYou: p.isYou,
      openingBalanceNgn: p.openingBalanceNgn,
      joinedOffsetMinutes: p.joinedOffsetMinutes,
      joinedAt: now,
    })),
  );
  await tx.insert(markets).values(
    MARKETS.map((m) => ({
      id: m.id,
      question: m.question,
      category: m.category,
      summary: m.summary,
      source: m.source,
      rules: m.rules,
      closeOffsetHours: m.closeOffsetHours,
      resolveOffsetHours: m.resolveOffsetHours,
      closesAt: now,
      resolvesAt: now,
      resolvedOutcomeId: m.resolvedKey ? `${m.id}__${m.resolvedKey}` : null,
      featured: Boolean(m.featured),
    })),
  );
  await tx.insert(outcomes).values(
    MARKETS.flatMap((m) =>
      m.outcomes.map((o, index) => ({
        id: `${m.id}__${o.key}`,
        marketId: m.id,
        key: o.key,
        label: o.label,
        priceBps: o.priceBps,
        sortOrder: index,
      })),
    ),
  );

  const marketById = new Map(MARKETS.map((m) => [m.id, m]));
  await tx.insert(positions).values(
    POSITIONS.map((p) => {
      const market = marketById.get(p.market)!;
      const settled = Boolean(market.resolvedKey);
      const correct = settled ? market.resolvedKey === p.key : null;
      const payout = correct ? payoutFor(p.stake, p.priceBps) : settled ? 0 : null;
      return {
        userId: p.user,
        marketId: p.market,
        outcomeId: `${p.market}__${p.key}`,
        stakeNgn: p.stake,
        priceBps: p.priceBps,
        payoutNgn: payout,
        settled,
        correct,
        thesis: p.thesis ?? null,
        createdAt: new Date(now.getTime() + p.offsetMinutes * 60_000),
        offsetMinutes: p.offsetMinutes,
      };
    }),
  );
  await tx.insert(comments).values(
    COMMENTS.map((c) => ({
      marketId: c.market,
      userId: c.user,
      body: c.body,
      createdAt: new Date(now.getTime() + c.offsetMinutes * 60_000),
      offsetMinutes: c.offsetMinutes,
    })),
  );
  await tx.insert(follows).values(
    FOLLOWS.map(([followerId, followingId, offsetMinutes]) => {
      const follower = PEOPLE.find((p) => p.id === followerId);
      const following = PEOPLE.find((p) => p.id === followingId);
      if (!follower || !following) throw new Error(`Bad follow ${followerId}->${followingId}`);
      return {
        followerId,
        followingId,
        createdAt: new Date(now.getTime() + offsetMinutes * 60_000),
        offsetMinutes,
      };
    }),
  );

  await tx.insert(appMeta).values({ id: "seed", clockAnchor: now });
  await reanchor(tx, now);
}

// Moves every seeded time relative to a new anchor, so markets keep closing in the future.
export async function reanchor(tx: Tx, anchor: Date) {
  const iso = anchor.toISOString();
  await tx.execute(sql`
    UPDATE markets
    SET closes_at = ${iso}::timestamptz + (close_offset_hours * interval '1 hour'),
        resolves_at = ${iso}::timestamptz + (resolve_offset_hours * interval '1 hour')
  `);
  await tx.execute(sql`
    UPDATE users
    SET joined_at = ${iso}::timestamptz + (joined_offset_minutes * interval '1 minute')
  `);
  for (const table of ["positions", "comments", "follows"]) {
    await tx.execute(
      sql.raw(`
        UPDATE ${table}
        SET created_at = '${iso}'::timestamptz + (offset_minutes * interval '1 minute')
        WHERE offset_minutes IS NOT NULL
      `),
    );
  }
  await tx.update(appMeta).set({ clockAnchor: anchor }).where(eq(appMeta.id, "seed"));
}

export async function ensureSeeded() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(84216421)`);
    const rows = await tx.select().from(appMeta).where(eq(appMeta.id, "seed"));
    if (rows.length === 0) {
      await insertSeed(tx);
      return;
    }
    const [soonest] = await tx
      .select({ closesAt: markets.closesAt })
      .from(markets)
      .where(isNull(markets.resolvedOutcomeId))
      .orderBy(asc(markets.closesAt))
      .limit(1);
    const stale = Date.now() - rows[0].clockAnchor.getTime() > 6 * 60 * 60 * 1000;
    const expired = soonest ? soonest.closesAt.getTime() < Date.now() : false;
    if (stale || expired) await reanchor(tx, new Date());
  });
}
