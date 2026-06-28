import { db } from "@/lib/db";
import { matches, teams } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminMatchList } from "./match-list";
import { BackLink } from "@/components/back-link";

export default async function AdminMatchesPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const allMatches = await db.select().from(matches).orderBy(matches.kickoffUtc);
  const allTeams = await db.select().from(teams).orderBy(teams.name);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-4 pt-4">
      <div className="mb-4">
        <BackLink href="/admin" />
      </div>

      <AdminMatchList matches={allMatches} teams={allTeams} />
    </div>
  );
}
