import type { matches } from "@/lib/db/schema";

type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";

export type Side = "home" | "away";
export type Outcome = "winner" | "loser";

export type KnownGroupPosition = {
  type: "known";
  group: string;
  rank: number;
};

type UnknownGroupPosition = {
  type: "unknown";
};

type GroupPosition = KnownGroupPosition | UnknownGroupPosition;

export type GroupSource = {
  matchId: number;
  source: "group";
  home: GroupPosition;
  away: GroupPosition;
};

export type KnockoutSource = {
  matchId: number;
  source: "knockout";
  teamToPick: "winner" | "loser";
  home: number;
  away: number;
};

export type UnknownSource = {
  matchId: number;
  source: "unknown";
};

export type BracketSlot = GroupSource | KnockoutSource | UnknownSource;

export type MatchWithResult = {
  id: number;
  homeTeamId: string;
  awayTeamId: string;
  stage: Stage;
  kickoffUtc: Date;
  result: "1" | "X" | "2";
};

export type StoredMatch = Pick<
  typeof matches.$inferSelect,
  "id" | "stage" | "kickoffUtc" | "homeTeamId" | "awayTeamId" | "result"
>;

export type BracketUpdate = {
  matchId: number;
  side: Side;
  teamId: string;
};

export type TieResolver = (
  cluster: string[],
  groupMatches: StoredMatch[],
) => (string | null)[];

export type ResolverConfig = {
  slots: BracketSlot[];
  resolveTies: TieResolver;
};

export const WC2026_BRACKET: BracketSlot[] = [
  {
    matchId: 73,
    source: "group",
    home: { group: "A", rank: 2, type: "known" },
    away: { group: "B", rank: 2, type: "known" },
  },
  { matchId: 74, source: "unknown" },
  {
    matchId: 75,
    source: "group",
    home: { group: "F", rank: 1, type: "known" },
    away: { group: "C", rank: 2, type: "known" },
  },
  {
    matchId: 76,
    source: "group",
    home: { group: "C", rank: 1, type: "known" },
    away: { group: "F", rank: 2, type: "known" },
  },
  { matchId: 77, source: "unknown" },
  {
    matchId: 78,
    source: "group",
    home: { group: "E", rank: 2, type: "known" },
    away: { group: "I", rank: 2, type: "known" },
  },
  {
    matchId: 79,
    source: "group",
    home: { group: "A", rank: 1, type: "known" },
    away: { type: "unknown" },
  },
  { matchId: 80, source: "unknown" },
  { matchId: 81, source: "unknown" },
  { matchId: 82, source: "unknown" },
  {
    matchId: 83,
    source: "group",
    home: { group: "K", rank: 2, type: "known" },
    away: { group: "L", rank: 2, type: "known" },
  },
  {
    matchId: 84,
    source: "group",
    home: { group: "H", rank: 1, type: "known" },
    away: { group: "J", rank: 2, type: "known" },
  },
  { matchId: 85, source: "unknown" },
  {
    matchId: 86,
    source: "group",
    home: { group: "J", rank: 1, type: "known" },
    away: { group: "H", rank: 2, type: "known" },
  },
  { matchId: 87, source: "unknown" },
  {
    matchId: 88,
    source: "group",
    home: { group: "D", rank: 2, type: "known" },
    away: { group: "G", rank: 2, type: "known" },
  },
  { matchId: 89, source: "knockout", teamToPick: "winner", home: 75, away: 78 },
  { matchId: 90, source: "knockout", teamToPick: "winner", home: 73, away: 76 },
  { matchId: 91, source: "knockout", teamToPick: "winner", home: 74, away: 77 },
  { matchId: 92, source: "knockout", teamToPick: "winner", home: 79, away: 80 },
  { matchId: 93, source: "knockout", teamToPick: "winner", home: 84, away: 83 },
  { matchId: 94, source: "knockout", teamToPick: "winner", home: 82, away: 81 },
  { matchId: 95, source: "knockout", teamToPick: "winner", home: 87, away: 86 },
  { matchId: 96, source: "knockout", teamToPick: "winner", home: 85, away: 88 },
  { matchId: 97, source: "knockout", teamToPick: "winner", home: 89, away: 90 },
  { matchId: 98, source: "knockout", teamToPick: "winner", home: 93, away: 94 },
  { matchId: 99, source: "knockout", teamToPick: "winner", home: 91, away: 92 },
  {
    matchId: 100,
    source: "knockout",
    teamToPick: "winner",
    home: 95,
    away: 96,
  },
  {
    matchId: 101,
    source: "knockout",
    teamToPick: "winner",
    home: 97,
    away: 98,
  },
  {
    matchId: 102,
    source: "knockout",
    teamToPick: "winner",
    home: 99,
    away: 100,
  },
  {
    matchId: 104,
    source: "knockout",
    teamToPick: "winner",
    home: 101,
    away: 102,
  },
  {
    matchId: 103,
    source: "knockout",
    teamToPick: "loser",
    home: 101,
    away: 102,
  },
];

function matchPoints(result: "1" | "X" | "2" | null): {
  home: number;
  away: number;
} {
  if (result === "1") return { home: 3, away: 0 };
  if (result === "2") return { home: 0, away: 3 };
  if (result === "X") return { home: 1, away: 1 };
  return { home: 0, away: 0 };
}

