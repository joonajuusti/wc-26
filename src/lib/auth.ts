import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "wc26_session";

type SessionData = {
  id: number;
  name: string;
  isAdmin: boolean;
};

function getSecret(): string {
  return process.env.ADMIN_INVITE_CODE || "";
}

function pack(data: SessionData): string {
  const secret = getSecret();
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function unpack(token: string): SessionData | null {
  const secret = getSecret();
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

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
