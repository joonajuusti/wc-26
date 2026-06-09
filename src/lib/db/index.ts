import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DB_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
  url.startsWith("file:")
    ? { url }
    : { url, authToken: authToken! }
);

export const db = drizzle(client, { schema });
export { schema };
