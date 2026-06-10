import { db } from "@/lib/db";
import { users, predictions, matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { calculatePoints } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [allUsers, allPredictions] = await Promise.all([
    db.select().from(users).orderBy(users.name),
    db
      .select({
        userId: predictions.userId,
        stage: matches.stage,
        pick: predictions.pick,
        result: matches.result,
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.matchId, matches.id)),
  ]);

  const pointsByUser = new Map<
    number,
    { totalPoints: number; correctCount: number }
  >();
  for (const p of allPredictions) {
    const entry = pointsByUser.get(p.userId) ?? {
      totalPoints: 0,
      correctCount: 0,
    };
    entry.totalPoints += calculatePoints(p.stage, p.pick, p.result);
    if (p.result && p.pick === p.result) entry.correctCount += 1;
    pointsByUser.set(p.userId, entry);
  }

  const ranked = allUsers
    .map((u) => ({
      ...u,
      totalPoints: pointsByUser.get(u.id)?.totalPoints ?? 0,
      correctCount: pointsByUser.get(u.id)?.correctCount ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="divide-y divide-zinc-200">
        {ranked.map((user, index) => (
          <Link
            key={user.id}
            href={`/users/${encodeURIComponent(user.name)}`}
            className={`flex items-center justify-between px-1 py-4 transition-colors hover:bg-zinc-50 ${
              user.id === currentUser.id ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-6 text-center text-base font-bold ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                      ? "text-zinc-500"
                      : index === 2
                        ? "text-amber-600"
                        : "text-zinc-400"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-base ${
                  user.id === currentUser.id
                    ? "font-semibold text-blue-600"
                    : "text-zinc-700"
                }`}
              >
                {user.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-base">
              <span className="text-zinc-500">{user.correctCount} oikein</span>
              <span className="font-bold text-zinc-900">
                {user.totalPoints} p
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
