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
        pick: predictions.pick,
        result: matches.result,
      })
      .from(predictions)
      .innerJoin(matches, eq(predictions.matchId, matches.id)),
  ]);

  const pointsByUser = new Map<number, number>();
  for (const p of allPredictions) {
    pointsByUser.set(
      p.userId,
      (pointsByUser.get(p.userId) ?? 0) + calculatePoints(p.pick, p.result),
    );
  }

  const ranked = allUsers
    .map((u) => ({
      ...u,
      totalPoints: pointsByUser.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="divide-y divide-zinc-200">
        {ranked.map((user, index) => {
          const isMe = user.id === currentUser.id;
          const href = isMe
            ? "/predictions"
            : `/predictions?vertaile=${encodeURIComponent(user.name)}`;

          return (
            <Link
              key={user.id}
              href={href}
              className={`flex items-center justify-between px-1 py-4 transition-colors hover:bg-zinc-50 ${
                isMe ? "bg-blue-50" : ""
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
                    isMe
                      ? "font-semibold text-blue-600"
                      : "text-zinc-700"
                  }`}
                >
                  {user.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-base">
                <span className="font-bold text-zinc-900">
                  {user.totalPoints} p
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
