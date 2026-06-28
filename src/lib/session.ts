import { createHmac } from "crypto";

export const COOKIE_NAME = "wc26_session";

export type SessionData = {
  id: number;
  name: string;
  isAdmin: boolean;
};

function getSecret(): string {
  return process.env.ADMIN_INVITE_CODE || "";
}

export function pack(data: SessionData): string {
  const secret = getSecret();
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function unpack(token: string): SessionData | null {
  const secret = getSecret();
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}
