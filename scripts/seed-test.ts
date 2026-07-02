import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, sql } from "drizzle-orm";
import { teams, matches, users, predictions } from "../src/lib/db/schema";
import { WC2026_TEAMS, GROUP_MATCHES, generateKoMatches } from "./seed";

const url = process.env.DB_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
  url.startsWith("file:") ? { url } : { url, authToken: authToken! },
);

const db = drizzle(client);

type Mode = "initial" | "progress" | "finished" | "random";

const mode = (process.argv
  .find((a) => a.startsWith("--mode="))
  ?.split("=")[1] ?? "initial") as Mode;

const TEST_USERS = [
  {
    name: "Joona",
    inviteCode: process.env.ADMIN_INVITE_CODE || "WC26-ADMIN",
    isAdmin: true,
  },
  { name: "Usko", inviteCode: "test-usko", isAdmin: false },
  { name: "Anna", inviteCode: "test-anna", isAdmin: false },
  { name: "Matti", inviteCode: "test-matti", isAdmin: false },
  { name: "Maija", inviteCode: "test-maija", isAdmin: false },
  { name: "Kalle", inviteCode: "test-kalle", isAdmin: false },
  { name: "Sirkka", inviteCode: "test-sirkka", isAdmin: false },
  { name: "Eero", inviteCode: "test-eero", isAdmin: false },
  { name: "Lena", inviteCode: "test-lena", isAdmin: false },
  { name: "Pertti", inviteCode: "test-pertti", isAdmin: false },
  { name: "Aino", inviteCode: "test-aino", isAdmin: false },
  { name: "Timo", inviteCode: "test-timo", isAdmin: false },
  { name: "Raili", inviteCode: "test-raili", isAdmin: false },
  { name: "Veikko", inviteCode: "test-veikko", isAdmin: false },
  { name: "Outi", inviteCode: "test-outi", isAdmin: false },
];

const RESULT_PATTERN = ["1", "1", "X", "1", "2", "1", "1", "X", "2", "1"];

const SHARED_GUESSES = { correct: 8, incorrect: 3 };
const SPLIT_INCORRECT = 1;
const LONE_WOLF = 1;

function resultFor(matchIndex: number): "1" | "X" | "2" {
  return RESULT_PATTERN[matchIndex % RESULT_PATTERN.length] as "1" | "X" | "2";
}

function buildUnanimousIndices(): Set<number> {
  const indices = new Set<number>();
  let correctNeeded = SHARED_GUESSES.correct;
  let incorrectNeeded = SHARED_GUESSES.incorrect;
  for (let i = 0; correctNeeded > 0 || incorrectNeeded > 0; i++) {
    const result = resultFor(i);
    if (result === "1" && correctNeeded > 0) {
      indices.add(i);
      correctNeeded--;
    } else if (result !== "1" && incorrectNeeded > 0) {
      indices.add(i);
      incorrectNeeded--;
    }
  }
  return indices;
}

const UNANIMOUS_INDICES = buildUnanimousIndices();

function buildSplitIncorrectIndices(): Set<number> {
  const indices = new Set<number>();
  let needed = SPLIT_INCORRECT;
  for (let i = 0; needed > 0; i++) {
    if (!UNANIMOUS_INDICES.has(i)) {
      indices.add(i);
      needed--;
    }
  }
  return indices;
}

const SPLIT_INCORRECT_INDICES = buildSplitIncorrectIndices();

function buildLoneWolfIndices(): Set<number> {
  const indices = new Set<number>();
  let needed = LONE_WOLF;
  for (let i = 0; needed > 0; i++) {
    if (!UNANIMOUS_INDICES.has(i) && !SPLIT_INCORRECT_INDICES.has(i)) {
      indices.add(i);
      needed--;
    }
  }
  return indices;
}

const LONE_WOLF_INDICES = buildLoneWolfIndices();

function winnerPick(
  matchIndex: number,
  result: "1" | "X" | "2",
): "1" | "X" | "2" {
  if (UNANIMOUS_INDICES.has(matchIndex)) return "1";
  if (matchIndex % 5 === 0) {
    const opts: ("1" | "X" | "2")[] = ["1", "X", "2"];
    return opts[(matchIndex / 5) % 3];
  }
  return result;
}

function userPick(
  pattern: ("1" | "X" | "2")[],
  matchIndex: number,
): "1" | "X" | "2" {
  if (UNANIMOUS_INDICES.has(matchIndex)) return "1";
  return pattern[matchIndex % pattern.length];
}

const USER_PATTERNS: Record<string, ("1" | "X" | "2")[]> = {
  Usko: ["1"],
  Anna: ["1", "X"],
  Matti: ["2", "1", "1"],
  Maija: ["1", "1", "X", "2", "1"],
  Kalle: ["1", "1", "1", "X"],
  Sirkka: ["2", "2", "1"],
  Eero: ["X", "X", "1", "1"],
  Lena: ["1", "2", "1", "X", "1", "1"],
  Pertti: ["2"],
  Aino: ["1", "1", "1", "1", "2"],
  Timo: ["X", "1", "1", "1"],
  Raili: ["1", "X", "2", "1", "X"],
  Veikko: ["1", "1", "2"],
  Outi: ["2", "1", "X", "1", "1", "2", "1"],
};

