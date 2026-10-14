import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
  openingBalanceNgn: integer("opening_balance_ngn").notNull(),
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
  source: text("source").notNull(),
  rules: text("rules").notNull(),
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
