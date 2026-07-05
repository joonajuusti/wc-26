"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { matches, teams, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { resolveBracketUpdates } from "@/lib/bracket";

export async function setMatchResult(matchId: number, result: "1" | "X" | "2") {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const [updated] = await db
    .update(matches)
    .set({ result, locked: true })
    .where(eq(matches.id, matchId))
    .returning();

  if (updated) {
    let allMatches: (typeof matches.$inferSelect)[] = [];
    let teamGroups = new Map<string, string>();

    if (updated.stage === "group") {
      const [allTeams, groupRows] = await Promise.all([
        db.select().from(teams),
        db.select().from(matches).where(eq(matches.stage, "group")),
      ]);
      teamGroups = new Map(
        allTeams
          .filter((t) => t.groupLetter)
          .map((t) => [t.id, t.groupLetter!]),
      );
      allMatches = groupRows;
    }

    for (const u of resolveBracketUpdates(updated, allMatches, teamGroups)) {
      console.log(u);

      const patch =
        u.side === "home" ? { homeTeamId: u.teamId } : { awayTeamId: u.teamId };
      await db.update(matches).set(patch).where(eq(matches.id, u.matchId));
    }
  }

  revalidatePath("/admin/matches");
  revalidatePath("/leaderboard");
  revalidatePath("/predictions");

  return { success: true };
}

export async function setMatchTeams(
  matchId: number,
  homeTeamId: string | null,
  awayTeamId: string | null,
) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db
    .update(matches)
    .set({ homeTeamId, awayTeamId })
    .where(eq(matches.id, matchId));

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");

  return { success: true };
}

export async function lockStage(stage: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const stageMatches = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.stage, stage as typeof matches.$inferSelect.stage));

  if (stageMatches.length > 0) {
    await db
      .update(matches)
      .set({ locked: true })
      .where(
        inArray(
          matches.id,
          stageMatches.map((m) => m.id),
        ),
      );
  }

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");

  return { success: true };
}

export async function unlockStage(stage: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const stageMatches = await db
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.stage, stage as typeof matches.$inferSelect.stage));

  if (stageMatches.length > 0) {
    await db
      .update(matches)
      .set({ locked: false })
      .where(
        inArray(
          matches.id,
          stageMatches.map((m) => m.id),
        ),
      );
  }

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");

  return { success: true };
}

export async function lockMatch(matchId: number) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db.update(matches).set({ locked: true }).where(eq(matches.id, matchId));

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");

  return { success: true };
}

export async function unlockMatch(matchId: number) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db
    .update(matches)
    .set({ locked: false })
    .where(eq(matches.id, matchId));

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");

  return { success: true };
}

function slugify(text: string): string {
  const normal = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
  return (
    normal.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "pelaaja"
  );
}

function inviteSuffix(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < 4; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function generateInviteCode(name: string) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  const slug = slugify(name);

  let code = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${slug}-${inviteSuffix()}`;
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.inviteCode, candidate))
      .limit(1);
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    code = `${slug}-${inviteSuffix()}`;
  }

  await db.insert(users).values({
    name,
    inviteCode: code,
    isAdmin: false,
  });

  return { success: true, code };
}
