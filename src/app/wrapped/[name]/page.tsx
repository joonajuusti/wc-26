import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getUsers,
  getTeamsAndMatches,
  getLockedPredictions,
  isTournamentOver,
} from "@/lib/queries";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { buildResolvedMatches, computeWrappedStats } from "@/lib/wrapped";
import { WrappedView } from "@/components/wrapped-view";

export default async function WrappedPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ "show-incomplete"?: string }>;
}) {
  const { name: rawName } = await props.params;
  const params = await props.searchParams;
  const name = decodeURIComponent(rawName);

  const isForcedView = params["show-incomplete"] === "true";

  const currentUser = await getSessionUser();
  if (!currentUser) redirect("/");

  if (!isForcedView) {
    const over = await isTournamentOver();
    if (!over) redirect("/leaderboard");
  }

  const [allUsers, { allMatches, allTeams }, lockedByMatch] = await Promise.all(
    [getUsers(), getTeamsAndMatches(), getLockedPredictions()],
  );

  const target = allUsers.find((u) => u.name === name);
  if (!target) notFound();

  const resolved = buildResolvedMatches(
    allMatches.map((m) => ({
      id: m.id,
      stage: m.stage,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
    })),
    allTeams,
    lockedByMatch,
  );
  const stats = computeWrappedStats(
    resolved,
    allUsers.map((u) => ({ id: u.id, name: u.name })),
    target.id,
  );

  const isOwn = currentUser.id === target.id;
  if (isOwn && !target.hasSeenResultsSummary && !isForcedView) {
    await db
      .update(users)
      .set({ hasSeenResultsSummary: true })
      .where(eq(users.id, target.id));
  }

  return <WrappedView name={target.name} stats={stats} />;
}
