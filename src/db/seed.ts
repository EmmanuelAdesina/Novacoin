import { asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./index";
import {
  activity,
  appMeta,
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
} from "./schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type OutcomeSeed = { key: string; label: string; priceBps: number };
type MarketSeed = {
  id: string;
  question: string;
  category: string;
  summary: string;
  resolutionSource: string;
  resolutionRule: string;
  demoNote: string;
  closeOffsetHours: number;
  resolveOffsetHours: number;
  resolvedKey?: string;
  featured?: boolean;
  outcomes: OutcomeSeed[];
};
type CallSeed = {
  user: string;
  market: string;
  key: string;
  stake: number;
  offsetMinutes: number;
  priceBps: number;
  thesis?: string;
};

const days = (d: number) => -Math.round(d * 24 * 60);
const hours = (h: number) => -Math.round(h * 60);

const PEOPLE = [
  {
    id: "you",
    handle: "you",
    displayName: "Amaka Okonkwo",
    city: "Lagos",
    country: "Nigeria",
    bio: "This is the shared demonstration seat. Calls, rooms, and follows you record here stay until the demo is reset. It is not an identity check.",
    style: "Careful starter",
    initials: "AO",
    hue: "#1B4636",
    isYou: true,
    openingPurseNgn: 250_000,
    joinedOffsetMinutes: days(40),
  },
  {
    id: "ibrahim",
    handle: "ibrahim",
    displayName: "Ibrahim Sule",
    city: "Kano",
    country: "Nigeria",
    bio: "Reads the macro sheet and skips the noise. Few calls, mostly favorites, usually written down. Demonstration profile.",
    style: "Macro, low volume",
    initials: "IS",
    hue: "#23415F",
    isYou: false,
    openingPurseNgn: 520_000,
    joinedOffsetMinutes: days(210),
  },
  {
    id: "chioma",
    handle: "chioma",
    displayName: "Chioma Eze",
    city: "Abuja",
    country: "Nigeria",
    bio: "Entertainment first. Treats edits, screen time, and crowd noise as different evidence. Demonstration profile.",
    style: "Culture desk",
    initials: "CE",
    hue: "#8A3918",
    isYou: false,
    openingPurseNgn: 220_000,
    joinedOffsetMinutes: days(160),
  },
  {
    id: "zainab",
    handle: "zainab",
    displayName: "Zainab Bello",
    city: "Lagos",
    country: "Nigeria",
    bio: "University reader. Small demo stakes, looking for prices that feel lazy. Rising form, still a short record. Demonstration profile.",
    style: "Campus, selective",
    initials: "ZB",
    hue: "#6E4A78",
    isYou: false,
    openingPurseNgn: 80_000,
    joinedOffsetMinutes: days(70),
  },
  {
    id: "lara",
    handle: "lara",
    displayName: "Lara Mensah",
    city: "Accra",
    country: "Ghana",
    bio: "Technology only when the resolution source is a document, not a rumour. Reads the Nigerian slate from Accra. Demonstration profile.",
    style: "Primary sources",
    initials: "LM",
    hue: "#1F4E4A",
    isYou: false,
    openingPurseNgn: 340_000,
    joinedOffsetMinutes: days(130),
  },
  {
    id: "emeka",
    handle: "emeka",
    displayName: "Emeka Nwosu",
    city: "Enugu",
    country: "Nigeria",
    bio: "Enters the rooms. Treats a season of contests as the record, not a single loud call. Demonstration profile.",
    style: "Tournament grinder",
    initials: "EN",
    hue: "#7A4E1D",
    isYou: false,
    openingPurseNgn: 180_000,
    joinedOffsetMinutes: days(190),
  },
  {
    id: "tunde",
    handle: "tunde",
    displayName: "Tunde Bakare",
    city: "Lagos",
    country: "Nigeria",
    bio: "Football volume. Will tell you when a draw settles No. Accurate enough, not a purse story. Demonstration profile.",
    style: "Matchweek volume",
    initials: "TB",
    hue: "#3E4C28",
    isYou: false,
    openingPurseNgn: 260_000,
    joinedOffsetMinutes: days(240),
  },
  {
    id: "ngozi",
    handle: "ngozi",
    displayName: "Ngozi Okafor",
    city: "Port Harcourt",
    country: "Nigeria",
    bio: "Pulls people into rooms. More interested in who finishes than who shouts. Demonstration profile.",
    style: "Community seats",
    initials: "NO",
    hue: "#7C3148",
    isYou: false,
    openingPurseNgn: 140_000,
    joinedOffsetMinutes: days(150),
  },
  {
    id: "samuel",
    handle: "samuel",
    displayName: "Samuel Kariuki",
    city: "Nairobi",
    country: "Kenya",
    bio: "World and public events. Based in Nairobi, reads the Nigerian circuit as a neighbour, not a tourist. Demonstration profile.",
    style: "Cross-border desk",
    initials: "SK",
    hue: "#3A3F4B",
    isYou: false,
    openingPurseNgn: 280_000,
    joinedOffsetMinutes: days(100),
  },
  {
    id: "daniel",
    handle: "daniel",
    displayName: "Daniel Adeyemi",
    city: "London",
    country: "United Kingdom",
    bio: "Diaspora purse, ordinary accuracy. Useful as a reminder that the board does not rank wealth. Demonstration profile.",
    style: "Large purse, mixed sheet",
    initials: "DA",
    hue: "#4E4638",
    isYou: false,
    openingPurseNgn: 1_800_000,
    joinedOffsetMinutes: days(95),
  },
  {
    id: "funke",
    handle: "funke",
    displayName: "Funke Adelaja",
    city: "Ibadan",
    country: "Nigeria",
    bio: "Splits time between the pitch and the screen. Social reader, not a signal service. Demonstration profile.",
    style: "Mixed slate",
    initials: "FA",
    hue: "#245C6B",
    isYou: false,
    openingPurseNgn: 110_000,
    joinedOffsetMinutes: days(80),
  },
] as const;

const MARKETS: MarketSeed[] = [
  {
    id: "eagles-next",
    question: "Will the Super Eagles win their next fixture on the demonstration slate?",
    category: "sports",
    summary: "A home fixture on the scripted slate. The useful argument is not the nickname. It is whether a draw settles No.",
    resolutionSource: "Full-time score on the demonstration slate sheet, standing in for an official competition report.",
    resolutionRule:
      "Yes only if the Super Eagles win in 90 minutes plus stoppage time. A draw or a loss is No. Extra time and penalties are not part of this question. If the fixture is postponed past the resolution time, a live circuit would void the call and return the demo stake. This prototype does not simulate postponement.",
    demoNote: "Fictional fixture. Not a live match. Not affiliated with the Nigeria Football Federation.",
    closeOffsetHours: 8,
    resolveOffsetHours: 14,
    featured: true,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5800 },
      { key: "no", label: "No", priceBps: 4200 },
    ],
  },
  {
    id: "npfl-week",
    question: "Which club tops the demonstration NPFL table after this matchweek?",
    category: "sports",
    summary: "Four ways, not a yes/no. The price is a share of 100, not a score prediction.",
    resolutionSource: "The demonstration matchweek table, published after every listed fixture has a full-time score.",
    resolutionRule:
      "The club in first place on points, then goal difference, then goals scored. If two clubs are still tied, the call settles as Other. Postponed fixtures that are unplayed at the resolution time push the question to void in a live circuit.",
    demoNote: "Demonstration table. Club names are familiar public clubs. Sabi is not affiliated with the NPFL or any club.",
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
    id: "arsenal-slate",
    question: "Will Arsenal win their next match on the demonstration Premier League slate?",
    category: "sports",
    summary: "Included because people already talk about it. The slate is scripted, not a live book.",
    resolutionSource: "Full-time score on the demonstration Premier League slate sheet.",
    resolutionRule:
      "Yes only with a win in 90 minutes plus stoppage time. A draw is No. Cup ties, extra time, and penalties are a different question and do not count.",
    demoNote: "Not a live betting market. Not affiliated with Arsenal Football Club or the Premier League.",
    closeOffsetHours: 15,
    resolveOffsetHours: 22,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6100 },
      { key: "no", label: "No", priceBps: 3900 },
    ],
  },
  {
    id: "abuja-marathon",
    question: "Will the demonstration Abuja marathon sell out its bibs before entries close?",
    category: "world",
    summary: "A public logistics question. The resolution is a number on an entry sheet, not a vibe.",
    resolutionSource: "The demonstration organiser sheet: bibs issued versus bibs available at the published entry deadline.",
    resolutionRule:
      "Yes if issued bibs equal the published cap before the deadline. A waiting list does not count. If the cap is raised after this question opens, a live circuit would void it.",
    demoNote: "Fictional race operations. Not a real Abuja marathon announcement.",
    closeOffsetHours: 18,
    resolveOffsetHours: 30,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6300 },
      { key: "no", label: "No", priceBps: 3700 },
    ],
  },
  {
    id: "cbn-hold",
    question: "Will the demonstration policy-rate meeting end with no change?",
    category: "business",
    summary: "The base case is a hold. The argument is whether 66% is already too expensive for that base case.",
    resolutionSource: "The decision line on the demonstration policy sheet, published at the meeting's close.",
    resolutionRule:
      "Yes if the published decision is an unchanged rate. Any increase or cut is No. A split statement with no decision voids the call in a live circuit. This is not a forecast of an actual Central Bank meeting.",
    demoNote: "Illustration only. Not a live rate, not affiliated with the Central Bank of Nigeria, and not financial advice.",
    closeOffsetHours: 22,
    resolveOffsetHours: 28,
    featured: true,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6600 },
      { key: "no", label: "No", priceBps: 3400 },
    ],
  },
  {
    id: "lagos-after-dark",
    question: "Who wins the demonstration season of Lagos After Dark?",
    category: "entertainment",
    summary: "A fictional show with four remaining contestants. Edit patterns are the evidence readers are arguing about.",
    resolutionSource: "The winner named in the demonstration finale caption, not a fan poll.",
    resolutionRule:
      "The named winner. A co-winner or a cancelled finale voids the call in a live circuit. Social votes outside the caption do not count.",
    demoNote: "Lagos After Dark is a fictional programme invented for this prototype.",
    closeOffsetHours: 28,
    resolveOffsetHours: 40,
    featured: true,
    outcomes: [
      { key: "kemi", label: "Kemi", priceBps: 3400 },
      { key: "jide", label: "Jide", priceBps: 2800 },
      { key: "amara", label: "Amara", priceBps: 2200 },
      { key: "field", label: "The field", priceBps: 1600 },
    ],
  },
  {
    id: "naira-week",
    question: "Will the demonstration naira reference finish the circuit week stronger than it started?",
    category: "business",
    summary: "A reference print on a sheet, not a live FX feed. Stronger means fewer naira per illustrative dollar.",
    resolutionSource: "The demonstration circuit sheet: Monday print versus the Friday print.",
    resolutionRule:
      "Yes if the Friday print is a lower naira-per-dollar figure than Monday. Equal prints are No. This is not a tradable FX rate and not a quote from any bureau.",
    demoNote: "Static demonstration prints. Not a live exchange rate.",
    closeOffsetHours: 34,
    resolveOffsetHours: 46,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4800 },
      { key: "no", label: "No", priceBps: 5200 },
    ],
  },
  {
    id: "nollywood-original",
    question: "Will the demonstration Nollywood box-office leader this month be an original, not a sequel?",
    category: "entertainment",
    summary: "Original means the film is not marketed as a numbered sequel, remake, or cinematic universe chapter.",
    resolutionSource: "The top grosser on the demonstration monthly box-office sheet, plus its official title card.",
    resolutionRule:
      "Yes if the top film's title card does not identify it as a sequel, prequel, or remake. A tie on gross voids the call in a live circuit.",
    demoNote: "Fictional box-office sheet. Not an industry ranking and not affiliated with any studio.",
    closeOffsetHours: 40,
    resolveOffsetHours: 70,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5400 },
      { key: "no", label: "No", priceBps: 4600 },
    ],
  },
  {
    id: "btc-print",
    question: "Will the demonstration Bitcoin reference print finish above $120,000?",
    category: "business",
    summary: "A round number people anchor to. The print is on the circuit sheet, not a live exchange.",
    resolutionSource: "The closing print on the demonstration circuit sheet at the resolution time.",
    resolutionRule:
      "Yes if that single print is strictly above 120,000 US dollars. Intraday spikes that are not the official print do not count. Not a live price.",
    demoNote: "Static demonstration print. Not a market quote, not investment advice, and not affiliated with any exchange.",
    closeOffsetHours: 46,
    resolveOffsetHours: 52,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4400 },
      { key: "no", label: "No", priceBps: 5600 },
    ],
  },
  {
    id: "power-bill",
    question: "Will the demonstration state assembly pass the power-tariff bill before recess?",
    category: "politics",
    summary: "A fictional legislature and a fictional bill. The resolution is a vote record, not a headline.",
    resolutionSource: "The demonstration assembly journal: a recorded final vote before the published recess time.",
    resolutionRule:
      "Yes only if the journal shows a final passage vote before recess. Committee approval is not passage. If recess is moved earlier, a live circuit uses the time printed when this question opened.",
    demoNote: "Fictional assembly. Not a claim about any real government, party, or election.",
    closeOffsetHours: 56,
    resolveOffsetHours: 80,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4100 },
      { key: "no", label: "No", priceBps: 5900 },
    ],
  },
  {
    id: "foldable",
    question: "Will a top-three phone maker announce a new foldable before the demonstration deadline?",
    category: "technology",
    summary: "Announcement means a named product on an official company page, not a supply-chain rumour.",
    resolutionSource: "Official product pages of the three companies named on the demonstration sheet.",
    resolutionRule:
      "Yes if any one of those pages publishes a new foldable product name before the deadline. A teaser with no product name is No. Leaks do not count.",
    demoNote: "Companies are unnamed on purpose. Not affiliated with any handset maker.",
    closeOffsetHours: 68,
    resolveOffsetHours: 90,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 3600 },
      { key: "no", label: "No", priceBps: 6400 },
    ],
  },
  {
    id: "ai-weights",
    question: "Will a top-five AI lab release a new open-weights model before the demonstration month ends?",
    category: "technology",
    summary: "Open weights means downloadable model weights, not a blog post about a closed API.",
    resolutionSource: "The lab's official release note or model card, linked from the demonstration sheet.",
    resolutionRule:
      "Yes if weights are publicly downloadable before the deadline. A waitlist, a research preview without weights, or a closed API is No.",
    demoNote: "No lab is named. Not a rumour about any real company, and not affiliated with one.",
    closeOffsetHours: 90,
    resolveOffsetHours: 110,
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4700 },
      { key: "no", label: "No", priceBps: 5300 },
    ],
  },
  {
    id: "r-eagles-friendly",
    question: "Did the Super Eagles win the demonstration friendly against the scripted visitors?",
    category: "sports",
    summary: "Settled example. Kept so records have a past, not because the match is live.",
    resolutionSource: "Full-time score on the demonstration slate sheet.",
    resolutionRule: "Yes with a win in 90 minutes plus stoppage time. Draw or loss was No.",
    demoNote: "Already resolved inside the prototype. Not a historical claim about a real fixture.",
    closeOffsetHours: -220,
    resolveOffsetHours: -200,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5600 },
      { key: "no", label: "No", priceBps: 4400 },
    ],
  },
  {
    id: "r-npfl-last",
    question: "Who topped the previous demonstration NPFL matchweek?",
    category: "sports",
    summary: "Settled four-way. Enyimba led the scripted table.",
    resolutionSource: "Demonstration matchweek table.",
    resolutionRule: "First on points, then goal difference, then goals scored.",
    demoNote: "Scripted result. Not an actual NPFL table.",
    closeOffsetHours: -180,
    resolveOffsetHours: -168,
    resolvedKey: "enyimba",
    outcomes: [
      { key: "remo", label: "Remo Stars", priceBps: 3000 },
      { key: "enyimba", label: "Enyimba", priceBps: 3400 },
      { key: "rangers", label: "Rangers", priceBps: 2200 },
      { key: "other", label: "Other", priceBps: 1400 },
    ],
  },
  {
    id: "r-arsenal-last",
    question: "Did Arsenal win the previous match on the demonstration slate?",
    category: "sports",
    summary: "Settled No. A draw was enough.",
    resolutionSource: "Demonstration slate full-time score.",
    resolutionRule: "Yes only with a win. The scripted result was a draw, so No.",
    demoNote: "Scripted result. Not affiliated with Arsenal Football Club.",
    closeOffsetHours: -150,
    resolveOffsetHours: -140,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6400 },
      { key: "no", label: "No", priceBps: 3600 },
    ],
  },
  {
    id: "r-cup-tie",
    question: "Did the demonstration cup tie go to the home side?",
    category: "sports",
    summary: "Settled Yes. Penalties were explicitly excluded.",
    resolutionSource: "Demonstration cup sheet, 90 minutes plus stoppage time.",
    resolutionRule: "Yes if the home side led at full time. Penalties were out of scope.",
    demoNote: "Fictional tie. Not a real cup result.",
    closeOffsetHours: -120,
    resolveOffsetHours: -110,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5100 },
      { key: "no", label: "No", priceBps: 4900 },
    ],
  },
  {
    id: "r-ai-summit",
    question: "Did the demonstration AI lab publish a model card before the summit deadline?",
    category: "technology",
    summary: "Settled Yes. The card was a document, not a keynote slide.",
    resolutionSource: "Official model card linked from the demonstration sheet.",
    resolutionRule: "Yes if the card was public before the deadline.",
    demoNote: "Fictional lab. Not a claim about a real company.",
    closeOffsetHours: -200,
    resolveOffsetHours: -188,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4900 },
      { key: "no", label: "No", priceBps: 5100 },
    ],
  },
  {
    id: "r-chip-delay",
    question: "Did the demonstration chip shipment miss its dated window?",
    category: "technology",
    summary: "Settled No. The shipment landed inside the window.",
    resolutionSource: "The manufacturer's demonstration shipment notice.",
    resolutionRule: "Yes only if the notice showed a miss. It did not.",
    demoNote: "Fictional supply notice. Not affiliated with any chip maker.",
    closeOffsetHours: -96,
    resolveOffsetHours: -84,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4200 },
      { key: "no", label: "No", priceBps: 5800 },
    ],
  },
  {
    id: "r-model-card",
    question: "Did the second demonstration lab publish open weights with the card?",
    category: "technology",
    summary: "Settled Yes. Weights were downloadable, not described.",
    resolutionSource: "Demonstration release note with a public weights link.",
    resolutionRule: "Yes only if weights were downloadable before the deadline.",
    demoNote: "Fictional release. Not a claim about a real lab.",
    closeOffsetHours: -70,
    resolveOffsetHours: -60,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4500 },
      { key: "no", label: "No", priceBps: 5500 },
    ],
  },
  {
    id: "r-outage",
    question: "Did the demonstration cloud region post a Sev-1 in that window?",
    category: "technology",
    summary: "Settled No. Status page stayed below Sev-1.",
    resolutionSource: "Demonstration status page archive.",
    resolutionRule: "Yes only if a Sev-1 notice was posted inside the window.",
    demoNote: "Fictional status page. Not a real incident.",
    closeOffsetHours: -48,
    resolveOffsetHours: -40,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 3300 },
      { key: "no", label: "No", priceBps: 6700 },
    ],
  },
  {
    id: "r-nollywood-last",
    question: "Was last month's demonstration box-office leader an original?",
    category: "entertainment",
    summary: "Settled Yes. The scripted leader was an original.",
    resolutionSource: "Demonstration monthly box-office sheet and title card.",
    resolutionRule: "Yes if the top title card was not a sequel, prequel, or remake.",
    demoNote: "Fictional chart. Not an industry ranking.",
    closeOffsetHours: -130,
    resolveOffsetHours: -118,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 5200 },
      { key: "no", label: "No", priceBps: 4800 },
    ],
  },
  {
    id: "r-show-final",
    question: "Who won the previous demonstration season of Lagos After Dark?",
    category: "entertainment",
    summary: "Settled. Tari was named in the finale caption.",
    resolutionSource: "Demonstration finale caption.",
    resolutionRule: "The named winner. Fan polls were irrelevant.",
    demoNote: "Fictional programme and fictional result.",
    closeOffsetHours: -80,
    resolveOffsetHours: -72,
    resolvedKey: "tari",
    outcomes: [
      { key: "tari", label: "Tari", priceBps: 3600 },
      { key: "jide", label: "Jide", priceBps: 2800 },
      { key: "kemi", label: "Kemi", priceBps: 2400 },
      { key: "amara", label: "Amara", priceBps: 1200 },
    ],
  },
  {
    id: "r-rate-last",
    question: "Did the previous demonstration policy meeting hold the rate?",
    category: "business",
    summary: "Settled Yes. A hold, as the sheet printed it.",
    resolutionSource: "Decision line on the demonstration policy sheet.",
    resolutionRule: "Yes if the published decision was unchanged. It was.",
    demoNote: "Not an actual Central Bank decision. Illustration only.",
    closeOffsetHours: -110,
    resolveOffsetHours: -100,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 7000 },
      { key: "no", label: "No", priceBps: 3000 },
    ],
  },
  {
    id: "r-earnings-demo",
    question: "Did the demonstration listed bank beat the scripted earnings line?",
    category: "business",
    summary: "Settled No. The print missed the line.",
    resolutionSource: "The bank's demonstration earnings notice.",
    resolutionRule: "Yes only if reported profit was above the line printed when the question opened.",
    demoNote: "Fictional bank print. Not a real earnings release and not investment advice.",
    closeOffsetHours: -88,
    resolveOffsetHours: -76,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4600 },
      { key: "no", label: "No", priceBps: 5400 },
    ],
  },
  {
    id: "r-fx-last",
    question: "Did the previous demonstration naira reference finish stronger?",
    category: "business",
    summary: "Settled No. The Friday print was weaker than Monday.",
    resolutionSource: "Demonstration circuit sheet, Monday versus Friday.",
    resolutionRule: "Yes only if Friday showed fewer naira per illustrative dollar.",
    demoNote: "Static prints. Not a live FX rate.",
    closeOffsetHours: -40,
    resolveOffsetHours: -32,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4900 },
      { key: "no", label: "No", priceBps: 5100 },
    ],
  },
  {
    id: "r-marathon-last",
    question: "Did the previous demonstration city race sell out?",
    category: "world",
    summary: "Settled Yes. Bibs hit the cap.",
    resolutionSource: "Demonstration organiser sheet.",
    resolutionRule: "Yes if issued bibs equalled the published cap before the deadline.",
    demoNote: "Fictional race. Not a real event announcement.",
    closeOffsetHours: -160,
    resolveOffsetHours: -150,
    resolvedKey: "yes",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 6000 },
      { key: "no", label: "No", priceBps: 4000 },
    ],
  },
  {
    id: "r-bill-last",
    question: "Did the previous demonstration assembly pass its tariff bill before recess?",
    category: "politics",
    summary: "Settled No. The journal shows no final vote.",
    resolutionSource: "Demonstration assembly journal.",
    resolutionRule: "Yes only with a recorded final passage vote. Committee noise did not count.",
    demoNote: "Fictional legislature. Not a claim about any real government.",
    closeOffsetHours: -64,
    resolveOffsetHours: -52,
    resolvedKey: "no",
    outcomes: [
      { key: "yes", label: "Yes", priceBps: 4400 },
      { key: "no", label: "No", priceBps: 5600 },
    ],
  },
];

