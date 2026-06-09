import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users, matches, predictions, teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";
import { LogoutButton } from "@/components/logout-button";
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

export default async function UserPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const userId = parseInt(id);
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return notFound();

  const allMatches = await db.select().from(matches).orderBy(matches.kickoffUtc);
  const userPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId));

  const predictionMap = new Map(userPredictions.map((p) => [p.matchId, p]));

  const correctCount = allMatches.filter(
    (m) => m.result && predictionMap.get(m.id)?.pick === m.result
  ).length;

  const totalPoints = allMatches.reduce(
    (sum, m) =>
      sum + calculatePoints(m.stage, predictionMap.get(m.id)?.pick ?? null, m.result),
    0,
  );

  const totalWithResult = allMatches.filter((m) => m.result !== null).length;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {user.name}
        </h1>
        <LogoutButton />
      </div>

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

      <div className="space-y-3">
        {allMatches.map((match) => {
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
                <div className="flex-1">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {STAGE_LABELS[match.stage]}
                  </div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">
                    {match.homeLabel} vs {match.awayLabel}
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

      <BottomNav userId={currentUser.id} isAdmin={currentUser.isAdmin} />
    </div>
  );
}
