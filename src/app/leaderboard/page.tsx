import { db } from "@/lib/db";
import { users, predictions, matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { calculatePoints } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PEDESTALS = [
  { rank: 2, numeralColor: "text-zinc-500", roman: "II", accent: "bg-zinc-500", height: "h-15" },
  { rank: 1, numeralColor: "text-yellow-500", roman: "I", accent: "bg-yellow-500", height: "h-20" },
  { rank: 3, numeralColor: "text-amber-600", roman: "III", accent: "bg-amber-600", height: "h-12" },
];

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
      rank: 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  let currentRank = 0;
  let prevPoints: number | null = null;
  let position = 0;
  for (const u of ranked) {
    position++;
    if (prevPoints === null || u.totalPoints !== prevPoints) {
      currentRank = position;
    }
    u.rank = currentRank;
    prevPoints = u.totalPoints;
  }

  const rankCounts = new Map<number, number>();
  for (const u of ranked) {
    rankCounts.set(u.rank, (rankCounts.get(u.rank) ?? 0) + 1);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-6 grid grid-cols-3 items-end px-1">
        {PEDESTALS.map((p) => {
          const players = ranked.filter((u) => u.rank === p.rank);
          return (
            <div key={p.rank} className="flex flex-col justify-end">
              <div className="mb-2 flex flex-col items-center gap-0.5 px-1">
                {players.map((u) => (
                  <span
                    key={u.id}
                    className={`max-w-full truncate text-center text-xs font-medium ${
                      u.id === currentUser.id ? "text-blue-600" : "text-zinc-700"
                    }`}
                  >
                    {u.name}
                  </span>
                ))}
              </div>
              <div
                className={`flex flex-col overflow-hidden rounded-t-lg bg-white shadow-sm ${p.height}`}
              >
                <div className={`h-1.5 w-full shrink-0 ${p.accent}`} />
                <div className="flex flex-1 items-center justify-center">
                  <span className={`text-3xl font-bold ${p.numeralColor}`}>
                    {p.roman}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-zinc-200">
        {ranked.map((user, index) => {
          const isMe = user.id === currentUser.id;
          const isShared = (rankCounts.get(user.rank) ?? 0) > 1;
          const isFirstOfRank = index === 0 || ranked[index - 1].rank !== user.rank;
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
                  className="w-8 text-center text-base font-bold tabular-nums text-zinc-400"
                >
                  {isShared && !isFirstOfRank ? "=" : user.rank}
                </span>
                <span
                  className={`text-base ${
                    isMe ? "font-semibold text-blue-600" : "text-zinc-700"
                  }`}
                >
                  {user.name}
                </span>
              </div>
              <span className="font-bold tabular-nums text-zinc-900">
                {user.totalPoints} p
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
