import type { LockedPrediction } from "@/lib/queries";

const KO_STAGES = new Set(["r32", "r16", "qf", "sf", "third", "final"]);

export type ResolvedMatch = {
  matchId: number;
  stage: string;
  result: string;
  homeCode: string;
  awayCode: string;
  kickoffUtc: Date;
  picks: Map<number, string>;
};

export type WrappedStats = {
  playerCount: number;
  rank: number;
  points: number;
  accuracy: { correct: number; total: number; pct: number };
  groupStageMatchCount: number;
  pickDistribution: Record<string, number>;
  resultDistribution: Record<string, number>;
  oneGuessStrat: {
    potentialRank: number;
    pick: string;
    correctCount: number;
  } | null;
  draws: {
    yourCorrect: number;
    tournamentCount: number;
    pct: number;
    leader: { name: string; count: number } | null;
  };
  decisive: {
    yourCorrect: number;
    tournamentCount: number;
    pct: number;
    leader: { name: string; count: number } | null;
  };
  unanimous: { count: number; correct: number };
  nobodyCorrect: {
    matches: { homeCode: string; awayCode: string; result: string }[];
  };
  loneWolf: {
    leader: { name: string; count: number } | null;
    correctMatches: { homeCode: string; awayCode: string; result: string }[];
  };
  twin: { name: string; agreement: number } | null;
  nemesis: { name: string; agreement: number } | null;
  rankTrajectory: {
    history: number[];
    peak: number;
    lowest: number;
    peakMatchIndex: number;
    peakMatch: { homeCode: string; awayCode: string } | null;
    label: "climber" | "faller" | "steady" | "rollercoaster";
  };
  clutch: {
    groupAccuracy: number;
    koAccuracy: number;
    label: "clutch" | "choker" | "neutral";
  };
};

function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

function rankMap(
  pointsByUser: Map<number, number>,
  users: { id: number }[],
): Map<number, number> {
  const sorted = users
    .map((u) => ({ id: u.id, points: pointsByUser.get(u.id) ?? 0 }))
    .sort((a, b) => b.points - a.points);
  const ranks = new Map<number, number>();
  let currentRank = 0;
  let prevPoints: number | null = null;
  let position = 0;
  for (const u of sorted) {
    position++;
    if (prevPoints === null || u.points !== prevPoints) {
      currentRank = position;
    }
    ranks.set(u.id, currentRank);
    prevPoints = u.points;
  }
  return ranks;
}

function correctLeader(
  matches: ResolvedMatch[],
  users: { id: number; name: string }[],
): { name: string; count: number } | null {
  let best = { name: "", count: 0 };
  for (const u of users) {
    const count = matches.filter((m) => m.picks.get(u.id) === m.result).length;
    if (count > best.count) best = { name: u.name, count };
  }
  return best.count === 0 ? null : best;
}

