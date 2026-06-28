import { db } from "@/lib/db";
import { users, matches, predictions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserList } from "./user-list";
import { BackLink } from "@/components/back-link";

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const [allUsers, unlockedMatches, allPredictions] = await Promise.all([
    db.select().from(users).orderBy(users.name),
    db.select({ id: matches.id }).from(matches).where(eq(matches.locked, false)),
    db.select().from(predictions),
  ]);

  const unlockedMatchIds = new Set(unlockedMatches.map((m) => m.id));
  const unlockedCount = unlockedMatches.length;

  const predCountByUser = new Map<number, number>();
  for (const pred of allPredictions) {
    if (unlockedMatchIds.has(pred.matchId)) {
      predCountByUser.set(pred.userId, (predCountByUser.get(pred.userId) ?? 0) + 1);
    }
  }

  const usersWithStats = allUsers.map((u) => ({
    ...u,
    unlockedPredictionCount: predCountByUser.get(u.id) ?? 0,
  }));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-4">
      <div className="mb-4">
        <BackLink href="/admin" />
      </div>

      <UserList users={usersWithStats} unlockedMatchCount={unlockedCount} />
    </div>
  );
}
