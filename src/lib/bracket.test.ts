import { describe, it, expect } from "vitest";
import {
  BracketSlot,
  MatchWithResult,
  StoredMatch,
  TieResolver,
  createResolver,
  wc26TieResolver,
} from "@/lib/bracket";

const TEAMS = {
  england: { id: "eng", name: "England", group: "A" },
  france: { id: "fra", name: "France", group: "A" },
  germany: { id: "ger", name: "Germany", group: "A" },
  holland: { id: "ned", name: "Netherlands", group: "A" },
  brazil: { id: "bra", name: "Brazil", group: "B" },
  spain: { id: "spa", name: "Spain", group: "B" },
  italy: { id: "ita", name: "Italy", group: "B" },
  portugal: { id: "por", name: "Portugal", group: "B" },
};

const kickoffUtc = new Date("2026-07-01T11:00:00Z");

const TEAM_GROUPS = new Map<string, string>(
  Object.values(TEAMS).map((t) => [t.id, t.group]),
);

const CONFIG: BracketSlot[] = [
  {
    matchId: 13,
    source: "group",
    home: { group: "A", rank: 1, type: "known" },
    away: { group: "B", rank: 4, type: "known" },
  },
  {
    matchId: 14,
    source: "group",
    home: { group: "B", rank: 2, type: "known" },
    away: { group: "A", rank: 3, type: "known" },
  },
  {
    matchId: 15,
    source: "group",
    home: { group: "B", rank: 1, type: "known" },
    away: { group: "A", rank: 4, type: "known" },
  },
  {
    matchId: 16,
    source: "group",
    home: { group: "A", rank: 2, type: "known" },
    away: { group: "B", rank: 3, type: "known" },
  },
  {
    matchId: 17,
    source: "knockout",
    teamToPick: "winner",
    home: 13,
    away: 14,
  },
  {
    matchId: 18,
    source: "knockout",
    teamToPick: "winner",
    home: 15,
    away: 16,
  },
  {
    matchId: 19,
    source: "knockout",
    teamToPick: "loser",
    home: 17,
    away: 18,
  },
  {
    matchId: 20,
    source: "knockout",
    teamToPick: "winner",
    home: 17,
    away: 18,
  },
];

const simpleTieResolver: TieResolver = (cluster) =>
  cluster.length === 1 ? cluster : cluster.map(() => null);

function groupMatch(
  id: number,
  home: string,
  away: string,
  result: "1" | "X" | "2" | null,
): StoredMatch {
  return {
    id,
    stage: "group",
    kickoffUtc,
    homeTeamId: home,
    awayTeamId: away,
    result,
  };
}

function koMatch(
  id: number,
  home: string,
  away: string,
  result: "1" | "X" | "2",
): MatchWithResult {
  return {
    id,
    stage: "sf",
    kickoffUtc,
    homeTeamId: home,
    awayTeamId: away,
    result,
  };
}

describe("bracket resolution", () => {
  const resolveBrackets = createResolver({
    slots: CONFIG,
    resolveTies: simpleTieResolver,
  });

  it("skips updates on draws after group stage", () => {
    const updates = resolveBrackets(koMatch(17, "eng", "fra", "X"), []);

    expect(updates).toEqual([]);
  });

  it("produces no updates on match that feeds onto no other match", () => {
    const updates = resolveBrackets(koMatch(20, "eng", "fra", "X"), []);

    expect(updates).toEqual([]);
  });

  it("produces one update when match feeds onto a single match", () => {
    const updates = resolveBrackets(koMatch(13, "eng", "fra", "2"), []);

    expect(updates).toEqual([{ matchId: 17, side: "home", teamId: "fra" }]);
  });

  it("produces multiple updates when match feeds onto multiple matches", () => {
    const updates = resolveBrackets(koMatch(17, "eng", "fra", "2"), []);

    expect(updates).toEqual([
      { matchId: 19, side: "home", teamId: "eng" },
      { matchId: 20, side: "home", teamId: "fra" },
    ]);
  });

  it("generates group stage updates onto multiple matches", () => {
    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "1"),
      groupMatch(2, "ger", "ned", "1"),
      groupMatch(3, "eng", "ger", "1"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", "1"),
    ];

    const updates = resolveBrackets(
      { ...koMatch(6, "fra", "ger", "1"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([
      { matchId: 13, side: "home", teamId: "eng" },
      { matchId: 14, side: "away", teamId: "ger" },
      { matchId: 15, side: "away", teamId: "ned" },
      { matchId: 16, side: "home", teamId: "fra" },
    ]);
  });

  it("generates updates even when other source is unknown", () => {
    const configWithMixedSource: BracketSlot[] = [
      {
        matchId: 13,
        source: "group",
        home: { group: "A", rank: 1, type: "known" },
        away: { type: "unknown" },
      },
    ];

    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "1"),
      groupMatch(2, "ger", "ned", "1"),
      groupMatch(3, "eng", "ger", "1"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", "1"),
    ];

    const resolve = createResolver({
      slots: configWithMixedSource,
      resolveTies: simpleTieResolver,
    });

    const updates = resolve(
      { ...koMatch(6, "fra", "ger", "1"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([{ matchId: 13, side: "home", teamId: "eng" }]);
  });

  it("does not generate updates when source is unknown", () => {
    const configWithMixedSource: BracketSlot[] = [
      {
        matchId: 13,
        source: "group",
        home: { type: "unknown" },
        away: { type: "known", rank: 1, group: "B" },
      },
    ];

    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "1"),
      groupMatch(2, "ger", "ned", "1"),
      groupMatch(3, "eng", "ger", "1"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", "1"),
    ];

    const resolve = createResolver({
      slots: configWithMixedSource,
      resolveTies: simpleTieResolver,
    });

    const updates = resolve(
      { ...koMatch(6, "fra", "ger", "1"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([]);
  });

  it("generates no updates when the group is in progress", () => {
    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "1"),
      groupMatch(2, "ger", "ned", "1"),
      groupMatch(3, "eng", "ger", "1"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", null),
    ];

    const updates = resolveBrackets(
      { ...koMatch(6, "fra", "ger", "X"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([]);
  });
});

describe("wc26 tie resolver", () => {
  const resolveBrackets = createResolver({
    slots: CONFIG,
    resolveTies: wc26TieResolver,
  });

  it("resolves a two-team tie via head-to-head winner", () => {
    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "1"),
      groupMatch(2, "ger", "ned", "X"),
      groupMatch(3, "eng", "ger", "2"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", "1"),
    ];

    const updates = resolveBrackets(
      { ...koMatch(6, "fra", "ger", "1"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([
      { matchId: 13, side: "home", teamId: "eng" },
      { matchId: 14, side: "away", teamId: "ger" },
      { matchId: 15, side: "away", teamId: "ned" },
      { matchId: 16, side: "home", teamId: "fra" },
    ]);
  });

  it("skips tied ranks when head-to-head is a draw", () => {
    const groupMatches: StoredMatch[] = [
      groupMatch(1, "eng", "fra", "X"),
      groupMatch(2, "ger", "ned", "2"),
      groupMatch(3, "eng", "ger", "1"),
      groupMatch(4, "fra", "ned", "1"),
      groupMatch(5, "eng", "ned", "1"),
      groupMatch(6, "fra", "ger", "1"),
    ];

    const updates = resolveBrackets(
      { ...koMatch(6, "fra", "ger", "1"), stage: "group" },
      groupMatches,
      TEAM_GROUPS,
    );

    expect(updates).toEqual([
      { matchId: 14, side: "away", teamId: "ned" },
      { matchId: 15, side: "away", teamId: "ger" },
    ]);
  });
});
