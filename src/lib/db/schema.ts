import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  inviteCode: text("invite_code").notNull().unique(),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  flagEmoji: text("flag_emoji").notNull(),
  groupLetter: text("group_letter"),
});

export type Stage =
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "third"
  | "final";

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey(),
  homeTeamId: text("home_team_id").references(() => teams.id),
  awayTeamId: text("away_team_id").references(() => teams.id),
  stage: text("stage", { enum: ["group", "r32", "r16", "qf", "sf", "third", "final"] }).notNull(),
  kickoffUtc: integer("kickoff_utc", { mode: "timestamp" }).notNull(),
  result: text("result", { enum: ["1", "X", "2"] }),
  locked: integer("locked", { mode: "boolean" }).notNull().default(false),
});

export const predictions = sqliteTable(
  "predictions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id),
    pick: text("pick", { enum: ["1", "X", "2"] }).notNull(),
  },
  (table) => [uniqueIndex("user_match_idx").on(table.userId, table.matchId)]
);
