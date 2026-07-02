import type { LockedPrediction } from "@/lib/queries";

const KO_STAGES = new Set(["r32", "r16", "qf", "sf", "third", "final"]);

export type ResolvedMatch = {
  matchId: number;
  stage: string;
  result: string;
  homeCode: string;
  awayCode: string;
  groupLetter: string | null;
  kickoffUtc: Date;
  picks: Map<number, string>;
};

type MatchRef = { homeCode: string; awayCode: string };

export type WrappedStats = {
  playerCount: number;
  rank: number;
  groupStageMatchCount: number;
  pickDistribution: Record<string, number>;
  accuracy: { correct: number; total: number; pct: number };
  streaks: { longestCorrect: number; longestIncorrect: number };
  bestGroup: {
    letter: string;
    teamIds: string[];
    correct: number;
    total: number;
  } | null;
  oneGuessStrat: {
    potentialRank: number;
    pick: string;
    correctCount: number;
  } | null;
  draws: {
    yourCorrect: number;
    tournamentCount: number;
    pct: number;
    leader: { names: string[]; count: number } | null;
  };
  unanimous: { count: number; correct: number };
  nobodyCorrect: { matches: MatchRef[] };
  loneWolf: {
    leader: { names: string[]; count: number } | null;
    correctMatches: MatchRef[];
  };
  twin: { name: string; agreement: number } | null;
  nemesis: { name: string; agreement: number } | null;
  rankTrajectory: { history: number[] };
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

function leaderFromCounts(
  counts: Map<number, number>,
  users: { id: number; name: string }[],
): { names: string[]; count: number } | null {
  let best = 0;
  for (const c of counts.values()) if (c > best) best = c;
  if (best === 0) return null;
  return {
    count: best,
    names: users.filter((u) => counts.get(u.id) === best).map((u) => u.name),
  };
}

export function buildResolvedMatches(
  matches: {
    id: number;
    stage: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
  teams: { id: string; groupLetter: string | null }[],
  lockedByMatch: Map<number, LockedPrediction[]>,
): ResolvedMatch[] {
  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const matchMeta = new Map(matches.map((m) => [m.id, m]));

  const resolved: ResolvedMatch[] = [];
  for (const [matchId, preds] of lockedByMatch) {
    const result = preds[0]?.result;
    if (!result) continue;
    const meta = matchMeta.get(matchId);
    const stage = meta?.stage ?? "group";
    const home = meta?.homeTeamId ? teamMap.get(meta.homeTeamId) : undefined;
    const away = meta?.awayTeamId ? teamMap.get(meta.awayTeamId) : undefined;
    const picks = new Map<number, string>();
    for (const p of preds) picks.set(p.userId, p.pick);
    resolved.push({
      matchId,
      stage,
      result,
      homeCode: home?.id ?? "?",
      awayCode: away?.id ?? "?",
      groupLetter: stage === "group" ? (home?.groupLetter ?? null) : null,
      kickoffUtc: preds[0].kickoffUtc,
      picks,
    });
  }
  return resolved.sort(
    (a, b) => a.kickoffUtc.getTime() - b.kickoffUtc.getTime(),
  );
}

export function computeWrappedStats(
  resolved: ResolvedMatch[],
  users: { id: number; name: string }[],
  targetUserId: number,
): WrappedStats {
  const pointsByUser = new Map<number, number>();
  const drawCorrectByUser = new Map<number, number>();
  const loneWolfByUser = new Map<number, number>();
  const agreeTotal = new Map<number, number>();
  const agreeSame = new Map<number, number>();

  const resultDist: Record<string, number> = { "1": 0, X: 0, "2": 0 };
  const pickDist: Record<string, number> = { "1": 0, X: 0, "2": 0 };

  let targetPicksTotal = 0;
  let targetCorrect = 0;
  let drawTotal = 0;
  let groupStageMatchCount = 0;
  let unanimousCount = 0;
  let unanimousCorrect = 0;
  let curCorrect = 0;
  let curIncorrect = 0;
  let maxCorrect = 0;
  let maxIncorrect = 0;

  const groupCorrectByLetter = new Map<string, number>();
  const groupTotalByLetter = new Map<string, number>();
  const groupFlagsByLetter = new Map<string, Set<string>>();

  const nobodyCorrectMatches: MatchRef[] = [];
  const loneWolfMatches: MatchRef[] = [];

  for (const m of resolved) {
    resultDist[m.result]++;
    if (!KO_STAGES.has(m.stage)) groupStageMatchCount++;

    let correctCount = 0;
    for (const [uid, pick] of m.picks) {
      if (pick === m.result) {
        correctCount++;
        pointsByUser.set(uid, (pointsByUser.get(uid) ?? 0) + 1);
      }
    }

    if (new Set(m.picks.values()).size === 1) {
      unanimousCount++;
      if (correctCount > 0) unanimousCorrect++;
    }

    if (correctCount === 0) {
      nobodyCorrectMatches.push({ homeCode: m.homeCode, awayCode: m.awayCode });
    }

    if (correctCount === 1) {
      const soleId = [...m.picks.entries()].find(
        ([, p]) => p === m.result,
      )![0];
      loneWolfByUser.set(soleId, (loneWolfByUser.get(soleId) ?? 0) + 1);
      if (soleId === targetUserId) {
        loneWolfMatches.push({ homeCode: m.homeCode, awayCode: m.awayCode });
      }
    }

    if (m.result === "X") {
      drawTotal++;
      for (const [uid, pick] of m.picks) {
        if (pick === "X")
          drawCorrectByUser.set(
            uid,
            (drawCorrectByUser.get(uid) ?? 0) + 1,
          );
      }
    }

    if (m.groupLetter) {
      const letter = m.groupLetter;
      const teams = groupFlagsByLetter.get(letter) ?? new Set<string>();
      teams.add(m.homeCode);
      teams.add(m.awayCode);
      groupFlagsByLetter.set(letter, teams);
    }

    const targetPick = m.picks.get(targetUserId);
    if (targetPick !== undefined) {
      targetPicksTotal++;
      pickDist[targetPick]++;
      if (targetPick === m.result) {
        targetCorrect++;
        curCorrect++;
        curIncorrect = 0;
        if (curCorrect > maxCorrect) maxCorrect = curCorrect;
      } else {
        curIncorrect++;
        curCorrect = 0;
        if (curIncorrect > maxIncorrect) maxIncorrect = curIncorrect;
      }

      if (m.groupLetter) {
        const letter = m.groupLetter;
        groupTotalByLetter.set(
          letter,
          (groupTotalByLetter.get(letter) ?? 0) + 1,
        );
        if (targetPick === m.result) {
          groupCorrectByLetter.set(
            letter,
            (groupCorrectByLetter.get(letter) ?? 0) + 1,
          );
        }
      }

      for (const [uid, pick] of m.picks) {
        if (uid === targetUserId) continue;
        agreeTotal.set(uid, (agreeTotal.get(uid) ?? 0) + 1);
        if (pick === targetPick)
          agreeSame.set(uid, (agreeSame.get(uid) ?? 0) + 1);
      }
    }
  }

  const rank = rankMap(pointsByUser, users).get(targetUserId) ?? users.length;

  let twin: { name: string; agreement: number } | null = null;
  let nemesis: { name: string; agreement: number } | null = null;
  for (const o of users) {
    if (o.id === targetUserId) continue;
    const total = agreeTotal.get(o.id) ?? 0;
    if (total === 0) continue;
    const agreement = Math.round(
      ((agreeSame.get(o.id) ?? 0) / total) * 100,
    );
    if (!twin || agreement > twin.agreement) twin = { name: o.name, agreement };
    if (!nemesis || agreement < nemesis.agreement)
      nemesis = { name: o.name, agreement };
  }

  const optimal = Object.entries(resultDist)
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count > targetCorrect);
  const oneGuessStrat = optimal
    ? {
        pick: optimal[0],
        correctCount: optimal[1],
        potentialRank:
          users.filter((u) => (pointsByUser.get(u.id) ?? 0) > optimal[1])
            .length + 1,
      }
    : null;

  const runningPoints = new Map<number, number>();
  const history: number[] = [];
  for (const m of resolved) {
    for (const [uid, pick] of m.picks) {
      if (pick === m.result)
        runningPoints.set(uid, (runningPoints.get(uid) ?? 0) + 1);
    }
    const r = rankMap(runningPoints, users).get(targetUserId);
    if (r === undefined) continue;
    history.push(r);
  }

  const targetDrawCorrect = drawCorrectByUser.get(targetUserId) ?? 0;

  let bestGroup: {
    letter: string;
    teamIds: string[];
    correct: number;
    total: number;
  } | null = null;
  for (const [letter, total] of groupTotalByLetter) {
    const correct = groupCorrectByLetter.get(letter) ?? 0;
    if (
      !bestGroup ||
      correct > bestGroup.correct ||
      (correct === bestGroup.correct && letter < bestGroup.letter)
    ) {
      bestGroup = {
        letter,
        teamIds: [...(groupFlagsByLetter.get(letter) ?? new Set())],
        correct,
        total,
      };
    }
  }

  return {
    playerCount: users.length,
    rank,
    groupStageMatchCount,
    pickDistribution: pickDist,
    accuracy: {
      correct: targetCorrect,
      total: targetPicksTotal,
      pct: pct(targetCorrect, targetPicksTotal),
    },
    streaks: {
      longestCorrect: maxCorrect,
      longestIncorrect: maxIncorrect,
    },
    bestGroup,
    oneGuessStrat,
    draws: {
      yourCorrect: targetDrawCorrect,
      tournamentCount: drawTotal,
      pct: pct(targetDrawCorrect, drawTotal),
      leader: leaderFromCounts(drawCorrectByUser, users),
    },
    unanimous: { count: unanimousCount, correct: unanimousCorrect },
    nobodyCorrect: { matches: nobodyCorrectMatches },
    loneWolf: {
      leader: leaderFromCounts(loneWolfByUser, users),
      correctMatches: loneWolfMatches,
    },
    twin,
    nemesis,
    rankTrajectory: {
      history,
    },
  };
}
