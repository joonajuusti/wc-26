"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function login(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const inviteCode = (formData.get("inviteCode") as string)?.trim();

  if (!name || !inviteCode) {
    return { error: "Nimi ja kutsukoodi ovat pakollisia" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.inviteCode, inviteCode))
    .limit(1);

  if (!user) {
    return { error: "Virheellinen kutsukoodi" };
  }

  if (user.name !== "Admin" && user.name !== name && user.sessionToken) {
    return { error: "T\u00e4m\u00e4 kutsukoodi on jo k\u00e4ytetty" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await setSession(user.id, token);

  if (!user.sessionToken) {
    await db.update(users).set({ name }).where(eq(users.id, user.id));
  }

  const cookieStore = await cookies();
  cookieStore.set("wc26_session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
    path: "/",
  });

  return { success: true, userId: user.id, isAdmin: user.isAdmin };
}

export async function logout() {
  const { getSessionUser } = await import("@/lib/auth");
  const user = await getSessionUser();
  if (user) {
    const { clearSession } = await import("@/lib/auth");
    await clearSession(user.id);
  }

  const cookieStore = await cookies();
  cookieStore.delete("wc26_session");
}