const CALLS: CallSeed[] = [
  { user: "you", market: "r-eagles-friendly", key: "yes", stake: 10000, offsetMinutes: days(12), priceBps: 4800 },
  { user: "you", market: "r-arsenal-last", key: "yes", stake: 8000, offsetMinutes: days(9), priceBps: 6100 },
  { user: "you", market: "r-rate-last", key: "yes", stake: 6000, offsetMinutes: days(6), priceBps: 6200 },
  { user: "you", market: "r-show-final", key: "jide", stake: 5000, offsetMinutes: days(3), priceBps: 2800 },
  {
    user: "you",
    market: "cbn-hold",
    key: "yes",
    stake: 12000,
    offsetMinutes: hours(20),
    priceBps: 6400,
    thesis: "The demonstration sheet has been calm. I am treating a hold as the base case, not a trade. 66 still feels expensive.",
  },

  { user: "ibrahim", market: "r-eagles-friendly", key: "yes", stake: 24000, offsetMinutes: days(30), priceBps: 8400 },
  { user: "ibrahim", market: "r-npfl-last", key: "enyimba", stake: 20000, offsetMinutes: days(26), priceBps: 8200 },
  { user: "ibrahim", market: "r-arsenal-last", key: "no", stake: 22000, offsetMinutes: days(22), priceBps: 8000 },
  { user: "ibrahim", market: "r-cup-tie", key: "yes", stake: 18000, offsetMinutes: days(18), priceBps: 8300 },
  { user: "ibrahim", market: "r-ai-summit", key: "yes", stake: 26000, offsetMinutes: days(28), priceBps: 8500 },
  { user: "ibrahim", market: "r-chip-delay", key: "no", stake: 20000, offsetMinutes: days(12), priceBps: 8200 },
  { user: "ibrahim", market: "r-nollywood-last", key: "no", stake: 8000, offsetMinutes: days(16), priceBps: 4200 },
  { user: "ibrahim", market: "r-show-final", key: "jide", stake: 6000, offsetMinutes: days(7), priceBps: 3000 },
  { user: "ibrahim", market: "r-rate-last", key: "yes", stake: 30000, offsetMinutes: days(14), priceBps: 8600 },
  { user: "ibrahim", market: "r-earnings-demo", key: "no", stake: 28000, offsetMinutes: days(10), priceBps: 8400 },
  { user: "ibrahim", market: "r-marathon-last", key: "yes", stake: 16000, offsetMinutes: days(20), priceBps: 8100 },
  { user: "ibrahim", market: "r-bill-last", key: "no", stake: 18000, offsetMinutes: days(8), priceBps: 8000 },
  { user: "ibrahim", market: "r-fx-last", key: "no", stake: 24000, offsetMinutes: days(5), priceBps: 8300 },
  { user: "ibrahim", market: "r-model-card", key: "yes", stake: 15000, offsetMinutes: days(9), priceBps: 7800 },
  {
    user: "ibrahim",
    market: "cbn-hold",
    key: "yes",
    stake: 35000,
    offsetMinutes: hours(6),
    priceBps: 6900,
    thesis: "A hold is the base case on the demonstration sheet. I would not pay above 70 unless the summary note changed.",
  },
  {
    user: "ibrahim",
    market: "btc-print",
    key: "no",
    stake: 25000,
    offsetMinutes: hours(5),
    priceBps: 5200,
    thesis: "This is a reference print, not a live book. Round numbers attract hopeful Yes calls. I am on No.",
  },
  { user: "ibrahim", market: "naira-week", key: "no", stake: 22000, offsetMinutes: hours(7), priceBps: 5000 },
  { user: "ibrahim", market: "power-bill", key: "no", stake: 18000, offsetMinutes: hours(7), priceBps: 5600 },
  { user: "ibrahim", market: "abuja-marathon", key: "no", stake: 16000, offsetMinutes: hours(3), priceBps: 4000 },
  { user: "ibrahim", market: "ai-weights", key: "yes", stake: 20000, offsetMinutes: hours(9), priceBps: 4400 },

  { user: "chioma", market: "r-nollywood-last", key: "yes", stake: 14000, offsetMinutes: days(18), priceBps: 4600 },
  { user: "chioma", market: "r-show-final", key: "tari", stake: 16000, offsetMinutes: days(6), priceBps: 3400 },
  { user: "chioma", market: "r-eagles-friendly", key: "yes", stake: 8000, offsetMinutes: days(20), priceBps: 5500 },
  { user: "chioma", market: "r-ai-summit", key: "yes", stake: 7000, offsetMinutes: days(24), priceBps: 5000 },
  { user: "chioma", market: "r-earnings-demo", key: "yes", stake: 9000, offsetMinutes: days(11), priceBps: 4000 },
  { user: "chioma", market: "r-arsenal-last", key: "no", stake: 8000, offsetMinutes: days(19), priceBps: 4000 },
  { user: "chioma", market: "r-chip-delay", key: "no", stake: 5000, offsetMinutes: days(9), priceBps: 4800 },
  { user: "chioma", market: "r-rate-last", key: "yes", stake: 10000, offsetMinutes: days(13), priceBps: 7000 },
  { user: "chioma", market: "r-npfl-last", key: "remo", stake: 7000, offsetMinutes: days(17), priceBps: 3200 },
  { user: "chioma", market: "r-marathon-last", key: "yes", stake: 6000, offsetMinutes: days(15), priceBps: 5800 },
  { user: "chioma", market: "r-fx-last", key: "no", stake: 8000, offsetMinutes: days(4), priceBps: 4700 },
  { user: "chioma", market: "r-model-card", key: "yes", stake: 5000, offsetMinutes: days(8), priceBps: 4200 },
  {
    user: "chioma",
    market: "lagos-after-dark",
    key: "kemi",
    stake: 18000,
    offsetMinutes: hours(5),
    priceBps: 3000,
    thesis: "Kemi's edit pattern in the last two demonstration episodes is the tell. The room is overrating the loudest argument.",
  },
  { user: "chioma", market: "nollywood-original", key: "yes", stake: 14000, offsetMinutes: hours(5), priceBps: 5000 },
  { user: "chioma", market: "arsenal-slate", key: "yes", stake: 8000, offsetMinutes: hours(4), priceBps: 5800 },
  { user: "chioma", market: "ai-weights", key: "yes", stake: 4000, offsetMinutes: hours(3), priceBps: 4500 },

  { user: "zainab", market: "r-eagles-friendly", key: "yes", stake: 2000, offsetMinutes: days(11), priceBps: 4200 },
  { user: "zainab", market: "r-npfl-last", key: "enyimba", stake: 1800, offsetMinutes: days(8), priceBps: 3400 },
  { user: "zainab", market: "r-cup-tie", key: "yes", stake: 1500, offsetMinutes: days(6), priceBps: 3800 },
  { user: "zainab", market: "r-chip-delay", key: "no", stake: 1200, offsetMinutes: days(4), priceBps: 3600 },
  { user: "zainab", market: "r-nollywood-last", key: "yes", stake: 2000, offsetMinutes: days(15), priceBps: 4000 },
  { user: "zainab", market: "r-show-final", key: "tari", stake: 2500, offsetMinutes: days(2), priceBps: 3200 },
  { user: "zainab", market: "r-ai-summit", key: "yes", stake: 1500, offsetMinutes: days(20), priceBps: 4400 },
  { user: "zainab", market: "r-arsenal-last", key: "yes", stake: 1000, offsetMinutes: days(22), priceBps: 6100 },
  { user: "zainab", market: "r-fx-last", key: "yes", stake: 1200, offsetMinutes: days(18), priceBps: 4800 },
  { user: "zainab", market: "r-model-card", key: "yes", stake: 1600, offsetMinutes: days(3), priceBps: 3900 },
  { user: "zainab", market: "eagles-next", key: "yes", stake: 2000, offsetMinutes: hours(3), priceBps: 5400 },
  { user: "zainab", market: "npfl-week", key: "remo", stake: 1500, offsetMinutes: hours(2), priceBps: 2900 },
  { user: "zainab", market: "lagos-after-dark", key: "amara", stake: 2500, offsetMinutes: hours(2), priceBps: 2000 },
  { user: "zainab", market: "foldable", key: "no", stake: 1000, offsetMinutes: hours(2), priceBps: 6000 },

  { user: "lara", market: "r-ai-summit", key: "yes", stake: 22000, offsetMinutes: days(25), priceBps: 5200 },
  { user: "lara", market: "r-chip-delay", key: "no", stake: 18000, offsetMinutes: days(10), priceBps: 4500 },
  { user: "lara", market: "r-model-card", key: "yes", stake: 20000, offsetMinutes: days(8), priceBps: 4800 },
  { user: "lara", market: "r-outage", key: "no", stake: 16000, offsetMinutes: days(5), priceBps: 6200 },
  { user: "lara", market: "r-rate-last", key: "yes", stake: 15000, offsetMinutes: days(12), priceBps: 7000 },
  { user: "lara", market: "r-earnings-demo", key: "no", stake: 16000, offsetMinutes: days(9), priceBps: 5500 },
  { user: "lara", market: "r-fx-last", key: "no", stake: 14000, offsetMinutes: days(4), priceBps: 5000 },
  { user: "lara", market: "r-eagles-friendly", key: "no", stake: 8000, offsetMinutes: days(21), priceBps: 4800 },
  { user: "lara", market: "r-arsenal-last", key: "no", stake: 12000, offsetMinutes: days(16), priceBps: 4000 },
  { user: "lara", market: "r-bill-last", key: "yes", stake: 9000, offsetMinutes: days(7), priceBps: 4200 },
  { user: "lara", market: "r-nollywood-last", key: "no", stake: 6000, offsetMinutes: days(14), priceBps: 4800 },
  { user: "lara", market: "r-marathon-last", key: "yes", stake: 10000, offsetMinutes: days(19), priceBps: 6000 },
  {
    user: "lara",
    market: "ai-weights",
    key: "yes",
    stake: 28000,
    offsetMinutes: hours(6),
    priceBps: 4300,
    thesis: "Open weights are a distribution choice, not a rumour. I want the release note, not the timeline chatter.",
  },
  {
    user: "lara",
    market: "foldable",
    key: "no",
    stake: 22000,
    offsetMinutes: hours(8),
    priceBps: 6000,
    thesis: "Announcement windows slip. 36% is still rich for a dated demonstration deadline.",
  },
  { user: "lara", market: "btc-print", key: "no", stake: 20000, offsetMinutes: hours(6), priceBps: 5400 },
  { user: "lara", market: "cbn-hold", key: "yes", stake: 12000, offsetMinutes: hours(8), priceBps: 6500 },
  { user: "lara", market: "naira-week", key: "no", stake: 8000, offsetMinutes: hours(6), priceBps: 4900 },
  { user: "lara", market: "eagles-next", key: "no", stake: 10000, offsetMinutes: hours(9), priceBps: 4500 },

  { user: "emeka", market: "r-eagles-friendly", key: "yes", stake: 12000, offsetMinutes: days(29), priceBps: 5400 },
  { user: "emeka", market: "r-npfl-last", key: "enyimba", stake: 10000, offsetMinutes: days(25), priceBps: 3600 },
  { user: "emeka", market: "r-arsenal-last", key: "yes", stake: 9000, offsetMinutes: days(18), priceBps: 6000 },
  { user: "emeka", market: "r-cup-tie", key: "yes", stake: 11000, offsetMinutes: days(15), priceBps: 5000 },
  { user: "emeka", market: "r-ai-summit", key: "yes", stake: 8000, offsetMinutes: days(27), priceBps: 4700 },
  { user: "emeka", market: "r-chip-delay", key: "yes", stake: 7000, offsetMinutes: days(11), priceBps: 4000 },
  { user: "emeka", market: "r-outage", key: "no", stake: 6000, offsetMinutes: days(6), priceBps: 6400 },
  { user: "emeka", market: "r-model-card", key: "no", stake: 5000, offsetMinutes: days(8), priceBps: 5200 },
  { user: "emeka", market: "r-rate-last", key: "no", stake: 8000, offsetMinutes: days(13), priceBps: 3200 },
  { user: "emeka", market: "r-earnings-demo", key: "yes", stake: 9000, offsetMinutes: days(10), priceBps: 4500 },
  { user: "emeka", market: "r-fx-last", key: "yes", stake: 7000, offsetMinutes: days(4), priceBps: 4800 },
  { user: "emeka", market: "r-bill-last", key: "no", stake: 6000, offsetMinutes: days(7), priceBps: 5400 },
  { user: "emeka", market: "r-show-final", key: "kemi", stake: 4000, offsetMinutes: days(6), priceBps: 2500 },
  { user: "emeka", market: "r-marathon-last", key: "yes", stake: 5000, offsetMinutes: days(19), priceBps: 5800 },
  { user: "emeka", market: "eagles-next", key: "yes", stake: 15000, offsetMinutes: hours(8), priceBps: 5600 },
  { user: "emeka", market: "npfl-week", key: "rangers", stake: 12000, offsetMinutes: hours(7), priceBps: 2300 },
  { user: "emeka", market: "nollywood-original", key: "no", stake: 8000, offsetMinutes: hours(8), priceBps: 4400 },
  { user: "emeka", market: "foldable", key: "yes", stake: 9000, offsetMinutes: hours(5), priceBps: 3400 },
  { user: "emeka", market: "ai-weights", key: "no", stake: 7000, offsetMinutes: hours(4), priceBps: 5000 },

  { user: "tunde", market: "r-eagles-friendly", key: "yes", stake: 18000, offsetMinutes: days(32), priceBps: 5200 },
  { user: "tunde", market: "r-npfl-last", key: "enyimba", stake: 16000, offsetMinutes: days(24), priceBps: 3300 },
  { user: "tunde", market: "r-arsenal-last", key: "no", stake: 14000, offsetMinutes: days(18), priceBps: 3800 },
  { user: "tunde", market: "r-cup-tie", key: "yes", stake: 15000, offsetMinutes: days(14), priceBps: 4900 },
  { user: "tunde", market: "r-earnings-demo", key: "yes", stake: 8000, offsetMinutes: days(9), priceBps: 4400 },
  { user: "tunde", market: "r-fx-last", key: "yes", stake: 7000, offsetMinutes: days(5), priceBps: 4700 },
  { user: "tunde", market: "r-show-final", key: "jide", stake: 4000, offsetMinutes: days(7), priceBps: 2800 },
  { user: "tunde", market: "r-rate-last", key: "yes", stake: 9000, offsetMinutes: days(12), priceBps: 6800 },
  { user: "tunde", market: "r-marathon-last", key: "no", stake: 5000, offsetMinutes: days(16), priceBps: 4200 },
  { user: "tunde", market: "r-bill-last", key: "yes", stake: 4000, offsetMinutes: days(8), priceBps: 4000 },
  { user: "tunde", market: "r-ai-summit", key: "no", stake: 3000, offsetMinutes: days(26), priceBps: 4800 },
  { user: "tunde", market: "r-outage", key: "yes", stake: 3000, offsetMinutes: days(5), priceBps: 3000 },
  {
    user: "tunde",
    market: "eagles-next",
    key: "yes",
    stake: 40000,
    offsetMinutes: hours(5),
    priceBps: 5400,
    thesis: "Draw is the hole. The rule says a draw settles No. I still think the win is the right side, but I am not adding size at 58.",
  },
  { user: "tunde", market: "npfl-week", key: "enyimba", stake: 25000, offsetMinutes: hours(4), priceBps: 2500 },
  { user: "tunde", market: "arsenal-slate", key: "yes", stake: 30000, offsetMinutes: hours(6), priceBps: 5900 },

  { user: "ngozi", market: "r-eagles-friendly", key: "no", stake: 6000, offsetMinutes: days(28), priceBps: 4500 },
  { user: "ngozi", market: "r-npfl-last", key: "enyimba", stake: 8000, offsetMinutes: days(22), priceBps: 3200 },
  { user: "ngozi", market: "r-cup-tie", key: "no", stake: 5000, offsetMinutes: days(14), priceBps: 4800 },
  { user: "ngozi", market: "r-nollywood-last", key: "yes", stake: 7000, offsetMinutes: days(16), priceBps: 5000 },
  { user: "ngozi", market: "r-show-final", key: "tari", stake: 6000, offsetMinutes: days(6), priceBps: 3300 },
  { user: "ngozi", market: "r-marathon-last", key: "yes", stake: 5000, offsetMinutes: days(18), priceBps: 5700 },
  { user: "ngozi", market: "r-bill-last", key: "no", stake: 7000, offsetMinutes: days(7), priceBps: 5200 },
  { user: "ngozi", market: "r-rate-last", key: "yes", stake: 4000, offsetMinutes: days(11), priceBps: 6600 },
  { user: "ngozi", market: "r-fx-last", key: "no", stake: 5000, offsetMinutes: days(4), priceBps: 4900 },
  { user: "ngozi", market: "r-model-card", key: "no", stake: 3000, offsetMinutes: days(8), priceBps: 5000 },
  { user: "ngozi", market: "npfl-week", key: "enyimba", stake: 8000, offsetMinutes: hours(5), priceBps: 2600 },
  { user: "ngozi", market: "abuja-marathon", key: "yes", stake: 6000, offsetMinutes: hours(7), priceBps: 6000 },
  { user: "ngozi", market: "lagos-after-dark", key: "kemi", stake: 5000, offsetMinutes: hours(8), priceBps: 3100 },
  { user: "ngozi", market: "power-bill", key: "no", stake: 7000, offsetMinutes: hours(4), priceBps: 5700 },

  { user: "samuel", market: "r-marathon-last", key: "yes", stake: 18000, offsetMinutes: days(19), priceBps: 5800 },
  { user: "samuel", market: "r-bill-last", key: "no", stake: 16000, offsetMinutes: days(8), priceBps: 5400 },
  { user: "samuel", market: "r-fx-last", key: "no", stake: 14000, offsetMinutes: days(4), priceBps: 5000 },
  { user: "samuel", market: "r-rate-last", key: "yes", stake: 12000, offsetMinutes: days(12), priceBps: 6800 },
  { user: "samuel", market: "r-earnings-demo", key: "no", stake: 15000, offsetMinutes: days(9), priceBps: 5200 },
  { user: "samuel", market: "r-eagles-friendly", key: "no", stake: 8000, offsetMinutes: days(27), priceBps: 4600 },
  { user: "samuel", market: "r-arsenal-last", key: "no", stake: 10000, offsetMinutes: days(16), priceBps: 3800 },
  { user: "samuel", market: "r-ai-summit", key: "no", stake: 7000, offsetMinutes: days(24), priceBps: 4800 },
  { user: "samuel", market: "r-outage", key: "no", stake: 9000, offsetMinutes: days(5), priceBps: 6400 },
  { user: "samuel", market: "r-show-final", key: "amara", stake: 4000, offsetMinutes: days(6), priceBps: 1400 },
  { user: "samuel", market: "abuja-marathon", key: "yes", stake: 20000, offsetMinutes: hours(5), priceBps: 6000 },
  { user: "samuel", market: "power-bill", key: "yes", stake: 16000, offsetMinutes: hours(6), priceBps: 3900 },
  { user: "samuel", market: "cbn-hold", key: "yes", stake: 15000, offsetMinutes: hours(3), priceBps: 6500 },
  { user: "samuel", market: "naira-week", key: "no", stake: 12000, offsetMinutes: hours(5), priceBps: 5000 },
  { user: "samuel", market: "btc-print", key: "no", stake: 10000, offsetMinutes: hours(8), priceBps: 5400 },
  { user: "samuel", market: "arsenal-slate", key: "no", stake: 15000, offsetMinutes: hours(8), priceBps: 4000 },

  { user: "daniel", market: "r-eagles-friendly", key: "yes", stake: 80000, offsetMinutes: days(28), priceBps: 6400 },
  { user: "daniel", market: "r-npfl-last", key: "enyimba", stake: 70000, offsetMinutes: days(22), priceBps: 6200 },
  { user: "daniel", market: "r-arsenal-last", key: "no", stake: 90000, offsetMinutes: days(16), priceBps: 6100 },
  { user: "daniel", market: "r-cup-tie", key: "yes", stake: 60000, offsetMinutes: days(14), priceBps: 6300 },
  { user: "daniel", market: "r-ai-summit", key: "yes", stake: 50000, offsetMinutes: days(24), priceBps: 6000 },
  { user: "daniel", market: "r-chip-delay", key: "no", stake: 55000, offsetMinutes: days(11), priceBps: 6200 },
  { user: "daniel", market: "r-model-card", key: "yes", stake: 40000, offsetMinutes: days(8), priceBps: 5800 },
  { user: "daniel", market: "r-outage", key: "no", stake: 45000, offsetMinutes: days(5), priceBps: 6500 },
  { user: "daniel", market: "r-nollywood-last", key: "no", stake: 30000, offsetMinutes: days(15), priceBps: 4700 },
  { user: "daniel", market: "r-show-final", key: "kemi", stake: 35000, offsetMinutes: days(6), priceBps: 2400 },
  { user: "daniel", market: "r-rate-last", key: "no", stake: 80000, offsetMinutes: days(12), priceBps: 3000 },
  { user: "daniel", market: "r-earnings-demo", key: "yes", stake: 75000, offsetMinutes: days(9), priceBps: 4500 },
  { user: "daniel", market: "r-fx-last", key: "yes", stake: 65000, offsetMinutes: days(4), priceBps: 4800 },
  { user: "daniel", market: "r-marathon-last", key: "no", stake: 40000, offsetMinutes: days(17), priceBps: 4000 },
  { user: "daniel", market: "r-bill-last", key: "yes", stake: 50000, offsetMinutes: days(7), priceBps: 4200 },
  { user: "daniel", market: "eagles-next", key: "yes", stake: 80000, offsetMinutes: hours(2), priceBps: 5700 },
  { user: "daniel", market: "arsenal-slate", key: "yes", stake: 100000, offsetMinutes: hours(3), priceBps: 6000 },
  { user: "daniel", market: "cbn-hold", key: "no", stake: 60000, offsetMinutes: hours(4), priceBps: 3600 },
  { user: "daniel", market: "lagos-after-dark", key: "jide", stake: 40000, offsetMinutes: hours(3), priceBps: 2700 },
  { user: "daniel", market: "naira-week", key: "yes", stake: 90000, offsetMinutes: hours(4), priceBps: 4600 },
  { user: "daniel", market: "btc-print", key: "yes", stake: 120000, offsetMinutes: hours(4), priceBps: 4200 },
  { user: "daniel", market: "power-bill", key: "yes", stake: 50000, offsetMinutes: hours(3), priceBps: 3900 },
  { user: "daniel", market: "foldable", key: "yes", stake: 70000, offsetMinutes: hours(4), priceBps: 3400 },
  { user: "daniel", market: "ai-weights", key: "yes", stake: 80000, offsetMinutes: hours(5), priceBps: 4500 },

  { user: "funke", market: "r-eagles-friendly", key: "yes", stake: 6000, offsetMinutes: days(27), priceBps: 5300 },
  { user: "funke", market: "r-npfl-last", key: "rangers", stake: 5000, offsetMinutes: days(21), priceBps: 2400 },
  { user: "funke", market: "r-arsenal-last", key: "yes", stake: 7000, offsetMinutes: days(15), priceBps: 6000 },
  { user: "funke", market: "r-nollywood-last", key: "yes", stake: 8000, offsetMinutes: days(16), priceBps: 5000 },
  { user: "funke", market: "r-show-final", key: "tari", stake: 7000, offsetMinutes: days(6), priceBps: 3300 },
  { user: "funke", market: "r-cup-tie", key: "yes", stake: 4000, offsetMinutes: days(13), priceBps: 5000 },
  { user: "funke", market: "r-chip-delay", key: "yes", stake: 3000, offsetMinutes: days(10), priceBps: 4000 },
  { user: "funke", market: "r-marathon-last", key: "no", stake: 3000, offsetMinutes: days(17), priceBps: 4000 },
  { user: "funke", market: "r-rate-last", key: "yes", stake: 5000, offsetMinutes: days(11), priceBps: 6700 },
  { user: "funke", market: "r-fx-last", key: "yes", stake: 4000, offsetMinutes: days(4), priceBps: 4700 },
  { user: "funke", market: "r-outage", key: "no", stake: 2500, offsetMinutes: days(5), priceBps: 6400 },
  { user: "funke", market: "eagles-next", key: "no", stake: 5000, offsetMinutes: hours(6), priceBps: 4000 },
  { user: "funke", market: "lagos-after-dark", key: "jide", stake: 7000, offsetMinutes: hours(6), priceBps: 2600 },
  { user: "funke", market: "nollywood-original", key: "yes", stake: 6000, offsetMinutes: hours(3), priceBps: 5200 },
  { user: "funke", market: "abuja-marathon", key: "yes", stake: 4000, offsetMinutes: hours(2), priceBps: 6100 },
];

