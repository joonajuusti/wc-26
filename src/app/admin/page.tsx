import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, matches, predictions } from "@/lib/db/schema";
import { eq, sql, isNotNull } from "drizzle-orm";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const userCount = (await db.select().from(users)).length;
  const matchCount = (await db.select().from(matches)).length;
  const predictionCount = (await db.select().from(predictions)).length;
  const resultsCount = (
    await db.select().from(matches).where(isNotNull(matches.result))
  ).length;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <h1 className="mb-6 text-lg font-bold text-zinc-900 dark:text-zinc-50">
        Admin
      </h1>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {userCount}
          </div>
          <div className="text-xs text-zinc-500">Pelaajaa</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {resultsCount}/{matchCount}
          </div>
          <div className="text-xs text-zinc-500">Tuloksia syötetty</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {predictionCount}
          </div>
          <div className="text-xs text-zinc-500">Veikkausta</div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/admin/matches"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            Ottelut
          </div>
          <div className="text-sm text-zinc-500">
            Syötä tuloksia, hallitse joukkueita
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            Pelaajat
          </div>
          <div className="text-sm text-zinc-500">
            Hallitse kutsukoodeja
          </div>
        </Link>

        <Link
          href="/admin/scoring"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <div className="font-medium text-zinc-900 dark:text-zinc-50">
            Pisteet
          </div>
          <div className="text-sm text-zinc-500">Muokkaa pisteytystä</div>
        </Link>
      </div>
    </div>
  );
}
