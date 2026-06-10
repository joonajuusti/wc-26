import { getCachedTeamsAndMatches, getUserPredictions } from "@/lib/cached-queries";
import { calculatePoints } from "@/lib/scoring";
import type { MatchWithPrediction } from "@/components/match-card";
import { PredictionsView } from "@/components/predictions-view";

export async function PredictionsList({
  userId,
  readOnly = false,
  showSummary = false,
}: {
  userId: number;
  readOnly?: boolean;
  showSummary?: boolean;
}) {
  const [{ allTeams, allMatches }, userPredictions] = await Promise.all([
    getCachedTeamsAndMatches(),
    getUserPredictions(userId),
  ]);

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  function team(teamId: string | null) {
    if (!teamId) return { flag: "🏳️", code: "TBD" };
    const t = teamMap.get(teamId);
    return t ? { flag: t.flagEmoji, code: t.id } : { flag: "🏳️", code: "TBD" };
  }

  const predictionMap = new Map(
    userPredictions.map((p) => [p.matchId, p.pick]),
  );

  const matches = readOnly
    ? allMatches.filter((m) => m.locked)
    : allMatches;

  const correctCount = matches.filter(
    (m) => m.result && predictionMap.get(m.id) === m.result,
  ).length;

  const totalPoints = matches.reduce(
    (sum, m) =>
      sum + calculatePoints(m.stage, predictionMap.get(m.id) ?? null, m.result),
    0,
  );

  const totalWithResult = matches.filter((m) => m.result !== null).length;

  const matchCards: MatchWithPrediction[] = matches.map((match) => ({
    id: match.id,
    homeFlag: team(match.homeTeamId).flag,
    homeCode: team(match.homeTeamId).code,
    awayFlag: team(match.awayTeamId).flag,
    awayCode: team(match.awayTeamId).code,
    stage: match.stage,
    kickoffUtc: match.kickoffUtc,
    locked: match.locked,
    result: match.result,
    prediction: predictionMap.get(match.id) ?? null,
  }));

  return (
    <PredictionsView
      matchCards={matchCards}
      readOnly={readOnly}
      showSummary={showSummary}
      totalPoints={totalPoints}
      correctCount={correctCount}
      totalWithResult={totalWithResult}
    />
  );
}