const FOLLOWS: Array<[string, string, number]> = [
  ["you", "tunde", days(10)],
  ["you", "chioma", days(8)],
  ["tunde", "emeka", days(40)],
  ["tunde", "zainab", days(20)],
  ["tunde", "ibrahim", days(60)],
  ["tunde", "ngozi", days(15)],
  ["tunde", "lara", days(12)],
  ["chioma", "funke", days(30)],
  ["chioma", "zainab", days(18)],
  ["chioma", "ngozi", days(22)],
  ["chioma", "tunde", days(50)],
  ["chioma", "lara", days(9)],
  ["ibrahim", "lara", days(40)],
  ["ibrahim", "samuel", days(25)],
  ["ibrahim", "emeka", days(33)],
  ["ibrahim", "chioma", days(14)],
  ["ibrahim", "tunde", days(70)],
  ["lara", "ibrahim", days(36)],
  ["lara", "samuel", days(20)],
  ["lara", "emeka", days(11)],
  ["lara", "chioma", days(8)],
  ["emeka", "tunde", days(44)],
  ["emeka", "ibrahim", days(28)],
  ["emeka", "zainab", days(10)],
  ["emeka", "ngozi", days(16)],
  ["emeka", "lara", days(7)],
  ["ngozi", "chioma", days(24)],
  ["ngozi", "zainab", days(13)],
  ["ngozi", "funke", days(19)],
  ["ngozi", "tunde", days(31)],
  ["ngozi", "emeka", days(9)],
  ["zainab", "chioma", days(12)],
  ["zainab", "tunde", days(11)],
  ["zainab", "emeka", days(6)],
  ["samuel", "ibrahim", days(21)],
  ["samuel", "lara", days(17)],
  ["samuel", "ngozi", days(8)],
  ["daniel", "ibrahim", days(15)],
  ["daniel", "lara", days(14)],
  ["daniel", "tunde", days(13)],
  ["daniel", "chioma", days(5)],
  ["funke", "chioma", days(20)],
  ["funke", "tunde", days(18)],
  ["funke", "zainab", days(4)],
];

