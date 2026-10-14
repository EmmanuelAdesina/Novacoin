import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const appMeta = pgTable("app_meta", {
  id: text("id").primaryKey(),
  clockAnchor: timestamp("clock_anchor", { withTimezone: true }).notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  bio: text("bio").notNull(),
  style: text("style").notNull(),
  initials: text("initials").notNull(),
  hue: text("hue").notNull(),
  isYou: boolean("is_you").notNull().default(false),
  onboarded: boolean("onboarded").notNull().default(false),
  interests: text("interests").notNull().default(""),
  openingPurseNgn: integer("opening_purse_ngn").notNull(),
  joinedOffsetMinutes: integer("joined_offset_minutes").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
});

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    offsetMinutes: integer("offset_minutes"),
  },
  (t) => [uniqueIndex("follows_pair_idx").on(t.followerId, t.followingId)],
);

export const markets = pgTable("markets", {
  id: text("id").primaryKey(),
  question: text("question").notNull(),
  category: text("category").notNull(),
  summary: text("summary").notNull(),
  resolutionSource: text("resolution_source").notNull(),
  resolutionRule: text("resolution_rule").notNull(),
  demoNote: text("demo_note").notNull(),
  closeOffsetHours: integer("close_offset_hours").notNull(),
  resolveOffsetHours: integer("resolve_offset_hours").notNull(),
  closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
  resolvesAt: timestamp("resolves_at", { withTimezone: true }).notNull(),
  resolvedOutcomeId: text("resolved_outcome_id"),
  featured: boolean("featured").notNull().default(false),
});

export const outcomes = pgTable("outcomes", {
  id: text("id").primaryKey(),
  marketId: text("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  priceBps: integer("price_bps").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  marketId: text("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  outcomeId: text("outcome_id")
    .notNull()
    .references(() => outcomes.id, { onDelete: "cascade" }),
  stakeNgn: integer("stake_ngn").notNull(),
  priceBps: integer("price_bps").notNull(),
  payoutNgn: integer("payout_ngn"),
  settled: boolean("settled").notNull().default(false),
  correct: boolean("correct"),
  thesis: text("thesis"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  offsetMinutes: integer("offset_minutes"),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  marketId: text("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  offsetMinutes: integer("offset_minutes"),
});

export const competitions = pgTable("competitions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  kind: text("kind").notNull(),
  summary: text("summary").notNull(),
  rules: text("rules").notNull(),
  eligibility: text("eligibility").notNull(),
  scoring: text("scoring").notNull(),
  rewardSource: text("reward_source").notNull(),
  rewardType: text("reward_type").notNull(),
  prizeSummary: text("prize_summary").notNull(),
  sponsorName: text("sponsor_name"),
  requiresItemId: text("requires_item_id"),
  spots: integer("spots"),
  featured: boolean("featured").notNull().default(false),
  startOffsetHours: integer("start_offset_hours").notNull(),
  endOffsetHours: integer("end_offset_hours").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
});

export const competitionEntries = pgTable(
  "competition_entries",
  {
    id: serial("id").primaryKey(),
    competitionId: text("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score"),
    points: integer("points").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    offsetMinutes: integer("offset_minutes"),
  },
  (t) => [uniqueIndex("entries_pair_idx").on(t.competitionId, t.userId)],
);

export const items = pgTable("items", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  utility: text("utility").notNull(),
  howEarned: text("how_earned").notNull(),
  season: text("season").notNull(),
  illustratedPriceNgn: integer("illustrated_price_ngn"),
  boundary: text("boundary").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const holdings = pgTable(
  "holdings",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    source: text("source").notNull(),
    earnedAt: timestamp("earned_at", { withTimezone: true }).notNull(),
    offsetMinutes: integer("offset_minutes"),
  },
  (t) => [uniqueIndex("holdings_pair_idx").on(t.userId, t.itemId)],
);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href"),
  kind: text("kind").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  offsetMinutes: integer("offset_minutes"),
});

export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  offsetMinutes: integer("offset_minutes"),
});
