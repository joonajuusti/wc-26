import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userCount = await db.select().from(users);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            MM 2026
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Jalkapallon MM-kisojen veikkauspeli
          </p>
        </div>

        <LoginForm />

        <p className="mt-4 text-center text-xs text-zinc-400">
          {userCount.length} pelaajaa rekisteroituneena
        </p>
      </div>
    </div>
  );
}
