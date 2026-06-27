import { getSessionUser } from "@/lib/auth";
import { getUsers, getLockedPredictions } from "@/lib/queries";
import { getFormWindow, computeRecentForm } from "@/lib/form";
import { FormStrip } from "@/components/form-strip";
import Link from "next/link";

const PEDESTALS = [
  {
    rank: 2,
    numeralColor: "text-silver",
    roman: "II",
    accent: "bg-silver",
    height: "h-15",
  },
  {
    rank: 1,
    numeralColor: "text-gold",
    roman: "I",
    accent: "bg-gold",
    height: "h-20",
  },
  {
    rank: 3,
    numeralColor: "text-bronze",
    roman: "III",
    accent: "bg-bronze",
    height: "h-12",
  },
];

export default async function LeaderboardPage() {
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [allUsers, lockedByMatch] = await Promise.all([
    getUsers(),
    getLockedPredictions(),
  ]);

  const pointsByUser = new Map<number, number>();
  for (const preds of lockedByMatch.values()) {
    const result = preds[0].result;
    if (!result) continue;
    for (const p of preds) {
      if (p.pick === result) {
        pointsByUser.set(p.userId, (pointsByUser.get(p.userId) ?? 0) + 1);
      }
    }
  }

  const picksByMatch = new Map<number, Map<number, string>>();
  for (const [matchId, preds] of lockedByMatch) {
    const inner = new Map<number, string>();
    for (const p of preds) inner.set(p.userId, p.pick);
    picksByMatch.set(matchId, inner);
  }

  const windowMatches = getFormWindow(lockedByMatch);

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
    <div className="ft-fade-in mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-6 grid grid-cols-3 items-end px-1">
        {PEDESTALS.map((p) => {
          const players = ranked.filter((u) => u.rank === p.rank);
          return (
            <div key={p.rank} className="flex flex-col justify-end">
              <div className="mb-2 flex flex-col items-center gap-0.5 px-1">
                {players.map((u) => (
                  <span
                    key={u.id}
                    className={`max-w-full truncate text-center text-sm font-medium ${
                      u.id === currentUser.id
                        ? "text-primary-700"
                        : "text-zinc-700"
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
          const isFirstOfRank =
            index === 0 || ranked[index - 1].rank !== user.rank;
          const href = isMe
            ? "/predictions"
            : `/predictions?vertaile=${encodeURIComponent(user.name)}`;

          return (
            <Link
              key={user.id}
              href={href}
              className={`flex items-center justify-between gap-2 px-1 py-4 transition-colors hover:bg-zinc-50 ${
                isMe ? "bg-primary-100" : ""
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-8 shrink-0 text-center text-base font-bold tabular-nums text-zinc-400">
                  {isShared && !isFirstOfRank ? "=" : user.rank}
                </span>
                <span
                  className={`min-w-0 truncate text-base ${
                    isMe ? "font-semibold text-primary-700" : "text-zinc-700"
                  }`}
                >
                  {user.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {windowMatches.length > 0 && (
                  <FormStrip
                    marks={computeRecentForm(
                      user.id,
                      windowMatches,
                      picksByMatch,
                    )}
                  />
                )}
                <span className="font-bold tabular-nums text-zinc-900">
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
