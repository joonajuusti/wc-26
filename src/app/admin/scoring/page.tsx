import { db } from "@/lib/db";
import { scoringRules } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScoringForm } from "./scoring-form";
import Link from "next/link";

export default async function AdminScoringPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const rules = await db.select().from(scoringRules).orderBy(scoringRules.stage);

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-4">
      <div className="mb-4">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Takaisin
        </Link>
      </div>

      <h1 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">
        Pisteytys
      </h1>

      <ScoringForm rules={rules} />
    </div>
  );
}
