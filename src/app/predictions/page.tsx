import { db } from "@/lib/db";
import { matches, predictions, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { MatchCard } from "@/components/match-card";

export const dynamic = "force-dynamic";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Kahdeksannesvälierät",
  r16: "Neljännesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

export default async function PredictionsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const [allMatches, allTeams, userPredictions] = await Promise.all([
    db.select().from(matches).orderBy(matches.kickoffUtc),
    db.select().from(teams),
    db.select().from(predictions).where(eq(predictions.userId, user.id)),
  ]);

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  function label(teamId: string | null): string {
    if (!teamId) return "TBD";
    const t = teamMap.get(teamId);
    return t ? `${t.flagEmoji} ${t.name}` : "TBD";
  }

  const predictionMap = new Map(userPredictions.map((p) => [p.matchId, p.pick]));

  const groupedByStage = new Map<string, typeof allMatches>();
  for (const match of allMatches) {
    const stage = match.stage;
    if (!groupedByStage.has(stage)) groupedByStage.set(stage, []);
    groupedByStage.get(stage)!.push(match);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      {Array.from(groupedByStage.entries()).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            {STAGE_LABELS[stage] || stage}
          </h2>
          <div className="space-y-3">
            {stageMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={{
                  id: match.id,
                  homeLabel: label(match.homeTeamId),
                  awayLabel: label(match.awayTeamId),
                  stage: match.stage,
                  kickoffUtc: match.kickoffUtc,
                  locked: match.locked,
                  result: match.result,
                  prediction: predictionMap.get(match.id) ?? null,
                }}
                stageLabel={STAGE_LABELS[match.stage] || match.stage}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
