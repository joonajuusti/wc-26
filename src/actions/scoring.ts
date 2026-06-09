"use server";

import { db } from "@/lib/db";
import { scoringRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { refresh } from "next/cache";

export async function updateScoringRule(stage: string, points: number) {
  const user = await getSessionUser();
  if (!user?.isAdmin) return { error: "Ei oikeuksia" };

  await db
    .update(scoringRules)
    .set({ points })
    .where(eq(scoringRules.stage, stage));

  refresh();
  return { success: true };
}