const COMMENTS: Array<{ market: string; user: string; body: string; offsetMinutes: number }> = [
  {
    market: "eagles-next",
    user: "funke",
    body: "Draw is the hole in this question. The rule says a draw settles No. That is the whole call, not the team sheet.",
    offsetMinutes: hours(4),
  },
  {
    market: "eagles-next",
    user: "samuel",
    body: "I am reading it as a 90-minute question. Anyone quoting a tournament memory is answering a different slate.",
    offsetMinutes: hours(3),
  },
  {
    market: "cbn-hold",
    user: "lara",
    body: "66% is a price for a base case, not new information. I want the summary note to change before I pay more.",
    offsetMinutes: hours(5),
  },
  {
    market: "cbn-hold",
    user: "tunde",
    body: "This is not my desk, but the rule is clean. Unchanged means unchanged. A hawkish paragraph is still Yes.",
    offsetMinutes: hours(2),
  },
  {
    market: "lagos-after-dark",
    user: "zainab",
    body: "Amara's minutes went up in the demonstration cut. That is not the same thing as winning. I still have a small call there.",
    offsetMinutes: hours(2),
  },
  {
    market: "lagos-after-dark",
    user: "ngozi",
    body: "The field at 16% is the honest residual. People keep forcing a two-person story onto a four-person caption.",
    offsetMinutes: hours(6),
  },
  {
    market: "npfl-week",
    user: "zainab",
    body: "Remo at 31 feels like last week's table, not this fixture list. I may be early, and I may be wrong.",
    offsetMinutes: hours(2),
  },
  {
    market: "abuja-marathon",
    user: "samuel",
    body: "On the demonstration sheet, bib sell-outs happen in the last week, not at the first announcement. The cap is the fact.",
    offsetMinutes: hours(4),
  },
  {
    market: "ai-weights",
    user: "emeka",
    body: "I am on No until a model card exists. A keynote sentence is not weights.",
    offsetMinutes: hours(3),
  },
  {
    market: "foldable",
    user: "ibrahim",
    body: "Dated deadlines slip. I do not have a handset view. I am leaving it to Lara's desk.",
    offsetMinutes: hours(8),
  },
  {
    market: "btc-print",
    user: "daniel",
    body: "I am on Yes because the demonstration threshold is a round number near the last print. I know this is not a live price.",
    offsetMinutes: hours(3),
  },
  {
    market: "power-bill",
    user: "ibrahim",
    body: "Recess time is the resolution, not the volume of quotes. The journal either shows a final vote or it does not.",
    offsetMinutes: hours(6),
  },
  {
    market: "nollywood-original",
    user: "chioma",
    body: "Originals have led the demonstration sheet when the sequel is a third film. Title card, not group chat.",
    offsetMinutes: hours(4),
  },
  {
    market: "naira-week",
    user: "samuel",
    body: "Two prints, one definition of stronger. If someone quotes a parallel market, they are not answering this question.",
    offsetMinutes: hours(5),
  },
  {
    market: "arsenal-slate",
    user: "emeka",
    body: "I want the team news before I pretend this is insight. One call only, so waiting is allowed.",
    offsetMinutes: hours(7),
  },
  {
    market: "r-show-final",
    user: "chioma",
    body: "Tari was in the caption. The group chat had Jide. The rule was the caption. That is the lesson, not the brag.",
    offsetMinutes: days(2),
  },
  {
    market: "r-rate-last",
    user: "ibrahim",
    body: "A hold at 70 paid very little. Accuracy without a price is not a record. The board should keep both.",
    offsetMinutes: days(5),
  },
];

