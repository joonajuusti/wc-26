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

const WC2026_TEAMS: { id: string; name: string; flag: string; group: string }[] = [
  { id: "MEX", name: "Meksiko", flag: flagEmoji("MX"), group: "A" },
  { id: "RSA", name: "Etelä-Afrikka", flag: flagEmoji("ZA"), group: "A" },
  { id: "KOR", name: "Etelä-Korea", flag: flagEmoji("KR"), group: "A" },
  { id: "CZE", name: "Tshekki", flag: flagEmoji("CZ"), group: "A" },
  { id: "CAN", name: "Kanada", flag: flagEmoji("CA"), group: "B" },
  { id: "BIH", name: "Bosnia-Hertsegovina", flag: flagEmoji("BA"), group: "B" },
  { id: "QAT", name: "Qatar", flag: flagEmoji("QA"), group: "B" },
  { id: "SUI", name: "Sveitsi", flag: flagEmoji("CH"), group: "B" },
  { id: "BRA", name: "Brasilia", flag: flagEmoji("BR"), group: "C" },
  { id: "MAR", name: "Marokko", flag: flagEmoji("MA"), group: "C" },
  { id: "HAI", name: "Haiti", flag: flagEmoji("HT"), group: "C" },
  { id: "SCO", name: "Skotlanti", flag: SCOTLAND_FLAG, group: "C" },
  { id: "USA", name: "Yhdysvallat", flag: flagEmoji("US"), group: "D" },
  { id: "PAR", name: "Paraguay", flag: flagEmoji("PY"), group: "D" },
  { id: "AUS", name: "Australia", flag: flagEmoji("AU"), group: "D" },
  { id: "TUR", name: "Turkki", flag: flagEmoji("TR"), group: "D" },
  { id: "GER", name: "Saksa", flag: flagEmoji("DE"), group: "E" },
  { id: "CUW", name: "Curaçao", flag: flagEmoji("CW"), group: "E" },
  { id: "CIV", name: "Norsunluurannikko", flag: flagEmoji("CI"), group: "E" },
  { id: "ECU", name: "Ecuador", flag: flagEmoji("EC"), group: "E" },
  { id: "NED", name: "Hollanti", flag: flagEmoji("NL"), group: "F" },
  { id: "JPN", name: "Japani", flag: flagEmoji("JP"), group: "F" },
  { id: "SWE", name: "Ruotsi", flag: flagEmoji("SE"), group: "F" },
  { id: "TUN", name: "Tunisia", flag: flagEmoji("TN"), group: "F" },
  { id: "BEL", name: "Belgia", flag: flagEmoji("BE"), group: "G" },
  { id: "EGY", name: "Egypti", flag: flagEmoji("EG"), group: "G" },
  { id: "IRN", name: "Iran", flag: flagEmoji("IR"), group: "G" },
  { id: "NZL", name: "Uusi-Seelanti", flag: flagEmoji("NZ"), group: "G" },
  { id: "ESP", name: "Espanja", flag: flagEmoji("ES"), group: "H" },
  { id: "CPV", name: "Kap Verde", flag: flagEmoji("CV"), group: "H" },
  { id: "KSA", name: "Saudi-Arabia", flag: flagEmoji("SA"), group: "H" },
  { id: "URU", name: "Uruguay", flag: flagEmoji("UY"), group: "H" },
  { id: "FRA", name: "Ranska", flag: flagEmoji("FR"), group: "I" },
  { id: "SEN", name: "Senegal", flag: flagEmoji("SN"), group: "I" },
  { id: "IRQ", name: "Irak", flag: flagEmoji("IQ"), group: "I" },
  { id: "NOR", name: "Norja", flag: flagEmoji("NO"), group: "I" },
  { id: "ARG", name: "Argentiina", flag: flagEmoji("AR"), group: "J" },
  { id: "ALG", name: "Algeria", flag: flagEmoji("DZ"), group: "J" },
  { id: "AUT", name: "Itävalta", flag: flagEmoji("AT"), group: "J" },
  { id: "JOR", name: "Jordania", flag: flagEmoji("JO"), group: "J" },
  { id: "POR", name: "Portugali", flag: flagEmoji("PT"), group: "K" },
  {
    id: "COD",
    name: "Kongon demokraattinen tasavalta",
    flag: flagEmoji("CD"),
    group: "K",
  },
  { id: "UZB", name: "Uzbekistan", flag: flagEmoji("UZ"), group: "K" },
  { id: "COL", name: "Kolumbia", flag: flagEmoji("CO"), group: "K" },
  { id: "ENG", name: "Englanti", flag: ENGLAND_FLAG, group: "L" },
  { id: "CRO", name: "Kroatia", flag: flagEmoji("HR"), group: "L" },
  { id: "GHA", name: "Ghana", flag: flagEmoji("GH"), group: "L" },
  { id: "PAN", name: "Panama", flag: flagEmoji("PA"), group: "L" },
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

function generateKoMatches(startId: number) {
  const koMatches: (typeof matches.$inferInsert)[] = [];
  let id = startId;

  for (const k of R32_KICKOFFS) {
    koMatches.push({ id: id++, stage: "r32", kickoffUtc: new Date(k) });
  }
  for (const k of R16_KICKOFFS) {
    koMatches.push({ id: id++, stage: "r16", kickoffUtc: new Date(k) });
  }
  for (const k of QF_KICKOFFS) {
    koMatches.push({ id: id++, stage: "qf", kickoffUtc: new Date(k) });
  }
  for (const k of SF_KICKOFFS) {
    koMatches.push({ id: id++, stage: "sf", kickoffUtc: new Date(k) });
  }
  koMatches.push({
    id: id++,
    stage: "third",
    kickoffUtc: new Date("2026-07-18T21:00:00Z"),
  });
  koMatches.push({
    id: id++,
    stage: "final",
    kickoffUtc: new Date("2026-07-19T19:00:00Z"),
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
    id: t.id,
    name: t.name,
    flagEmoji: t.flag,
    groupLetter: t.group,
  }));

  const teamIdByName: Record<string, string> = {};
  for (const t of WC2026_TEAMS) {
    teamIdByName[t.name] = t.id;
  }

  for (let i = 0; i < teamValues.length; i += 10) {
    await db.insert(teams).values(teamValues.slice(i, i + 10));
  }
  console.log(`Inserted ${teamValues.length} teams`);

  console.log("Inserting group stage matches...");
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
  console.log(`Inserted ${groupMatchValues.length} group stage matches`);

  console.log("Generating knockout stage matches...");
  const koMatches = generateKoMatches(groupMatchValues.length + 1);
  for (let i = 0; i < koMatches.length; i += 10) {
    await db.insert(matches).values(koMatches.slice(i, i + 10));
  }
  console.log(`Inserted ${koMatches.length} knockout stage matches`);

  console.log("Creating admin user...");
  await db.insert(users).values({
    name: "Joona",
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
