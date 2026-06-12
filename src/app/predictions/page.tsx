import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { PredictionsList } from "@/components/predictions-list";

export const dynamic = "force-dynamic";

export default async function PredictionsPage(props: {
  searchParams: Promise<{ vertaile?: string }>;
}) {
  const { vertaile } = await props.searchParams;
  const user = await getSessionUser();
  if (!user) return null;

  const [allUsers, compareRows] = await Promise.all([
    db.select().from(users).orderBy(users.name),
    vertaile && vertaile !== user.name
      ? db.select().from(users).where(eq(users.name, vertaile)).limit(1)
      : Promise.resolve([]),
  ]);

  const allUserNames = allUsers
    .filter((u) => u.id !== user.id)
    .map((u) => u.name);

  const compareUser = compareRows[0];

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <PredictionsList
        userId={user.id}
        showSummary
        allUserNames={allUserNames}
        compareUserId={compareUser?.id}
        compareName={compareUser?.name}
      />
    </div>
  );
}