const ROOMS = [
  {
    id: "pitch-and-call",
    title: "Pitch & Call",
    category: "sports",
    kind: "sponsored",
    summary: "Five open football questions. A fictional sponsor funds the prize. Your demo stake, if you make one, is a separate speculative call.",
    rules: "Record a call on each of the five open sports questions before they close. One seat per person. Calls cannot be resized after they are recorded. Ties break to the earlier seat.",
    eligibility: "Open demonstration seat. No purchase. A live circuit would confirm you are 18 or over. This demo does not.",
    scoring: "Each question scores 100 minus the absolute error between your price and the outcome (100 if it happens, 0 if it does not). The room score is the average. Closer probabilities beat a lucky 50/50.",
    rewardSource: "Fictional sponsor Greenfield Flour. The illustrated prize is not taken from other participants' losses or from call stakes.",
    rewardType: "contest_prize",
    prizeSummary: "₦2,000,000 illustrated pool for the top 10. First seat ₦700,000 illustrated. Nobody is paid in this prototype.",
    sponsorName: "Greenfield Flour",
    requiresItemId: null,
    spots: 200,
    featured: true,
    startOffsetHours: -12,
    endOffsetHours: 70,
  },
  {
    id: "matchweek-desk",
    title: "Matchweek Desk",
    category: "sports",
    kind: "forecasting",
    summary: "A free football desk. The reward is season points and a public line, not a purse.",
    rules: "Call the open sports slate before close. Attach a thesis on at least two questions if you want the reader's mark to notice the seat. One seat.",
    eligibility: "Open. No pass required.",
    scoring: "Same probability score as Pitch & Call. Points on the season board are awarded from finishing place, not from stake size.",
    rewardSource: "Sabi season points. No sponsor, no entry fee, no cash.",
    rewardType: "recognition",
    prizeSummary: "Season points and a line on the room sheet. Recognition only.",
    sponsorName: null,
    requiresItemId: null,
    spots: null,
    featured: false,
    startOffsetHours: -48,
    endOffsetHours: 22,
  },
  {
    id: "founders-read",
    title: "Founders' Read",
    category: "technology",
    kind: "skill",
    summary: "A written read plus a probability. Judged on whether the source matches the claim, not on swagger.",
    rules: "Submit one technology call with a thesis that names the resolution source. Seats close when the slate starts. Late theses are comments, not entries.",
    eligibility: "Open before the slate starts. No pass. A live version would ask for a name you are willing to publish.",
    scoring: "Half the room score is probability accuracy. Half is whether a reader can find the source you named. Demonstration scores already on the sheet are scripted.",
    rewardSource: "Fictional sponsor Atlas Cable, plus a pass to the next founders' room for the top five.",
    rewardType: "contest_prize",
    prizeSummary: "₦500,000 illustrated contest prize to the winner, and a founders' room pass for the top five. Not guaranteed. Not cash in this demo.",
    sponsorName: "Atlas Cable",
    requiresItemId: null,
    spots: 80,
    featured: false,
    startOffsetHours: 8,
    endOffsetHours: 120,
  },
  {
    id: "campus-circuit",
    title: "Campus Circuit",
    category: "mixed",
    kind: "community",
    summary: "A university room. The guaranteed thing is a lantern on your profile, not a stipend.",
    rules: "Take a seat and record at least three calls before the room ends. Leaving before the end forfeits the lantern in a live season. This demo removes the seat if you leave.",
    eligibility: "Meant for university students. This demo does not verify enrolment or age, so the seat is open to test the flow.",
    scoring: "Season points from participation plus accuracy. The lantern is guaranteed for anyone still seated at the end. It is not cash.",
    rewardSource: "Sabi. The lantern is issued by the circuit, not bought from a sponsor.",
    rewardType: "guaranteed",
    prizeSummary: "Campus lantern for every finisher. No cash. No entry fee.",
    sponsorName: null,
    requiresItemId: null,
    spots: null,
    featured: false,
    startOffsetHours: -100,
    endOffsetHours: 200,
  },
  {
    id: "high-table",
    title: "High Table",
    category: "mixed",
    kind: "forecasting",
    summary: "A slower room for people who want a larger seat. The seat is access. It is not a richer rank.",
    rules: "Requires a Season seat. Record calls with a thesis on at least three open questions in business, technology, or world. Stake size is ignored in the room score.",
    eligibility: "Season seat required. The illustrated price of that pass is not charged here. Claim a demonstration seat on Passes if you want to preview the room.",
    scoring: "Probability score plus a source check. Demo purse is not an input. A wealthy miss ranks below a careful student.",
    rewardSource: "Fictional sponsor Harbor & Co. Contest prize, separate from any speculative call you attach.",
    rewardType: "contest_prize",
    prizeSummary: "₦5,000,000 illustrated contest prize to the top 5, plus a crest. Not funded by losses. Not paid in this prototype.",
    sponsorName: "Harbor & Co.",
    requiresItemId: "season-seat",
    spots: 40,
    featured: false,
    startOffsetHours: -5,
    endOffsetHours: 90,
  },
  {
    id: "seven-day-form",
    title: "Seven-day Form",
    category: "mixed",
    kind: "tournament",
    summary: "A short room. Recent calls only. Useful if your season record is noisy and your week is clean.",
    rules: "Calls recorded inside the seven days count. Older calls do not. One seat. You are already seated in the script so the desk is not empty.",
    eligibility: "Open. No pass.",
    scoring: "Accuracy of calls timestamped inside the room, weighted equally. Stake size ignored.",
    rewardSource: "Sabi season points only.",
    rewardType: "recognition",
    prizeSummary: "A form ribbon for the top 5 and season points. Recognition only. No cash.",
    sponsorName: null,
    requiresItemId: null,
    spots: null,
    featured: false,
    startOffsetHours: -80,
    endOffsetHours: 36,
  },
  {
    id: "entertainment-slate",
    title: "Entertainment Slate",
    category: "entertainment",
    kind: "sponsored",
    summary: "The fictional shows and the box-office sheet. A small sponsor prize, clearly not a wage.",
    rules: "Call the open entertainment questions. A thesis is optional but ranked readers tend to leave one.",
    eligibility: "Open demonstration seat.",
    scoring: "Probability score on the entertainment slate only.",
    rewardSource: "Fictional sponsor Palm & Reel. Contest prize, not an appearance fee and not a stake rake.",
    rewardType: "contest_prize",
    prizeSummary: "₦250,000 illustrated prize to the top 3. Not guaranteed. Not paid here.",
    sponsorName: "Palm & Reel",
    requiresItemId: null,
    spots: 150,
    featured: false,
    startOffsetHours: -20,
    endOffsetHours: 50,
  },
  {
    id: "january-friendly",
    title: "January Friendly",
    category: "sports",
    kind: "tournament",
    summary: "A closed room, left on the record so finished contests are visible.",
    rules: "Closed. Seats can no longer be taken or left. The sheet is the result.",
    eligibility: "Closed.",
    scoring: "Probability score on that week's sports slate. Scripted.",
    rewardSource: "Season points only. No sponsor.",
    rewardType: "recognition",
    prizeSummary: "Finished. Points already sit on the season board. No cash was offered.",
    sponsorName: null,
    requiresItemId: null,
    spots: null,
    featured: false,
    startOffsetHours: -400,
    endOffsetHours: -48,
  },
] as const;

