import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { teams, matches, scoringRules, users } from "../src/lib/db/schema";
import type { Stage } from "../src/lib/db/schema";

const url = process.env.DB_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
  url.startsWith("file:")
    ? { url }
    : { url, authToken: authToken! }
);

const db = drizzle(client);

const WC2026_TEAMS: { name: string; flag: string; group: string }[] = [
  { name: "Yhdysvallat", flag: "\u{1F1FA}\u{1F1F8}", group: "A" },
  { name: "Kanada", flag: "\u{1F1E8}\u{1F1E6}", group: "A" },
  { name: "Meksiko", flag: "\u{1F1F2}\u{1F1FD}", group: "A" },
  { name: "Costa Rica / Play-off voittaja", flag: "\u{1F1E8}\u{1F1F7}", group: "A" },
  { name: "Brasilia", flag: "\u{1F1E7}\u{1F1F7}", group: "B" },
  { name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}", group: "B" },
  { name: "Kolumbia", flag: "\u{1F1E8}\u{1F1F4}", group: "B" },
  { name: "Peru / Chile / Play-off voittaja", flag: "\u{1F1F5}\u{1F1EA}", group: "B" },
  { name: "Argentiina", flag: "\u{1F1E6}\u{1F1F7}", group: "C" },
  { name: "Chile", flag: "\u{1F1E8}\u{1F1F1}", group: "C" },
  { name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}", group: "C" },
  { name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}", group: "C" },
  { name: "Ranska", flag: "\u{1F1EB}\u{1F1F7}", group: "D" },
  { name: "Englanti", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", group: "D" },
  { name: "Alankomaat", flag: "\u{1F1F3}\u{1F1F1}", group: "D" },
  { name: "Wales / Play-off voittaja", flag: "\u{1F1EC}\u{1F1E7}", group: "D" },
  { name: "Saksa", flag: "\u{1F1E9}\u{1F1EA}", group: "E" },
  { name: "Espanja", flag: "\u{1F1EA}\u{1F1F8}", group: "E" },
  { name: "Italia", flag: "\u{1F1EE}\u{1F1F9}", group: "E" },
  { name: "Sveitsi", flag: "\u{1F1E8}\u{1F1ED}", group: "E" },
  { name: "Portugali", flag: "\u{1F1F5}\u{1F1F9}", group: "F" },
  { name: "Kroatia", flag: "\u{1F1ED}\u{1F1F7}", group: "F" },
  { name: "Tanska", flag: "\u{1F1E9}\u{1F1F0}", group: "F" },
  { name: "Turkki", flag: "\u{1F1F9}\u{1F1F7}", group: "F" },
  { name: "Japani", flag: "\u{1F1EF}\u{1F1F5}", group: "G" },
  { name: "Etel\u00e4-Korea", flag: "\u{1F1F0}\u{1F1F7}", group: "G" },
  { name: "Australia", flag: "\u{1F1E6}\u{1F1FA}", group: "G" },
  { name: "Saudi-Arabia", flag: "\u{1F1F8}\u{1F1E6}", group: "G" },
  { name: "Marokko", flag: "\u{1F1F2}\u{1F1E6}", group: "H" },
  { name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}", group: "H" },
  { name: "Egypti", flag: "\u{1F1EA}\u{1F1EC}", group: "H" },
  { name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", group: "H" },
  { name: "Iran", flag: "\u{1F1EE}\u{1F1F7}", group: "I" },
  { name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}", group: "I" },
  { name: "Jordania", flag: "\u{1F1EF}\u{1F1F4}", group: "I" },
  { name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}", group: "I" },
  { name: "Uusi-Seelanti", flag: "\u{1F1F3}\u{1F1FF}", group: "J" },
  { name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", group: "J" },
  { name: "Japani 2 / Play-off", flag: "\u{1F1EF}\u{1F1F5}", group: "J" },
  { name: "Australia 2 / Play-off", flag: "\u{1F1E6}\u{1F1FA}", group: "J" },
  { name: "Mali", flag: "\u{1F1F2}\u{1F1F1}", group: "K" },
  { name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}", group: "K" },
  { name: "Kamerun", flag: "\u{1F1E8}\u{1F1F2}", group: "K" },
  { name: "Kongon demokraattinen tasavalta", flag: "\u{1F1E8}\u{1F1E9}", group: "K" },
  { name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}", group: "L" },
  { name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}", group: "L" },
  { name: "Etel\u00e4-Afrikka", flag: "\u{1F1FF}\u{1F1E6}", group: "L" },
  { name: "Kongon tasavalta", flag: "\u{1F1E8}\u{1F1EC}", group: "L" },
];

const DEFAULT_SCORING: { stage: Stage; points: number }[] = [
  { stage: "group", points: 1 },
  { stage: "r32", points: 2 },
  { stage: "r16", points: 3 },
  { stage: "qf", points: 4 },
  { stage: "sf", points: 5 },
  { stage: "third", points: 4 },
  { stage: "final", points: 6 },
];

function generateGroupMatches(teamIds: Record<string, number>) {
  const groups = "ABCDEFGHIJKL".split("");
  const groupMatches: (typeof matches.$inferInsert)[] = [];
  let matchNumber = 1;

  for (const group of groups) {
    const groupTeams = WC2026_TEAMS.filter((t) => t.group === group);
    if (groupTeams.length < 4) continue;

    const ids = groupTeams.map((t) => teamIds[t.name]);
    const kickoff = new Date("2026-06-11T18:00:00Z");

    const pairings = [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ];

    for (let i = 0; i < pairings.length; i++) {
      const [a, b] = pairings[i];
      const matchKickoff = new Date(kickoff.getTime() + (matchNumber - 1) * 24 * 60 * 60 * 1000);
      groupMatches.push({
        homeTeamId: ids[a],
        awayTeamId: ids[b],
        homeLabel: groupTeams[a].flag + " " + groupTeams[a].name,
        awayLabel: groupTeams[b].flag + " " + groupTeams[b].name,
        stage: "group",
        kickoffUtc: matchKickoff,
        matchNumber,
      });
      matchNumber++;
    }
  }

  return { groupMatches, nextMatchNumber: matchNumber };
}

function generateKoMatches(startNumber: number) {
  const koMatches: (typeof matches.$inferInsert)[] = [];
  const groups = "ABCDEFGHIJKL".split("");
  let matchNumber = startNumber;

  const r32Pairings: [string, string][] = [
    ["1A", "2B"],
    ["1C", "2D"],
    ["1E", "2F"],
    ["1G", "2H"],
    ["1I", "2J"],
    ["1K", "2L"],
    ["1B", "2A"],
    ["1D", "2C"],
    ["1F", "2E"],
    ["1H", "2G"],
    ["1J", "2I"],
    ["1L", "2K"],
    ["3A", "3B"],
    ["3C", "3D"],
    ["3E", "3F"],
    ["3G", "3H"],
  ];

  const groupPositions: Record<string, string> = {};
  for (const g of groups) {
    groupPositions["1" + g] = "Lohko " + g + " voittaja";
    groupPositions["2" + g] = "Lohko " + g + " toinen";
    groupPositions["3" + g] = "Lohko " + g + " kolmas";
  }

  const r32Kickoff = new Date("2026-06-27T18:00:00Z");
  for (let i = 0; i < r32Pairings.length; i++) {
    const [home, away] = r32Pairings[i];
    const kickoff = new Date(r32Kickoff.getTime() + i * 12 * 60 * 60 * 1000);
    koMatches.push({
      homeLabel: groupPositions[home] || home,
      awayLabel: groupPositions[away] || away,
      stage: "r32",
      kickoffUtc: kickoff,
      matchNumber: matchNumber++,
    });
  }

  const r16Pairings: [string, string][] = [
    ["J1 voittaja", "J2 voittaja"],
    ["J3 voittaja", "J4 voittaja"],
    ["J5 voittaja", "J6 voittaja"],
    ["J7 voittaja", "J8 voittaja"],
    ["J9 voittaja", "J10 voittaja"],
    ["J11 voittaja", "J12 voittaja"],
    ["J13 voittaja", "J14 voittaja"],
    ["J15 voittaja", "J16 voittaja"],
  ];

  const r16Kickoff = new Date("2026-07-04T18:00:00Z");
  for (let i = 0; i < r16Pairings.length; i++) {
    const [home, away] = r16Pairings[i];
    const kickoff = new Date(r16Kickoff.getTime() + i * 12 * 60 * 60 * 1000);
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "r16",
      kickoffUtc: kickoff,
      matchNumber: matchNumber++,
    });
  }

  const qfPairings: [string, string][] = [
    ["P16 voittaja", "P17 voittaja"],
    ["P18 voittaja", "P19 voittaja"],
    ["P20 voittaja", "P21 voittaja"],
    ["P22 voittaja", "P23 voittaja"],
  ];

  const qfKickoff = new Date("2026-07-09T18:00:00Z");
  for (let i = 0; i < qfPairings.length; i++) {
    const [home, away] = qfPairings[i];
    const kickoff = new Date(qfKickoff.getTime() + i * 24 * 60 * 60 * 1000);
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "qf",
      kickoffUtc: kickoff,
      matchNumber: matchNumber++,
    });
  }

  const sfPairings: [string, string][] = [
    ["P24 voittaja", "P25 voittaja"],
    ["P26 voittaja", "P27 voittaja"],
  ];

  const sfKickoff = new Date("2026-07-14T18:00:00Z");
  for (let i = 0; i < sfPairings.length; i++) {
    const [home, away] = sfPairings[i];
    const kickoff = new Date(sfKickoff.getTime() + i * 24 * 60 * 60 * 1000);
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "sf",
      kickoffUtc: kickoff,
      matchNumber: matchNumber++,
    });
  }

  koMatches.push({
    homeLabel: "Pronssiottelu: P28 h\u00e4vi\u00e4j\u00e4",
    awayLabel: "Pronssiottelu: P29 h\u00e4vi\u00e4j\u00e4",
    stage: "third",
    kickoffUtc: new Date("2026-07-17T18:00:00Z"),
    matchNumber: matchNumber++,
  });

  koMatches.push({
    homeLabel: "P28 voittaja",
    awayLabel: "P29 voittaja",
    stage: "final",
    kickoffUtc: new Date("2026-07-19T18:00:00Z"),
    matchNumber: matchNumber++,
  });

  return koMatches;
}

