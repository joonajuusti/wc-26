import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const userCount = await db.select().from(users);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <LoginForm />

        <p className="mt-4 text-center text-xs text-zinc-400">
          {userCount.length} pelaajaa rekisteröityneenä
        </p>
      </div>
    </div>
  );
}