function resolveCluster(
  cluster: string[],
  groupMatches: StoredMatch[],
): (string | null)[] {
  if (cluster.length === 1) return [cluster[0]];

  const inCluster = (tid: string | null): tid is string =>
    tid !== null && cluster.includes(tid);

  const h2hPoints = new Map<string, number>();
  for (const id of cluster) h2hPoints.set(id, 0);
  for (const m of groupMatches) {
    if (!inCluster(m.homeTeamId) || !inCluster(m.awayTeamId)) continue;
    const { home, away } = matchPoints(m.result);
    h2hPoints.set(m.homeTeamId, h2hPoints.get(m.homeTeamId)! + home);
    h2hPoints.set(m.awayTeamId, h2hPoints.get(m.awayTeamId)! + away);
  }

  const sorted = [...cluster].sort(
    (a, b) => h2hPoints.get(b)! - h2hPoints.get(a)!,
  );

  const out: (string | null)[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      h2hPoints.get(sorted[j]) === h2hPoints.get(sorted[i])
    ) {
      j++;
    }
    const sub = sorted.slice(i, j);
    if (sub.length === sorted.length) {
      out.push(...sub.map(() => null));
    } else {
      out.push(...resolveCluster(sub, groupMatches));
    }
    i = j;
  }
  return out;
}

export const wc26TieResolver: TieResolver = (cluster, groupMatches) =>
  resolveCluster(cluster, groupMatches);

function computeGroupStandings(
  groupMatches: StoredMatch[],
  teamIds: string[],
  resolveTies: TieResolver,
): Map<number, string> {
  const pointsMap = new Map<string, number>();
  for (const id of teamIds) {
    let pts = 0;
    for (const m of groupMatches) {
      if (m.homeTeamId === id) pts += matchPoints(m.result).home;
      else if (m.awayTeamId === id) pts += matchPoints(m.result).away;
    }
    pointsMap.set(id, pts);
  }

  const sorted = [...teamIds].sort(
    (a, b) => pointsMap.get(b)! - pointsMap.get(a)!,
  );

  const standings = new Map<number, string>();
  let rank = 1;
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (
      j < sorted.length &&
      pointsMap.get(sorted[j]) === pointsMap.get(sorted[i])
    ) {
      j++;
    }
    const cluster = sorted.slice(i, j);
    if (cluster.length === 1) {
      standings.set(rank, cluster[0]);
      rank++;
    } else {
      const ordered = resolveTies(cluster, groupMatches);
      for (const t of ordered) {
        if (t !== null) standings.set(rank, t);
        rank++;
      }
    }
    i = j;
  }
  return standings;
}

export const WC2026_CONFIG: ResolverConfig = {
  slots: WC2026_BRACKET,
  resolveTies: wc26TieResolver,
};

function isKnockoutSourced(
  slot: BracketSlot,
  id: number,
): slot is KnockoutSource {
  if (slot.source !== "knockout") return false;
  return slot.home === id || slot.away === id;
}

function resolveBrackets(
  updatedMatch: MatchWithResult,
  matches: StoredMatch[],
  config: ResolverConfig,
  teamGroups: Map<string, string>,
): BracketUpdate[] {
  if (updatedMatch.stage === "group") {
    const group = teamGroups.get(updatedMatch.homeTeamId);
    if (!group) return [];

    const groupTeamIds = [...teamGroups.entries()]
      .filter(([, g]) => g === group)
      .map(([id]) => id);

    const groupMatches = matches.filter(
      (m) =>
        m.stage === "group" &&
        m.homeTeamId !== null &&
        teamGroups.get(m.homeTeamId) === group,
    );

    if (groupMatches.some((m) => m.result === null)) return [];

    const standings = computeGroupStandings(
      groupMatches,
      groupTeamIds,
      config.resolveTies,
    );

    const updates: BracketUpdate[] = [];
    for (const slot of config.slots) {
      if (slot.source !== "group") continue;
      for (const side of ["home", "away"] as Side[]) {
        const pos = slot[side];
        if (pos.type === "unknown" || pos.group !== group) continue;
        const teamId = standings.get(pos.rank);
        if (!teamId) continue;
        updates.push({ matchId: slot.matchId, side, teamId });
      }
    }
    return updates;
  }

  if (updatedMatch.result === "X") return [];

  const slotsToUpdate = config.slots.filter((slot) =>
    isKnockoutSourced(slot, updatedMatch.id),
  );

  return slotsToUpdate.map((slot) => {
    const side = slot.home === updatedMatch.id ? "home" : "away";
    const matchResult =
      updatedMatch.result === "1"
        ? { winner: updatedMatch.homeTeamId, loser: updatedMatch.awayTeamId }
        : { winner: updatedMatch.awayTeamId, loser: updatedMatch.homeTeamId };
    const teamId =
      slot.teamToPick === "winner" ? matchResult.winner : matchResult.loser;
    return { matchId: slot.matchId, teamId, side };
  });
}

export const createResolver =
  (config: ResolverConfig) =>
  (
    updatedMatch: MatchWithResult,
    matches: StoredMatch[],
    teamGroups: Map<string, string> = new Map(),
  ): BracketUpdate[] => {
    return resolveBrackets(updatedMatch, matches, config, teamGroups);
  };

const resolve = createResolver(WC2026_CONFIG);

export function resolveBracketUpdates(
  row: typeof matches.$inferSelect,
  allMatches: StoredMatch[],
  teamGroups: Map<string, string>,
): BracketUpdate[] {
  if (row.stage === "group") {
    if (!row.result || !row.homeTeamId) return [];
  } else {
    if (row.result !== "1" && row.result !== "2") return [];
    if (!row.homeTeamId || !row.awayTeamId) return [];
  }

  const source: MatchWithResult = {
    id: row.id,
    homeTeamId: row.homeTeamId,
    awayTeamId: row.awayTeamId ?? "",
    stage: row.stage,
    kickoffUtc: row.kickoffUtc,
    result: row.result,
  };

  return resolve(source, allMatches, teamGroups);
}
