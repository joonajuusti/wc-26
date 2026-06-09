"use server";

import { db } from "@/lib/db";
import { matches, teams, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { refresh } from "next/cache";
import crypto from "crypto";

export async function setMatchResult(matchId: number, result: "1" | "X" | "2") {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db.update(matches).set({ result }).where(eq(matches.id, matchId));

  refresh();
  return { success: true };
}

export async function setMatchTeams(
  matchId: number,
  homeTeamId: number | null,
  awayTeamId: number | null
) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const [homeTeam] = homeTeamId
    ? await db.select().from(teams).where(eq(teams.id, homeTeamId)).limit(1)
    : [null];
  const [awayTeam] = awayTeamId
    ? await db.select().from(teams).where(eq(teams.id, awayTeamId)).limit(1)
    : [null];

  await db
    .update(matches)
    .set({
      homeTeamId,
      awayTeamId,
      homeLabel: homeTeam ? `${homeTeam.flagEmoji} ${homeTeam.name}` : "TBD",
      awayLabel: awayTeam ? `${awayTeam.flagEmoji} ${awayTeam.name}` : "TBD",
    })
    .where(eq(matches.id, matchId));

  refresh();
  return { success: true };
}

export async function lockStage(stage: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const stageMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.stage, stage as typeof matches.$inferSelect.stage));

  for (const match of stageMatches) {
    await db
      .update(matches)
      .set({ locked: true })
      .where(eq(matches.id, match.id));
  }

  refresh();
  return { success: true };
}

export async function unlockStage(stage: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const stageMatches = await db
    .select()
    .from(matches)
    .where(eq(matches.stage, stage as typeof matches.$inferSelect.stage));

  for (const match of stageMatches) {
    await db
      .update(matches)
      .set({ locked: false })
      .where(eq(matches.id, match.id));
  }

  refresh();
  return { success: true };
}

export async function generateInviteCode(name: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const code = "WC26-" + crypto.randomBytes(4).toString("hex").toUpperCase();

  await db.insert(users).values({
    name,
    inviteCode: code,
    isAdmin: false,
  });

  refresh();
  return { success: true, code };
}