export function buildResolvedMatches(
  matches: {
    id: number;
    stage: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
  teams: { id: string }[],
  lockedByMatch: Map<number, LockedPrediction[]>,
): ResolvedMatch[] {
  const teamSet = new Set(teams.map((t) => t.id));
  const code = (id: string | null) => (id && teamSet.has(id) ? id : "?");
  const matchMeta = new Map(matches.map((m) => [m.id, m]));

  const resolved: ResolvedMatch[] = [];
  for (const [matchId, preds] of lockedByMatch) {
    const result = preds[0]?.result;
    if (!result) continue;
    const meta = matchMeta.get(matchId);
    const picks = new Map<number, string>();
    for (const p of preds) picks.set(p.userId, p.pick);
    resolved.push({
      matchId,
      stage: meta?.stage ?? "group",
      result,
      homeCode: code(meta?.homeTeamId ?? null),
      awayCode: code(meta?.awayTeamId ?? null),
      kickoffUtc: preds[0].kickoffUtc,
      picks,
    });
  }
  return resolved.sort(
    (a, b) => a.kickoffUtc.getTime() - b.kickoffUtc.getTime(),
  );
}

function toOneGuessStrat(
  pick: string,
  correctCount: number,
  ranksById: Map<number, number>,
  pointsById: Map<number, number>,
) {
  const sortedPoints = pointsById
    .entries()
    .toArray()
    .sort((a, b) => a[1] - b[1]);

  let potentialRank = pointsById.entries.length;

  for (const entry of sortedPoints) {
    if (correctCount > entry[1]) {
      potentialRank = ranksById.get(entry[0]) ?? potentialRank;
    }
  }

  return {
    pick,
    correctCount,
    potentialRank,
  };
}

export function computeWrappedStats(
  resolved: ResolvedMatch[],
  users: { id: number; name: string }[],
  targetUserId: number,
): WrappedStats {
  const finalPoints = new Map<number, number>();
  for (const m of resolved) {
    for (const [uid, pick] of m.picks) {
      if (pick === m.result)
        finalPoints.set(uid, (finalPoints.get(uid) ?? 0) + 1);
    }
  }
  const finalRanks = rankMap(finalPoints, users);
  const points = finalPoints.get(targetUserId) ?? 0;
  const rank = finalRanks.get(targetUserId) ?? users.length;

  const targetPicks = resolved.filter((m) => m.picks.has(targetUserId));
  const targetCorrect = targetPicks.filter(
    (m) => m.picks.get(targetUserId) === m.result,
  );
  const accuracy = {
    correct: targetCorrect.length,
    total: targetPicks.length,
    pct: pct(targetCorrect.length, targetPicks.length),
  };

  const drawMatches = resolved.filter((m) => m.result === "X");
  const targetCorrectDraws = drawMatches.filter(
    (m) => m.picks.get(targetUserId) === "X",
  ).length;
  const draws = {
    yourCorrect: targetCorrectDraws,
    tournamentCount: drawMatches.length,
    pct: pct(targetCorrectDraws, drawMatches.length),
    leader: correctLeader(drawMatches, users),
  };

  const decisiveMatches = resolved.filter((m) => m.result !== "X");
  const targetCorrectDecisive = decisiveMatches.filter(
    (m) => m.picks.get(targetUserId) === m.result,
  ).length;
  const decisive = {
    yourCorrect: targetCorrectDecisive,
    tournamentCount: decisiveMatches.length,
    pct: pct(targetCorrectDecisive, decisiveMatches.length),
    leader: correctLeader(decisiveMatches, users),
  };

  const unanimousMatches = resolved.filter((m) => {
    const distinct = new Set(m.picks.values());
    return distinct.size === 1;
  });
  const unanimousCorrect = unanimousMatches.filter((m) => {
    const thePick = m.picks.values().next().value;
    return thePick === m.result;
  }).length;

  const nobodyCorrectMatches = resolved.filter(
    (m) => ![...m.picks.values()].some((pick) => pick === m.result),
  );

  const allLoneWolfMatches = resolved.filter((m) => {
    const correct = [...m.picks.entries()].filter(
      ([, pick]) => pick === m.result,
    );
    return correct.length === 1 && correct[0][0] === targetUserId;
  });

  const loneWolfMatches = allLoneWolfMatches.filter((m) => {
    return m.picks.get(targetUserId) === m.result;
  });

  const loneWolfLeader = (() => {
    let best = { name: "", count: 0 };
    for (const u of users) {
      const count = resolved.filter((m) => {
        const correct = [...m.picks.entries()].filter(
          ([, pick]) => pick === m.result,
        );
        return correct.length === 1 && correct[0][0] === u.id;
      }).length;
      if (count > best.count) best = { name: u.name, count };
    }
    return best.count === 0 ? null : best;
  })();

  const others = users.filter((u) => u.id !== targetUserId);
  let twin: { name: string; agreement: number } | null = null;
  let nemesis: { name: string; agreement: number } | null = null;
  for (const o of others) {
    const common = resolved.filter(
      (m) => m.picks.has(targetUserId) && m.picks.has(o.id),
    );
    if (common.length === 0) continue;
    const same = common.filter(
      (m) => m.picks.get(targetUserId) === m.picks.get(o.id),
    ).length;
    const agreement = Math.round((same / common.length) * 100);
    if (!twin || agreement > twin.agreement) twin = { name: o.name, agreement };
    if (!nemesis || agreement < nemesis.agreement)
      nemesis = { name: o.name, agreement };
  }

  const chronological = [...resolved].sort(
    (a, b) => a.kickoffUtc.getTime() - b.kickoffUtc.getTime(),
  );
  const runningPoints = new Map<number, number>();
  let peak: number | null = null;
  let lowest: number | null = null;
  let peakMatchIndex = 0;
  let peakMatch: { homeCode: string; awayCode: string } | null = null;
  const history: number[] = [];
  for (const m of chronological) {
    for (const [uid, pick] of m.picks) {
      if (pick === m.result)
        runningPoints.set(uid, (runningPoints.get(uid) ?? 0) + 1);
    }
    const r = rankMap(runningPoints, users).get(targetUserId);
    if (r !== undefined) {
      history.push(r);
      if (peak === null || r < peak) {
        peak = r;
        peakMatchIndex = history.length - 1;
        peakMatch = { homeCode: m.homeCode, awayCode: m.awayCode };
      }
      if (lowest === null || r > lowest) lowest = r;
    }
  }

  let trajectoryLabel: "climber" | "faller" | "steady" | "rollercoaster" =
    "steady";
  if (history.length >= 6) {
    const third = Math.floor(history.length / 3);
    const firstAvg = history.slice(0, third).reduce((a, b) => a + b, 0) / third;
    const lastAvg = history.slice(-third).reduce((a, b) => a + b, 0) / third;
    const swing = (peak ?? rank) - (lowest ?? rank);
    if (swing >= 4) trajectoryLabel = "rollercoaster";
    else if (lastAvg < firstAvg - 1) trajectoryLabel = "climber";
    else if (lastAvg > firstAvg + 1) trajectoryLabel = "faller";
  }

  const groupMatches = resolved.filter((m) => !KO_STAGES.has(m.stage));
  const koMatches = resolved.filter((m) => KO_STAGES.has(m.stage));
  const targetGroupPicks = groupMatches.filter((m) =>
    m.picks.has(targetUserId),
  );
  const targetKoPicks = koMatches.filter((m) => m.picks.has(targetUserId));
  const groupCorrect = targetGroupPicks.filter(
    (m) => m.picks.get(targetUserId) === m.result,
  ).length;
  const koCorrect = targetKoPicks.filter(
    (m) => m.picks.get(targetUserId) === m.result,
  ).length;
  const groupAccuracy = pct(groupCorrect, targetGroupPicks.length);
  const koAccuracy = pct(koCorrect, targetKoPicks.length);
  let clutchLabel: "clutch" | "choker" | "neutral" = "neutral";
  if (koAccuracy - groupAccuracy >= 10) clutchLabel = "clutch";
  else if (koAccuracy - groupAccuracy <= -10) clutchLabel = "choker";

  const pickDistribution: Record<string, number> = { "1": 0, X: 0, "2": 0 };
  const resultDistribution: Record<string, number> = { "1": 0, X: 0, "2": 0 };

  resolved.forEach((m) => {
    resultDistribution[m.result]++;

    const pick = m.picks.get(targetUserId);

    if (!pick) {
      return;
    }

    pickDistribution[pick]++;
  });

  const optimalStrat =
    Object.entries(resultDistribution)
      .sort((a, b) => b[1] - a[1])
      .find(([, totalResultCount]) => totalResultCount > points) ?? null;

  return {
    playerCount: users.length,
    groupStageMatchCount: groupMatches.length,
    rank,
    points,
    accuracy,
    draws,
    decisive,
    unanimous: { count: unanimousMatches.length, correct: unanimousCorrect },
    nobodyCorrect: {
      matches: nobodyCorrectMatches.map((m) => ({
        homeCode: m.homeCode,
        awayCode: m.awayCode,
        result: m.result,
      })),
    },
    loneWolf: { correctMatches: loneWolfMatches, leader: loneWolfLeader },
    twin,
    nemesis,
    rankTrajectory: {
      history,
      peak: peak ?? rank,
      lowest: lowest ?? rank,
      peakMatchIndex,
      peakMatch,
      label: trajectoryLabel,
    },
    clutch: {
      groupAccuracy,
      koAccuracy,
      label: clutchLabel,
    },
    pickDistribution,
    resultDistribution,
    oneGuessStrat: optimalStrat
      ? toOneGuessStrat(...optimalStrat, finalRanks, finalPoints)
      : null,
  };
}
