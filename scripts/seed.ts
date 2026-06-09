import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  teams,
  matches,
  users,
  predictions,
} from "../src/lib/db/schema";

const url = process.env.DB_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
  url.startsWith("file:") ? { url } : { url, authToken: authToken! },
);

const db = drizzle(client);

function flagEmoji(cc: string): string {
  return String.fromCodePoint(
    ...cc
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

const SCOTLAND_FLAG =
  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}";
const ENGLAND_FLAG =
  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";

const WC2026_TEAMS: { name: string; flag: string; group: string }[] = [
  { name: "Meksiko", flag: flagEmoji("MX"), group: "A" },
  { name: "Etelä-Afrikka", flag: flagEmoji("ZA"), group: "A" },
  { name: "Etelä-Korea", flag: flagEmoji("KR"), group: "A" },
  { name: "Tshekki", flag: flagEmoji("CZ"), group: "A" },
  { name: "Kanada", flag: flagEmoji("CA"), group: "B" },
  { name: "Bosnia-Hertsegovina", flag: flagEmoji("BA"), group: "B" },
  { name: "Qatar", flag: flagEmoji("QA"), group: "B" },
  { name: "Sveitsi", flag: flagEmoji("CH"), group: "B" },
  { name: "Brasilia", flag: flagEmoji("BR"), group: "C" },
  { name: "Marokko", flag: flagEmoji("MA"), group: "C" },
  { name: "Haiti", flag: flagEmoji("HT"), group: "C" },
  { name: "Skotlanti", flag: SCOTLAND_FLAG, group: "C" },
  { name: "Yhdysvallat", flag: flagEmoji("US"), group: "D" },
  { name: "Paraguay", flag: flagEmoji("PY"), group: "D" },
  { name: "Australia", flag: flagEmoji("AU"), group: "D" },
  { name: "Turkki", flag: flagEmoji("TR"), group: "D" },
  { name: "Saksa", flag: flagEmoji("DE"), group: "E" },
  { name: "Curaçao", flag: flagEmoji("CW"), group: "E" },
  { name: "Norsunluurannikko", flag: flagEmoji("CI"), group: "E" },
  { name: "Ecuador", flag: flagEmoji("EC"), group: "E" },
  { name: "Hollanti", flag: flagEmoji("NL"), group: "F" },
  { name: "Japani", flag: flagEmoji("JP"), group: "F" },
  { name: "Ruotsi", flag: flagEmoji("SE"), group: "F" },
  { name: "Tunisia", flag: flagEmoji("TN"), group: "F" },
  { name: "Belgia", flag: flagEmoji("BE"), group: "G" },
  { name: "Egypti", flag: flagEmoji("EG"), group: "G" },
  { name: "Iran", flag: flagEmoji("IR"), group: "G" },
  { name: "Uusi-Seelanti", flag: flagEmoji("NZ"), group: "G" },
  { name: "Espanja", flag: flagEmoji("ES"), group: "H" },
  { name: "Kap Verde", flag: flagEmoji("CV"), group: "H" },
  { name: "Saudi-Arabia", flag: flagEmoji("SA"), group: "H" },
  { name: "Uruguay", flag: flagEmoji("UY"), group: "H" },
  { name: "Ranska", flag: flagEmoji("FR"), group: "I" },
  { name: "Senegal", flag: flagEmoji("SN"), group: "I" },
  { name: "Irak", flag: flagEmoji("IQ"), group: "I" },
  { name: "Norja", flag: flagEmoji("NO"), group: "I" },
  { name: "Argentiina", flag: flagEmoji("AR"), group: "J" },
  { name: "Algeria", flag: flagEmoji("DZ"), group: "J" },
  { name: "Itävalta", flag: flagEmoji("AT"), group: "J" },
  { name: "Jordania", flag: flagEmoji("JO"), group: "J" },
  { name: "Portugali", flag: flagEmoji("PT"), group: "K" },
  {
    name: "Kongon demokraattinen tasavalta",
    flag: flagEmoji("CD"),
    group: "K",
  },
  { name: "Uzbekistan", flag: flagEmoji("UZ"), group: "K" },
  { name: "Kolumbia", flag: flagEmoji("CO"), group: "K" },
  { name: "Englanti", flag: ENGLAND_FLAG, group: "L" },
  { name: "Kroatia", flag: flagEmoji("HR"), group: "L" },
  { name: "Ghana", flag: flagEmoji("GH"), group: "L" },
  { name: "Panama", flag: flagEmoji("PA"), group: "L" },
];

const GROUP_MATCHES: { home: string; away: string; kickoffUtc: string }[] = [
  { home: "Meksiko", away: "Etelä-Afrikka", kickoffUtc: "2026-06-11T19:00:00Z" },
  { home: "Etelä-Korea", away: "Tshekki", kickoffUtc: "2026-06-12T02:00:00Z" },
  { home: "Kanada", away: "Bosnia-Hertsegovina", kickoffUtc: "2026-06-12T19:00:00Z" },
  { home: "Yhdysvallat", away: "Paraguay", kickoffUtc: "2026-06-13T01:00:00Z" },
  { home: "Qatar", away: "Sveitsi", kickoffUtc: "2026-06-13T19:00:00Z" },
  { home: "Brasilia", away: "Marokko", kickoffUtc: "2026-06-13T22:00:00Z" },
  { home: "Haiti", away: "Skotlanti", kickoffUtc: "2026-06-14T01:00:00Z" },
  { home: "Australia", away: "Turkki", kickoffUtc: "2026-06-14T04:00:00Z" },
  { home: "Saksa", away: "Curaçao", kickoffUtc: "2026-06-14T17:00:00Z" },
  { home: "Hollanti", away: "Japani", kickoffUtc: "2026-06-14T20:00:00Z" },
  { home: "Norsunluurannikko", away: "Ecuador", kickoffUtc: "2026-06-14T23:00:00Z" },
  { home: "Ruotsi", away: "Tunisia", kickoffUtc: "2026-06-15T02:00:00Z" },
  { home: "Espanja", away: "Kap Verde", kickoffUtc: "2026-06-15T16:00:00Z" },
  { home: "Belgia", away: "Egypti", kickoffUtc: "2026-06-15T19:00:00Z" },
  { home: "Saudi-Arabia", away: "Uruguay", kickoffUtc: "2026-06-15T22:00:00Z" },
  { home: "Iran", away: "Uusi-Seelanti", kickoffUtc: "2026-06-16T01:00:00Z" },
  { home: "Ranska", away: "Senegal", kickoffUtc: "2026-06-16T19:00:00Z" },
  { home: "Irak", away: "Norja", kickoffUtc: "2026-06-16T22:00:00Z" },
  { home: "Argentiina", away: "Algeria", kickoffUtc: "2026-06-17T01:00:00Z" },
  { home: "Itävalta", away: "Jordania", kickoffUtc: "2026-06-17T04:00:00Z" },
  { home: "Portugali", away: "Kongon demokraattinen tasavalta", kickoffUtc: "2026-06-17T17:00:00Z" },
  { home: "Englanti", away: "Kroatia", kickoffUtc: "2026-06-17T20:00:00Z" },
  { home: "Ghana", away: "Panama", kickoffUtc: "2026-06-17T23:00:00Z" },
  { home: "Uzbekistan", away: "Kolumbia", kickoffUtc: "2026-06-18T02:00:00Z" },
  { home: "Tshekki", away: "Etelä-Afrikka", kickoffUtc: "2026-06-18T16:00:00Z" },
  { home: "Sveitsi", away: "Bosnia-Hertsegovina", kickoffUtc: "2026-06-18T17:00:00Z" },
  { home: "Kanada", away: "Qatar", kickoffUtc: "2026-06-18T22:00:00Z" },
  { home: "Meksiko", away: "Etelä-Korea", kickoffUtc: "2026-06-19T01:00:00Z" },
  { home: "Yhdysvallat", away: "Australia", kickoffUtc: "2026-06-19T19:00:00Z" },
  { home: "Skotlanti", away: "Marokko", kickoffUtc: "2026-06-19T22:00:00Z" },
  { home: "Brasilia", away: "Haiti", kickoffUtc: "2026-06-20T00:30:00Z" },
  { home: "Turkki", away: "Paraguay", kickoffUtc: "2026-06-20T03:00:00Z" },
  { home: "Hollanti", away: "Ruotsi", kickoffUtc: "2026-06-20T17:00:00Z" },
  { home: "Saksa", away: "Norsunluurannikko", kickoffUtc: "2026-06-20T20:00:00Z" },
  { home: "Ecuador", away: "Curaçao", kickoffUtc: "2026-06-21T00:00:00Z" },
  { home: "Tunisia", away: "Japani", kickoffUtc: "2026-06-21T04:00:00Z" },
  { home: "Espanja", away: "Saudi-Arabia", kickoffUtc: "2026-06-21T16:00:00Z" },
  { home: "Belgia", away: "Iran", kickoffUtc: "2026-06-21T19:00:00Z" },
  { home: "Uruguay", away: "Kap Verde", kickoffUtc: "2026-06-21T22:00:00Z" },
  { home: "Uusi-Seelanti", away: "Egypti", kickoffUtc: "2026-06-22T01:00:00Z" },
  { home: "Argentiina", away: "Itävalta", kickoffUtc: "2026-06-22T17:00:00Z" },
  { home: "Ranska", away: "Irak", kickoffUtc: "2026-06-22T21:00:00Z" },
  { home: "Norja", away: "Senegal", kickoffUtc: "2026-06-23T00:00:00Z" },
  { home: "Jordania", away: "Algeria", kickoffUtc: "2026-06-23T03:00:00Z" },
  { home: "Portugali", away: "Uzbekistan", kickoffUtc: "2026-06-23T17:00:00Z" },
  { home: "Englanti", away: "Ghana", kickoffUtc: "2026-06-23T20:00:00Z" },
  { home: "Panama", away: "Kroatia", kickoffUtc: "2026-06-23T23:00:00Z" },
  { home: "Kolumbia", away: "Kongon demokraattinen tasavalta", kickoffUtc: "2026-06-24T02:00:00Z" },
  { home: "Sveitsi", away: "Kanada", kickoffUtc: "2026-06-24T19:00:00Z" },
  { home: "Bosnia-Hertsegovina", away: "Qatar", kickoffUtc: "2026-06-24T19:00:00Z" },
  { home: "Skotlanti", away: "Brasilia", kickoffUtc: "2026-06-24T22:00:00Z" },
  { home: "Marokko", away: "Haiti", kickoffUtc: "2026-06-24T22:00:00Z" },
  { home: "Tshekki", away: "Meksiko", kickoffUtc: "2026-06-25T01:00:00Z" },
  { home: "Etelä-Afrikka", away: "Etelä-Korea", kickoffUtc: "2026-06-25T01:00:00Z" },
  { home: "Ecuador", away: "Saksa", kickoffUtc: "2026-06-25T20:00:00Z" },
  { home: "Curaçao", away: "Norsunluurannikko", kickoffUtc: "2026-06-25T20:00:00Z" },
  { home: "Japani", away: "Ruotsi", kickoffUtc: "2026-06-25T23:00:00Z" },
  { home: "Tunisia", away: "Hollanti", kickoffUtc: "2026-06-25T23:00:00Z" },
  { home: "Turkki", away: "Yhdysvallat", kickoffUtc: "2026-06-26T02:00:00Z" },
  { home: "Paraguay", away: "Australia", kickoffUtc: "2026-06-26T02:00:00Z" },
  { home: "Norja", away: "Ranska", kickoffUtc: "2026-06-26T19:00:00Z" },
  { home: "Senegal", away: "Irak", kickoffUtc: "2026-06-26T19:00:00Z" },
  { home: "Kap Verde", away: "Saudi-Arabia", kickoffUtc: "2026-06-27T00:00:00Z" },
  { home: "Uruguay", away: "Espanja", kickoffUtc: "2026-06-27T00:00:00Z" },
  { home: "Egypti", away: "Iran", kickoffUtc: "2026-06-27T03:00:00Z" },
  { home: "Uusi-Seelanti", away: "Belgia", kickoffUtc: "2026-06-27T03:00:00Z" },
  { home: "Kroatia", away: "Ghana", kickoffUtc: "2026-06-27T21:00:00Z" },
  { home: "Panama", away: "Englanti", kickoffUtc: "2026-06-27T21:00:00Z" },
  { home: "Kolumbia", away: "Portugali", kickoffUtc: "2026-06-27T23:30:00Z" },
  { home: "Kongon demokraattinen tasavalta", away: "Uzbekistan", kickoffUtc: "2026-06-27T23:30:00Z" },
  { home: "Algeria", away: "Itävalta", kickoffUtc: "2026-06-28T02:00:00Z" },
  { home: "Jordania", away: "Argentiina", kickoffUtc: "2026-06-28T02:00:00Z" },
];

const R32_KICKOFFS = [
  "2026-06-28T19:00:00Z",
  "2026-06-29T17:00:00Z",
  "2026-06-29T20:30:00Z",
  "2026-06-30T01:00:00Z",
  "2026-06-30T17:00:00Z",
  "2026-06-30T21:00:00Z",
  "2026-07-01T01:00:00Z",
  "2026-07-01T16:00:00Z",
  "2026-07-01T20:00:00Z",
  "2026-07-02T00:00:00Z",
  "2026-07-02T19:00:00Z",
  "2026-07-02T23:00:00Z",
  "2026-07-03T03:00:00Z",
  "2026-07-03T18:00:00Z",
  "2026-07-03T22:00:00Z",
  "2026-07-04T01:30:00Z",
];

const R16_KICKOFFS = [
  "2026-07-04T17:00:00Z",
  "2026-07-04T21:00:00Z",
  "2026-07-05T20:00:00Z",
  "2026-07-06T00:00:00Z",
  "2026-07-06T19:00:00Z",
  "2026-07-07T00:00:00Z",
  "2026-07-07T16:00:00Z",
  "2026-07-07T20:00:00Z",
];

const QF_KICKOFFS = [
  "2026-07-09T20:00:00Z",
  "2026-07-10T19:00:00Z",
  "2026-07-11T21:00:00Z",
  "2026-07-12T01:00:00Z",
];

const SF_KICKOFFS = [
  "2026-07-14T19:00:00Z",
  "2026-07-15T19:00:00Z",
];

function generateKoMatches(startNumber: number) {
  const koMatches: (typeof matches.$inferInsert)[] = [];
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

  const groups = "ABCDEFGHIJKL".split("");
  const groupPositions: Record<string, string> = {};
  for (const g of groups) {
    groupPositions["1" + g] = "Lohko " + g + " voittaja";
    groupPositions["2" + g] = "Lohko " + g + " toinen";
    groupPositions["3" + g] = "Lohko " + g + " kolmas";
  }

  for (let i = 0; i < r32Pairings.length; i++) {
    const [home, away] = r32Pairings[i];
    koMatches.push({
      homeLabel: groupPositions[home] || home,
      awayLabel: groupPositions[away] || away,
      stage: "r32",
      kickoffUtc: new Date(R32_KICKOFFS[i]),
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

  for (let i = 0; i < r16Pairings.length; i++) {
    const [home, away] = r16Pairings[i];
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "r16",
      kickoffUtc: new Date(R16_KICKOFFS[i]),
      matchNumber: matchNumber++,
    });
  }

  const qfPairings: [string, string][] = [
    ["NV1 voittaja", "NV2 voittaja"],
    ["NV3 voittaja", "NV4 voittaja"],
    ["NV5 voittaja", "NV6 voittaja"],
    ["NV7 voittaja", "NV8 voittaja"],
  ];

  for (let i = 0; i < qfPairings.length; i++) {
    const [home, away] = qfPairings[i];
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "qf",
      kickoffUtc: new Date(QF_KICKOFFS[i]),
      matchNumber: matchNumber++,
    });
  }

  const sfPairings: [string, string][] = [
    ["PV1 voittaja", "PV2 voittaja"],
    ["PV3 voittaja", "PV4 voittaja"],
  ];

  for (let i = 0; i < sfPairings.length; i++) {
    const [home, away] = sfPairings[i];
    koMatches.push({
      homeLabel: home,
      awayLabel: away,
      stage: "sf",
      kickoffUtc: new Date(SF_KICKOFFS[i]),
      matchNumber: matchNumber++,
    });
  }

  koMatches.push({
    homeLabel: "Pronssiottelu: V1 häviäjä",
    awayLabel: "Pronssiottelu: V2 häviäjä",
    stage: "third",
    kickoffUtc: new Date("2026-07-18T21:00:00Z"),
    matchNumber: matchNumber++,
  });

  koMatches.push({
    homeLabel: "V1 voittaja",
    awayLabel: "V2 voittaja",
    stage: "final",
    kickoffUtc: new Date("2026-07-19T19:00:00Z"),
    matchNumber: matchNumber++,
  });

  return koMatches;
}

