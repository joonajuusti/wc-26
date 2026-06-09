import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "drizzle-kit";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.DB_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "turso",
  dbCredentials: url.startsWith("file:")
    ? { url }
    : { url, authToken: authToken! },
});