const ENTRIES: Array<{ room: string; user: string; score: number; points: number; offsetMinutes: number }> = [
  { room: "pitch-and-call", user: "emeka", score: 74, points: 14, offsetMinutes: hours(10) },
  { room: "pitch-and-call", user: "tunde", score: 76, points: 12, offsetMinutes: hours(9) },
  { room: "pitch-and-call", user: "chioma", score: 61, points: 8, offsetMinutes: hours(8) },
  { room: "pitch-and-call", user: "lara", score: 58, points: 4, offsetMinutes: hours(7) },
  { room: "pitch-and-call", user: "daniel", score: 44, points: 2, offsetMinutes: hours(3) },
  { room: "matchweek-desk", user: "tunde", score: 84, points: 18, offsetMinutes: days(1) },
  { room: "matchweek-desk", user: "emeka", score: 81, points: 16, offsetMinutes: days(1.2) },
  { room: "matchweek-desk", user: "zainab", score: 80, points: 8, offsetMinutes: hours(20) },
  { room: "matchweek-desk", user: "ngozi", score: 66, points: 8, offsetMinutes: days(1.4) },
  { room: "matchweek-desk", user: "ibrahim", score: 62, points: 6, offsetMinutes: days(1.5) },
  { room: "matchweek-desk", user: "funke", score: 59, points: 4, offsetMinutes: hours(18) },
  { room: "matchweek-desk", user: "daniel", score: 48, points: 2, offsetMinutes: hours(6) },
  { room: "founders-read", user: "lara", score: 85, points: 16, offsetMinutes: hours(6) },
  { room: "founders-read", user: "ibrahim", score: 82, points: 14, offsetMinutes: hours(5) },
  { room: "founders-read", user: "emeka", score: 60, points: 8, offsetMinutes: hours(4) },
  { room: "campus-circuit", user: "zainab", score: 74, points: 12, offsetMinutes: days(8) },
  { room: "campus-circuit", user: "ngozi", score: 70, points: 16, offsetMinutes: days(9) },
  { room: "campus-circuit", user: "funke", score: 63, points: 6, offsetMinutes: days(7) },
  { room: "high-table", user: "ibrahim", score: 77, points: 10, offsetMinutes: hours(5) },
  { room: "high-table", user: "lara", score: 73, points: 8, offsetMinutes: hours(4) },
  { room: "high-table", user: "daniel", score: 51, points: 4, offsetMinutes: hours(2) },
  { room: "seven-day-form", user: "zainab", score: 88, points: 14, offsetMinutes: days(2) },
  { room: "seven-day-form", user: "chioma", score: 79, points: 12, offsetMinutes: days(2.2) },
  { room: "seven-day-form", user: "emeka", score: 77, points: 12, offsetMinutes: days(2.4) },
  { room: "seven-day-form", user: "you", score: 54, points: 12, offsetMinutes: days(2.6) },
  { room: "seven-day-form", user: "tunde", score: 68, points: 6, offsetMinutes: days(3) },
  { room: "seven-day-form", user: "funke", score: 57, points: 4, offsetMinutes: days(1.5) },
  { room: "seven-day-form", user: "samuel", score: 64, points: 8, offsetMinutes: days(1.8) },
  { room: "entertainment-slate", user: "chioma", score: 86, points: 18, offsetMinutes: hours(12) },
  { room: "entertainment-slate", user: "funke", score: 71, points: 8, offsetMinutes: hours(10) },
  { room: "entertainment-slate", user: "ngozi", score: 58, points: 12, offsetMinutes: hours(9) },
  { room: "entertainment-slate", user: "zainab", score: 69, points: 6, offsetMinutes: hours(6) },
  { room: "january-friendly", user: "emeka", score: 88, points: 36, offsetMinutes: days(50) },
  { room: "january-friendly", user: "ngozi", score: 72, points: 20, offsetMinutes: days(50) },
  { room: "january-friendly", user: "tunde", score: 70, points: 10, offsetMinutes: days(49) },
  { room: "january-friendly", user: "chioma", score: 64, points: 8, offsetMinutes: days(49) },
  { room: "january-friendly", user: "samuel", score: 60, points: 8, offsetMinutes: days(48) },
];

