import { db } from "@/lib/db";
import { users, predictions, matches, scoringRules } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const allUsers = await db.select().from(users).orderBy(users.name);

  const leaderboard = await db
    .select({
      userId: predictions.userId,
      totalPoints: sql<number>`COALESCE(SUM(${predictions.pointsEarned}), 0)`,
      correctCount: sql<number>`COUNT(CASE WHEN ${predictions.pick} = ${matches.result} THEN 1 END)`,
    })
    .from(predictions)
    .innerJoin(matches, eq(predictions.matchId, matches.id))
    .groupBy(predictions.userId);

  const userPoints = new Map(leaderboard.map((l) => [l.userId, l]));

  const ranked = allUsers
    .map((u) => ({
      ...u,
      totalPoints: userPoints.get(u.id)?.totalPoints ?? 0,
      correctCount: userPoints.get(u.id)?.correctCount ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Tulostaulu
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{currentUser.name}</span>
          <LogoutButton />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {ranked.map((user, index) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                user.id === currentUser.id
                  ? "bg-blue-50 dark:bg-blue-950"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                        ? "text-zinc-400"
                        : index === 2
                          ? "text-amber-600"
                          : "text-zinc-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm ${
                    user.id === currentUser.id
                      ? "font-semibold text-blue-600 dark:text-blue-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {user.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  {user.correctCount} oikein
                </span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50">
                  {user.totalPoints} p
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav userId={currentUser.id} isAdmin={currentUser.isAdmin} />
    </div>
  );
}
