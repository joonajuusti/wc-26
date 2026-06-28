import { cookies } from "next/headers";
import { COOKIE_NAME, pack, unpack, type SessionData } from "@/lib/session";

export type { SessionData };

export async function getSessionUser(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return unpack(token);
}

export async function setSession(data: SessionData) {
  const token = pack(data);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 60,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
