"use server";

import { db } from "@/lib/db";
import { matches, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function setMatchResult(matchId: number, result: "1" | "X" | "2") {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db
    .update(matches)
    .set({ result, locked: true })
    .where(eq(matches.id, matchId));

  revalidatePath("/predictions");
  revalidatePath("/leaderboard");
  revalidatePath("/admin/matches");
  revalidatePath("/admin");
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

  revalidatePath("/predictions");
  revalidatePath("/admin/matches");
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

  revalidatePath("/predictions");
  revalidatePath("/admin/matches");
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

  revalidatePath("/predictions");
  revalidatePath("/admin/matches");
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

  revalidatePath("/admin/users");
  return { success: true, code };
}