const NOT_ASSET =
  "Not a token. No resale market in this prototype. No claim of appreciation, yield, or income.";

const ITEM_SEEDS = [
  {
    id: "season-seat",
    kind: "access",
    name: "Season seat",
    utility: "Unlocks High Table, the weekly circuit briefing, and a crest on your profile. It does not pay you and it does not move your rank.",
    howEarned: "Illustrated access, ₦15,000 if this were a live season. In this demo, claim a preview seat. It is not a purchase.",
    season: "Circuit 01",
    illustratedPriceNgn: 15000,
    boundary: NOT_ASSET,
    sortOrder: 1,
  },
  {
    id: "pitch-pass",
    kind: "access",
    name: "Pitch pass",
    utility: "A marked seat in the sponsored football room once public seats fill, and a highlight on football theses you write.",
    howEarned: "Top 20% of Matchweek Desk, or bundled with a Season seat in this demo so the room can be previewed.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 2,
  },
  {
    id: "readers-mark",
    kind: "achievement",
    name: "Reader's mark",
    utility: "Shows a thesis highlight on your profile. Sponsors of rooms can filter for people who explain their calls. It pays nothing.",
    howEarned: "Attach a short thesis to five calls.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 3,
  },
  {
    id: "campus-lantern",
    kind: "privilege",
    name: "Campus lantern",
    utility: "Puts you on the campus filter of the board and keeps Campus Circuit reminders in your notices.",
    howEarned: "Take a seat in Campus Circuit.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 4,
  },
  {
    id: "city-desk",
    kind: "privilege",
    name: "City desk key",
    utility: "Opens the business-round discussion on rate and bank calls. A room for a business record, not a coin.",
    howEarned: "Eight settled business calls at 60% accuracy or better on the demonstration record.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 5,
  },
  {
    id: "compare-lens",
    kind: "privilege",
    name: "Compare lens",
    utility: "Keeps a category-by-category compare on profiles you follow. The reason to follow someone is a better read, not a post.",
    howEarned: "Follow five records. In this demo the compare view is visible anyway, so you can test it before you earn the mark.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 6,
  },
  {
    id: "form-ribbon",
    kind: "achievement",
    name: "Form ribbon",
    utility: "A public mark for a top-five finish in a seven-day room. Recognition only.",
    howEarned: "Finish top five in Seven-day Form. Scripted for a few demonstration profiles.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 7,
  },
  {
    id: "first-call",
    kind: "achievement",
    name: "First call",
    utility: "Marks a public record as started. Shown on your profile. No payout.",
    howEarned: "Record one demo call.",
    season: "Circuit 01",
    illustratedPriceNgn: null,
    boundary: NOT_ASSET,
    sortOrder: 8,
  },
];

const HOLDING_SEEDS: Array<{ user: string; item: string; source: string; offsetMinutes: number }> = [
  { user: "you", item: "first-call", source: "Earned on the demonstration seat", offsetMinutes: days(12) },
  { user: "ibrahim", item: "first-call", source: "Scripted record", offsetMinutes: days(200) },
  { user: "ibrahim", item: "readers-mark", source: "Scripted record", offsetMinutes: days(80) },
  { user: "ibrahim", item: "season-seat", source: "Scripted access", offsetMinutes: days(60) },
  { user: "ibrahim", item: "pitch-pass", source: "Bundled with scripted season seat", offsetMinutes: days(60) },
  { user: "ibrahim", item: "city-desk", source: "Scripted business record", offsetMinutes: days(20) },
  { user: "ibrahim", item: "compare-lens", source: "Scripted follows", offsetMinutes: days(14) },
  { user: "chioma", item: "first-call", source: "Scripted record", offsetMinutes: days(150) },
  { user: "chioma", item: "readers-mark", source: "Scripted record", offsetMinutes: days(40) },
  { user: "chioma", item: "pitch-pass", source: "Scripted Matchweek finish", offsetMinutes: days(12) },
  { user: "chioma", item: "compare-lens", source: "Scripted follows", offsetMinutes: days(9) },
  { user: "zainab", item: "first-call", source: "Scripted record", offsetMinutes: days(60) },
  { user: "zainab", item: "campus-lantern", source: "Scripted campus seat", offsetMinutes: days(8) },
  { user: "zainab", item: "form-ribbon", source: "Scripted top-five finish", offsetMinutes: days(2) },
  { user: "lara", item: "first-call", source: "Scripted record", offsetMinutes: days(120) },
  { user: "lara", item: "readers-mark", source: "Scripted record", offsetMinutes: days(30) },
  { user: "lara", item: "season-seat", source: "Scripted access", offsetMinutes: days(40) },
  { user: "lara", item: "pitch-pass", source: "Bundled with scripted season seat", offsetMinutes: days(40) },
  { user: "lara", item: "city-desk", source: "Scripted business record", offsetMinutes: days(9) },
  { user: "emeka", item: "first-call", source: "Scripted record", offsetMinutes: days(180) },
  { user: "emeka", item: "pitch-pass", source: "Scripted Matchweek finish", offsetMinutes: days(20) },
  { user: "emeka", item: "form-ribbon", source: "Scripted top-five finish", offsetMinutes: days(40) },
  { user: "emeka", item: "compare-lens", source: "Scripted follows", offsetMinutes: days(7) },
  { user: "tunde", item: "first-call", source: "Scripted record", offsetMinutes: days(200) },
  { user: "tunde", item: "pitch-pass", source: "Scripted Matchweek finish", offsetMinutes: days(15) },
  { user: "ngozi", item: "first-call", source: "Scripted record", offsetMinutes: days(140) },
  { user: "ngozi", item: "campus-lantern", source: "Scripted campus seat", offsetMinutes: days(9) },
  { user: "ngozi", item: "compare-lens", source: "Scripted follows", offsetMinutes: days(9) },
  { user: "samuel", item: "first-call", source: "Scripted record", offsetMinutes: days(90) },
  { user: "samuel", item: "city-desk", source: "Scripted business record", offsetMinutes: days(8) },
  { user: "daniel", item: "first-call", source: "Scripted record", offsetMinutes: days(90) },
  { user: "daniel", item: "season-seat", source: "Scripted access", offsetMinutes: days(30) },
  { user: "funke", item: "first-call", source: "Scripted record", offsetMinutes: days(70) },
  { user: "funke", item: "campus-lantern", source: "Scripted campus seat", offsetMinutes: days(7) },
];

