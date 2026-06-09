"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth";
import { cookies } from "next/headers";
import crypto from "crypto";

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

  if (!user.isAdmin && user.sessionToken) {
    return { error: "Tämä kutsukoodi on jo käytetty" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await setSession(user.id, token);

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
