"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSession, clearSession } from "@/lib/auth";

export async function login(formData: FormData) {
  const inviteCode = (formData.get("inviteCode") as string)?.trim();

  if (!inviteCode) {
    return { error: "Kutsukoodi on pakollinen" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.inviteCode, inviteCode))
    .limit(1);

  if (!user) {
    return { error: "Virheellinen kutsukoodi" };
  }

  await setSession({ id: user.id, name: user.name, isAdmin: user.isAdmin });

  return { success: true, userId: user.id, isAdmin: user.isAdmin };
}

export async function logout() {
  await clearSession();
}
