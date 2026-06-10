import { db } from "@/lib/db";
import { matches, predictions, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculatePoints } from "@/lib/scoring";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Neljännesvälierät (32)",
  r16: "Kahdeksannesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

export async function UserPredictionsView({
  userId,
  isOwnPage,
}: {
  userId: number;
  isOwnPage: boolean;
}) {
  const [allTeams, allMatches, userPredictions] = await Promise.all([
    db.select().from(teams),
    db.select().from(matches).orderBy(matches.kickoffUtc),
    db.select().from(predictions).where(eq(predictions.userId, userId)),
  ]);

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  function label(teamId: string | null): string {
    if (!teamId) return "TBD";
    const t = teamMap.get(teamId);
    return t ? `${t.flagEmoji} ${t.name}` : "TBD";
  }

  const predictionMap = new Map(userPredictions.map((p) => [p.matchId, p]));

  const filteredMatches = isOwnPage
    ? allMatches
    : allMatches.filter((m) => m.locked);

  const correctCount = filteredMatches.filter(
    (m) => m.result && predictionMap.get(m.id)?.pick === m.result
  ).length;

  const totalPoints = filteredMatches.reduce(
    (sum, m) =>
      sum + calculatePoints(m.stage, predictionMap.get(m.id)?.pick ?? null, m.result),
    0,
  );

  const totalWithResult = filteredMatches.filter((m) => m.result !== null).length;

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Pisteet:{" "}
            <span className="font-bold">{totalPoints}</span>
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Oikein:{" "}
            <span className="font-bold">
              {correctCount}/{totalWithResult}
            </span>
          </p>
        </div>
      </div>

      {!isOwnPage && (
        <p className="mb-4 text-xs text-zinc-400">
          Vain lukitut ottelut näkyvissä
        </p>
      )}

      <div className="space-y-3">
        {filteredMatches.map((match) => {
          const pred = predictionMap.get(match.id);
          const isCorrect = match.result && pred?.pick === match.result;
          const isWrong = match.result && pred?.pick && pred.pick !== match.result;

          return (
            <div
              key={match.id}
              className={`rounded-lg border p-3 text-sm ${
                isCorrect
                  ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : isWrong
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {STAGE_LABELS[match.stage]}
                  </div>
                  <div className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                    {label(match.homeTeamId)} vs {label(match.awayTeamId)}
                  </div>
                </div>
                <div className="text-right">
                  {pred ? (
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">
                      {pred.pick}
                    </span>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                  {match.result && (
                    <div className="text-xs text-zinc-500">
                      Tulos: {match.result}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
