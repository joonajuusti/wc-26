import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "wc26_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.sessionToken, token))
    .limit(1);

  return user ?? null;
}

export async function setSession(userId: number, token: string) {
  await db
    .update(users)
    .set({ sessionToken: token })
    .where(eq(users.id, userId));
}

export async function clearSession(userId: number) {
  await db
    .update(users)
    .set({ sessionToken: null })
    .where(eq(users.id, userId));
}
