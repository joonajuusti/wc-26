import {
  getCachedTeamsAndMatches,
  getUserPredictions,
} from "@/lib/cached-queries";
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
  function teamCode(teamId: string | null) {
    if (!teamId) return "TBD";
    const t = teamMap.get(teamId);
    return t ? t.id : "TBD";
  }

  const predictionMap = new Map(
    userPredictions.map((p) => [p.matchId, p.pick]),
  );

  const matches = readOnly ? allMatches.filter((m) => m.locked) : allMatches;

  const correctCount = matches.filter(
    (m) => m.result && predictionMap.get(m.id) === m.result,
  ).length;

  const totalWithResult = matches.filter((m) => m.result !== null).length;

  const matchCards: MatchWithPrediction[] = matches.map((match) => ({
    id: match.id,
    homeCode: teamCode(match.homeTeamId),
    awayCode: teamCode(match.awayTeamId),
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
      correctCount={correctCount}
      totalWithResult={totalWithResult}
    />
  );
}
