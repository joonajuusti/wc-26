import { getCachedTeamsAndMatches, getUserPredictions } from "@/lib/cached-queries";
import { calculatePoints } from "@/lib/scoring";
import { MatchCard, type MatchWithPrediction } from "@/components/match-card";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Kahdeksannesvälierät",
  r16: "Neljännesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

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

  const groupedByStage = new Map<string, MatchWithPrediction[]>();
  for (const m of matchCards) {
    if (!groupedByStage.has(m.stage)) groupedByStage.set(m.stage, []);
    groupedByStage.get(m.stage)!.push(m);
  }

  return (
    <>
      {showSummary && totalWithResult > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Pisteet:{" "}
              <span className="font-bold">{totalPoints}</span>
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Oikein:{" "}
              <span className="font-bold">
                {correctCount}/{totalWithResult}
              </span>
            </p>
          </div>
        </div>
      )}

      {readOnly && (
        <p className="mb-4 text-xs text-zinc-400">
          Vain lukitut ottelut näkyvissä
        </p>
      )}

      {Array.from(groupedByStage.entries()).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
            {STAGE_LABELS[stage] || stage}
          </h2>
          <div className="space-y-8">
            {stageMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                stageLabel={STAGE_LABELS[match.stage] || match.stage}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
