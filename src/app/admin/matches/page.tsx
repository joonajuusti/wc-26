import { db } from "@/lib/db";
import { matches, teams } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminMatchList } from "./match-list";
import Link from "next/link";

export default async function AdminMatchesPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const allMatches = await db.select().from(matches).orderBy(matches.kickoffUtc);
  const allTeams = await db.select().from(teams).orderBy(teams.name);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-4">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Takaisin
        </Link>
      </div>

      <AdminMatchList matches={allMatches} teams={allTeams} />
    </div>
  );
}