async function seed() {
  console.log("Seeding database...");

  console.log("Truncating data...");
  await db.delete(predictions);
  await db.delete(matches);
  await db.delete(users);
  await db.delete(teams);
  console.log("Data cleared");

  console.log("Inserting teams...");
  const teamValues = WC2026_TEAMS.map((t) => ({
    name: t.name,
    flagEmoji: t.flag,
    groupLetter: t.group,
  }));

  const insertedTeams: { id: number; name: string }[] = [];
  for (let i = 0; i < teamValues.length; i += 10) {
    const batch = await db
      .insert(teams)
      .values(teamValues.slice(i, i + 10))
      .returning();
    insertedTeams.push(...batch);
  }

  const teamIds: Record<string, number> = {};
  for (const t of insertedTeams) {
    teamIds[t.name] = t.id;
  }
  console.log(`Inserted ${insertedTeams.length} teams`);

  const teamFlagByName: Record<string, string> = {};
  for (const t of WC2026_TEAMS) {
    teamFlagByName[t.name] = t.flag;
  }

  console.log("Inserting group stage matches...");
  const groupMatchValues = GROUP_MATCHES.map((m, i) => ({
    matchNumber: i + 1,
    homeTeamId: teamIds[m.home],
    awayTeamId: teamIds[m.away],
    homeLabel: teamFlagByName[m.home] + " " + m.home,
    awayLabel: teamFlagByName[m.away] + " " + m.away,
    stage: "group" as const,
    kickoffUtc: new Date(m.kickoffUtc),
  }));

  for (let i = 0; i < groupMatchValues.length; i += 10) {
    await db.insert(matches).values(groupMatchValues.slice(i, i + 10));
  }
  console.log(`Inserted ${groupMatchValues.length} group stage matches`);

  console.log("Generating knockout stage matches...");
  const koMatches = generateKoMatches(groupMatchValues.length + 1);
  for (let i = 0; i < koMatches.length; i += 10) {
    await db.insert(matches).values(koMatches.slice(i, i + 10));
  }
  console.log(`Inserted ${koMatches.length} knockout stage matches`);

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
