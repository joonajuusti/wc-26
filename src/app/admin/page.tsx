import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { users, matches, predictions } from "@/lib/db/schema";
import { isNotNull } from "drizzle-orm";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const [allUsers, allMatches, allPredictions, matchesWithResults] =
    await Promise.all([
      db.select().from(users),
      db.select().from(matches),
      db.select().from(predictions),
      db.select().from(matches).where(isNotNull(matches.result)),
    ]);

  const userCount = allUsers.length;
  const matchCount = allMatches.length;
  const predictionCount = allPredictions.length;
  const resultsCount = matchesWithResults.length;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ">
          <div className="text-2xl font-bold text-zinc-900">
            {userCount}
          </div>
          <div className="text-xs text-zinc-500">Pelaajaa</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ">
          <div className="text-2xl font-bold text-zinc-900">
            {resultsCount}/{matchCount}
          </div>
          <div className="text-xs text-zinc-500">Tuloksia syötetty</div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm ">
          <div className="text-2xl font-bold text-zinc-900">
            {predictionCount}
          </div>
          <div className="text-xs text-zinc-500">Veikkausta</div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/admin/matches"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <div className="font-medium text-zinc-900">
            Ottelut
          </div>
          <div className="text-sm text-zinc-500">
            Syötä tuloksia, hallitse joukkueita
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <div className="font-medium text-zinc-900">
            Pelaajat
          </div>
          <div className="text-sm text-zinc-500">
            Hallitse kutsukoodeja
          </div>
        </Link>
      </div>
    </div>
  );
}