async function seed() {
  console.log("Seeding database...");

  console.log("Inserting teams...");
  const teamValues = WC2026_TEAMS.map((t) => ({
    name: t.name,
    flagEmoji: t.flag,
    groupLetter: t.group,
  }));

  const insertedTeams: { id: number; name: string }[] = [];
  for (let i = 0; i < teamValues.length; i += 10) {
    const batch = await db.insert(teams).values(teamValues.slice(i, i + 10)).returning();
    insertedTeams.push(...batch);
  }

  const teamIds: Record<string, number> = {};
  for (const t of insertedTeams) {
    teamIds[t.name] = t.id;
  }
  console.log(`Inserted ${insertedTeams.length} teams`);

  console.log("Generating group stage matches...");
  const { groupMatches, nextMatchNumber } = generateGroupMatches(teamIds);
  for (let i = 0; i < groupMatches.length; i += 10) {
    await db.insert(matches).values(groupMatches.slice(i, i + 10));
  }
  console.log(`Inserted ${groupMatches.length} group stage matches`);

  console.log("Generating knockout stage matches...");
  const koMatches = generateKoMatches(nextMatchNumber);
  for (let i = 0; i < koMatches.length; i += 10) {
    await db.insert(matches).values(koMatches.slice(i, i + 10));
  }
  console.log(`Inserted ${koMatches.length} knockout stage matches`);

  console.log("Inserting scoring rules...");
  await db.insert(scoringRules).values(DEFAULT_SCORING);
  console.log(`Inserted ${DEFAULT_SCORING.length} scoring rules`);

  console.log("Creating admin user...");
  await db.insert(users).values({
    name: "Admin",
    inviteCode: process.env.ADMIN_INVITE_CODE || "WC26-ADMIN",
    isAdmin: true,
  });
  console.log("Admin user created");

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