function assertSeed() {
  const marketIds = new Set<string>(MARKETS.map((m) => m.id));
  const peopleIds = new Set<string>(PEOPLE.map((p) => p.id));
  const resolved = new Map<string, string>();
  for (const market of MARKETS) {
    const sum = market.outcomes.reduce((s, o) => s + o.priceBps, 0);
    if (sum !== 10000) throw new Error(`Prices for ${market.id} sum to ${sum}`);
    if (market.resolvedKey && !market.outcomes.some((o) => o.key === market.resolvedKey)) {
      throw new Error(`Missing resolved key on ${market.id}`);
    }
    if (market.resolvedKey) resolved.set(market.id, market.resolvedKey);
  }
  const seen = new Set<string>();
  const spent = new Map<string, number>();
  for (const call of CALLS) {
    if (!peopleIds.has(call.user)) throw new Error(`Unknown caller ${call.user}`);
    const market = MARKETS.find((m) => m.id === call.market);
    if (!market) throw new Error(`Unknown market ${call.market}`);
    if (!market.outcomes.some((o) => o.key === call.key)) throw new Error(`Bad key ${call.market}:${call.key}`);
    const pair = `${call.user}:${call.market}`;
    if (seen.has(pair)) throw new Error(`Duplicate call ${pair}`);
    seen.add(pair);
    let purseDelta = -call.stake;
    if (resolved.has(call.market) && resolved.get(call.market) === call.key) {
      purseDelta += Math.floor((call.stake * 10000) / call.priceBps);
    }
    spent.set(call.user, (spent.get(call.user) ?? 0) + purseDelta);
  }
  for (const person of PEOPLE) {
    const purse = person.openingPurseNgn + (spent.get(person.id) ?? 0);
    if (purse < 0) throw new Error(`Negative purse for ${person.id}: ${purse}`);
  }
  if (!marketIds.has("eagles-next")) throw new Error("missing hero");
}

export async function clearAll(tx: Tx) {
  await tx.delete(notifications);
  await tx.delete(activity);
  await tx.delete(comments);
  await tx.delete(positions);
  await tx.delete(holdings);
  await tx.delete(competitionEntries);
  await tx.delete(follows);
  await tx.delete(outcomes);
  await tx.delete(markets);
  await tx.delete(competitions);
  await tx.delete(items);
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
      onboarded: false,
      interests: "",
      openingPurseNgn: p.openingPurseNgn,
      joinedOffsetMinutes: p.joinedOffsetMinutes,
      joinedAt: now,
    })),
  );
  await tx.insert(items).values(ITEM_SEEDS);
  await tx.insert(markets).values(
    MARKETS.map((m) => ({
      id: m.id,
      question: m.question,
      category: m.category,
      summary: m.summary,
      resolutionSource: m.resolutionSource,
      resolutionRule: m.resolutionRule,
      demoNote: m.demoNote,
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
  await tx.insert(competitions).values(
    ROOMS.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      kind: r.kind,
      summary: r.summary,
      rules: r.rules,
      eligibility: r.eligibility,
      scoring: r.scoring,
      rewardSource: r.rewardSource,
      rewardType: r.rewardType,
      prizeSummary: r.prizeSummary,
      sponsorName: r.sponsorName,
      requiresItemId: r.requiresItemId,
      spots: r.spots,
      featured: r.featured,
      startOffsetHours: r.startOffsetHours,
      endOffsetHours: r.endOffsetHours,
      startsAt: now,
      endsAt: now,
    })),
  );

  const marketById = new Map(MARKETS.map((m) => [m.id, m]));
  await tx.insert(positions).values(
    CALLS.map((c) => {
      const market = marketById.get(c.market)!;
      const settled = Boolean(market.resolvedKey);
      const correct = settled ? market.resolvedKey === c.key : null;
      const payout = correct ? Math.floor((c.stake * 10000) / c.priceBps) : settled ? 0 : null;
      return {
        userId: c.user,
        marketId: c.market,
        outcomeId: `${c.market}__${c.key}`,
        stakeNgn: c.stake,
        priceBps: c.priceBps,
        payoutNgn: payout,
        settled,
        correct,
        thesis: c.thesis ?? null,
        createdAt: now,
        offsetMinutes: c.offsetMinutes,
      };
    }),
  );
  await tx.insert(comments).values(
    COMMENTS.map((c) => ({
      marketId: c.market,
      userId: c.user,
      body: c.body,
      createdAt: now,
      offsetMinutes: c.offsetMinutes,
    })),
  );
  await tx.insert(follows).values(
    FOLLOWS.map(([followerId, followingId, offsetMinutes]) => ({
      followerId,
      followingId,
      createdAt: now,
      offsetMinutes,
    })),
  );
  await tx.insert(competitionEntries).values(
    ENTRIES.map((e) => ({
      competitionId: e.room,
      userId: e.user,
      score: e.score,
      points: e.points,
      createdAt: now,
      offsetMinutes: e.offsetMinutes,
    })),
  );
  await tx.insert(holdings).values(
    HOLDING_SEEDS.map((h) => ({
      userId: h.user,
      itemId: h.item,
      source: h.source,
      earnedAt: now,
      offsetMinutes: h.offsetMinutes,
    })),
  );

  const peopleById = new Map<string, (typeof PEOPLE)[number]>(PEOPLE.map((p) => [p.id, p]));
  const activityRows: Array<{
    userId: string;
    kind: string;
    title: string;
    body: string | null;
    href: string | null;
    createdAt: Date;
    offsetMinutes: number | null;
  }> = [];
  for (const call of CALLS) {
    const market = marketById.get(call.market)!;
    const outcome = market.outcomes.find((o) => o.key === call.key)!;
    const settled = Boolean(market.resolvedKey);
    const correct = settled && market.resolvedKey === call.key;
    activityRows.push({
      userId: call.user,
      kind: settled ? "result" : "call",
      title: settled
        ? correct
          ? `Called ${outcome.label}`
          : `Missed ${outcome.label}`
        : `Backed ${outcome.label}`,
      body: market.question,
      href: `/calls/${market.id}`,
      createdAt: now,
      offsetMinutes: call.offsetMinutes,
    });
  }
  for (const entry of ENTRIES) {
    const room = ROOMS.find((r) => r.id === entry.room)!;
    activityRows.push({
      userId: entry.user,
      kind: "seat",
      title: `Took a seat in ${room.title}`,
      body: room.prizeSummary,
      href: `/compete/${room.id}`,
      createdAt: now,
      offsetMinutes: entry.offsetMinutes,
    });
  }
  for (const [followerId, followingId, offsetMinutes] of FOLLOWS) {
    const target = peopleById.get(followingId)!;
    activityRows.push({
      userId: followerId,
      kind: "follow",
      title: `Followed ${target.displayName}`,
      body: "Their calls now sit on a record, not a rumour.",
      href: `/u/${followingId}`,
      createdAt: now,
      offsetMinutes,
    });
  }
  await tx.insert(activity).values(activityRows);

  await tx.insert(notifications).values([
    {
      userId: "you",
      title: "Chioma backed Kemi",
      body: "A demonstration read on Lagos After Dark. Not a signal to copy. Open the call if you want her thesis.",
      href: "/calls/lagos-after-dark",
      kind: "follow",
      read: false,
      createdAt: now,
      offsetMinutes: hours(2),
    },
    {
      userId: "you",
      title: "Matchweek Desk is still open",
      body: "Recognition only. No cash. Seats close with the sports slate.",
      href: "/compete/matchweek-desk",
      kind: "room",
      read: false,
      createdAt: now,
      offsetMinutes: hours(1),
    },
    {
      userId: "you",
      title: "Simulated miss on the show final",
      body: "Your demo call on Jide missed. ₦5,000 stayed spent in the demo purse. No real money moved.",
      href: "/calls/r-show-final",
      kind: "result",
      read: false,
      createdAt: now,
      offsetMinutes: days(3),
    },
    {
      userId: "you",
      title: "You followed Tunde's record",
      body: "His football calls will show under people you follow. Sabi will not copy them for you.",
      href: "/u/tunde",
      kind: "follow",
      read: true,
      createdAt: now,
      offsetMinutes: days(10),
    },
    {
      userId: "you",
      title: "Pitch & Call published its prize source",
      body: "Fictional sponsor Greenfield Flour. Contest prize, not funded by losses, not payable in this demo.",
      href: "/compete/pitch-and-call",
      kind: "room",
      read: true,
      createdAt: now,
      offsetMinutes: hours(20),
    },
  ]);

  await tx.insert(appMeta).values({ id: "seed", clockAnchor: now });
  await reanchor(tx, now);
}

export async function reanchor(tx: Tx, anchor: Date) {
  const iso = anchor.toISOString();
  await tx.execute(sql`
    UPDATE markets
    SET closes_at = ${iso}::timestamptz + (close_offset_hours * interval '1 hour'),
        resolves_at = ${iso}::timestamptz + (resolve_offset_hours * interval '1 hour')
  `);
  await tx.execute(sql`
    UPDATE competitions
    SET starts_at = ${iso}::timestamptz + (start_offset_hours * interval '1 hour'),
        ends_at = ${iso}::timestamptz + (end_offset_hours * interval '1 hour')
  `);
  await tx.execute(sql`
    UPDATE users
    SET joined_at = ${iso}::timestamptz + (joined_offset_minutes * interval '1 minute')
    WHERE joined_offset_minutes IS NOT NULL
  `);
  for (const table of ["positions", "comments", "follows", "competition_entries", "holdings", "notifications", "activity"]) {
    await tx.execute(sql.raw(`
      UPDATE ${table}
      SET ${table === "holdings" ? "earned_at" : "created_at"} = '${iso}'::timestamptz + (offset_minutes * interval '1 minute')
      WHERE offset_minutes IS NOT NULL
    `));
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
