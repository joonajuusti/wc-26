import {
  getCachedTeamsAndMatches,
  getUserPredictions,
} from "@/lib/cached-queries";
import type { MatchWithPrediction } from "@/components/match-card";
import { PredictionsView } from "@/components/predictions-view";

export async function PredictionsList({
  userId,
  readOnly = false,
  showSummary = false,
  allUserNames = [],
  compareUserId,
  compareName,
}: {
  userId: number;
  readOnly?: boolean;
  showSummary?: boolean;
  allUserNames?: string[];
  compareUserId?: number;
  compareName?: string;
}) {
  const [{ allTeams, allMatches }, userPredictions, comparePredictions] =
    await Promise.all([
      getCachedTeamsAndMatches(),
      getUserPredictions(userId),
      compareUserId ? getUserPredictions(compareUserId) : Promise.resolve([]),
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

  const compareMap = new Map(
    comparePredictions.map((p) => [p.matchId, p.pick]),
  );

  const matches = readOnly ? allMatches.filter((m) => m.locked) : allMatches;

  const correctCount = matches.filter(
    (m) => m.result && predictionMap.get(m.id) === m.result,
  ).length;

  const compareCorrectCount = matches.filter(
    (m) => m.result && compareMap.get(m.id) === m.result,
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
    theirPrediction: compareMap.get(match.id) ?? null,
  }));

  return (
    <PredictionsView
      matchCards={matchCards}
      readOnly={readOnly}
      showSummary={showSummary}
      correctCount={correctCount}
      compareCorrectCount={compareCorrectCount}
      totalWithResult={totalWithResult}
      allUserNames={allUserNames}
      compareName={compareName}
    />
  );
}
