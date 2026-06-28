import {
  getTeamsAndMatches,
  getLockedPredictions,
  getUserPredictions,
} from "@/lib/queries";
import type { MatchWithPrediction } from "@/components/match-card";
import { PredictionsView } from "@/components/predictions-view";

export type Comparison =
  | { type: "all" }
  | { type: "single-user"; user: { name: string; id: number } }
  | { type: "none" };

export async function PredictionsList({
  userId,
  showSummary = false,
  allUserNames = [],
  comparison,
}: {
  userId: number;
  showSummary?: boolean;
  allUserNames?: string[];
  comparison: Comparison;
}) {
  const [{ allTeams, allMatches }, userPredictions, lockedPredictions] =
    await Promise.all([
      getTeamsAndMatches(),
      getUserPredictions(userId),
      getLockedPredictions(),
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

  const matches = allMatches;

  const correctCount = matches.filter(
    (m) => m.result && predictionMap.get(m.id) === m.result,
  ).length;

  const compareCorrectCount =
    comparison.type === "single-user"
      ? matches.filter(
          (m) =>
            m.result &&
            lockedPredictions
              .get(m.id)
              ?.find(
                (p) => p.pick === m.result && p.userId === comparison.user.id,
              ),
        ).length
      : 0;

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
    allPredictions: lockedPredictions.get(match.id) ?? [],
  }));

  return (
    <PredictionsView
      matchCards={matchCards}
      showSummary={showSummary}
      correctCount={correctCount}
      compareCorrectCount={compareCorrectCount}
      totalWithResult={totalWithResult}
      allUserNames={allUserNames}
      comparison={comparison}
    />
  );
}