const PICKS = ["1", "X", "2"] as const;
const randomPick = (): "1" | "X" | "2" =>
  PICKS[Math.floor(Math.random() * PICKS.length)];

const PROGRESS_RESOLVED_COUNT = 60;

async function seedTest() {
  console.log(`Seeding test database (mode: ${mode})...`);

  console.log("Truncating data...");
  await db.delete(predictions);
  await db.delete(matches);
  await db.delete(users);
  await db.delete(teams);
  await db.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('users', 'predictions')`);
  console.log("Data cleared");

  console.log("Inserting teams...");
  const teamValues = WC2026_TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    flagEmoji: t.flag,
    groupLetter: t.group,
  }));
  const teamIdByName: Record<string, string> = {};
  for (const t of WC2026_TEAMS) teamIdByName[t.name] = t.id;
  for (let i = 0; i < teamValues.length; i += 10) {
    await db.insert(teams).values(teamValues.slice(i, i + 10));
  }

  console.log("Inserting matches...");
  const groupMatchValues = GROUP_MATCHES.map((m, i) => ({
    id: i + 1,
    homeTeamId: teamIdByName[m.home],
    awayTeamId: teamIdByName[m.away],
    stage: "group" as const,
    kickoffUtc: new Date(m.kickoffUtc),
  }));
  for (let i = 0; i < groupMatchValues.length; i += 10) {
    await db.insert(matches).values(groupMatchValues.slice(i, i + 10));
  }

  const koMatches = generateKoMatches(groupMatchValues.length + 1);
  if (mode === "finished") {
    const teamIds = WC2026_TEAMS.map((t) => t.id);
    koMatches.forEach((m, i) => {
      m.homeTeamId = teamIds[(i * 2) % teamIds.length];
      m.awayTeamId = teamIds[(i * 2 + 1) % teamIds.length];
    });
  }
  for (let i = 0; i < koMatches.length; i += 10) {
    await db.insert(matches).values(koMatches.slice(i, i + 10));
  }

  console.log("Creating users...");
  for (const u of TEST_USERS) {
    await db.insert(users).values({
      name: u.name,
      inviteCode: u.inviteCode,
      isAdmin: u.isAdmin,
      hasSeenResultsSummary: false,
    });
  }

  const insertedUsers = await db.select().from(users).all();
  const userByName = new Map(insertedUsers.map((u) => [u.name, u.id]));

  const allMatches = await db
    .select()
    .from(matches)
    .orderBy(matches.kickoffUtc);
  const resolvedCount =
    mode === "initial"
      ? 0
      : mode === "progress"
        ? PROGRESS_RESOLVED_COUNT
        : allMatches.length;

  if (mode === "random") {
    console.log(`Setting random results + locking all matches...`);
    for (const m of allMatches) {
      const result = randomPick();
      await db
        .update(matches)
        .set({ result, locked: true })
        .where(eq(matches.id, m.id));
    }

    console.log("Generating random predictions...");
    for (const u of TEST_USERS) {
      const userId = userByName.get(u.name)!;
      for (const m of allMatches) {
        await db.insert(predictions).values({
          userId,
          matchId: m.id,
          pick: randomPick(),
        });
      }
    }
  } else if (mode !== "initial") {
    console.log(`Setting results + locking ${resolvedCount} matches...`);
    for (let i = 0; i < resolvedCount; i++) {
      const m = allMatches[i];
      const result = resultFor(i);
      await db
        .update(matches)
        .set({ result, locked: true })
        .where(eq(matches.id, m.id));
    }
  }

  if (mode !== "initial" && mode !== "random") {
    console.log("Generating predictions...");
    for (let userIdx = 0; userIdx < TEST_USERS.length; userIdx++) {
      const userName = TEST_USERS[userIdx].name;
      const userId = userByName.get(userName)!;
      const pattern = USER_PATTERNS[userName];
      for (let i = 0; i < resolvedCount; i++) {
        const result = resultFor(i);
        let pick: "1" | "X" | "2";
        if (UNANIMOUS_INDICES.has(i)) {
          pick = "1";
        } else if (SPLIT_INCORRECT_INDICES.has(i)) {
          const wrong = (["1", "X", "2"] as const).filter((o) => o !== result);
          pick = wrong[userIdx % 2];
        } else if (LONE_WOLF_INDICES.has(i)) {
          if (userIdx === 0) {
            pick = result;
          } else {
            const wrong = (["1", "X", "2"] as const).filter(
              (o) => o !== result,
            );
            pick = wrong[userIdx % 2];
          }
        } else if (TEST_USERS[userIdx].isAdmin) {
          pick = winnerPick(i, result);
        } else {
          pick = userPick(pattern, i);
        }
        await db.insert(predictions).values({
          userId,
          matchId: allMatches[i].id,
          pick,
        });
      }
    }
  }

  console.log(`Seed complete (mode: ${mode})!`);
  console.log("Test invite codes:");
  for (const u of TEST_USERS) {
    console.log(`  ${u.name.padEnd(8)} → ${u.inviteCode}`);
  }
}

seedTest().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
