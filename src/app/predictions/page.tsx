import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { Comparison, PredictionsList } from "@/components/predictions-list";

const resolveComparison = (
  compareQuery: string | undefined,
  allUsers: {
    name: string;
    id: number;
  }[],
): Comparison => {
  if (!compareQuery) return { type: "none" };

  if (compareQuery === "all") return { type: "all" };

  const comparedUser = allUsers.find((u) => u.name === compareQuery);

  if (!comparedUser) return { type: "none" };

  return { type: "single-user", user: comparedUser };
};

export default async function PredictionsPage(props: {
  searchParams: Promise<{ compare?: string }>;
}) {
  const { compare } = await props.searchParams;
  const user = await getSessionUser();
  if (!user) return null;

  const [allUsers] = await Promise.all([
    db.select().from(users).orderBy(users.name),
  ]);

  const allUserNames = allUsers
    .filter((u) => u.id !== user.id)
    .map((u) => u.name);

  return (
    <div className="ft-fade-in mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <PredictionsList
        userId={user.id}
        showSummary
        allUserNames={allUserNames}
        comparison={resolveComparison(compare, allUsers)}
      />
    </div>
  );
}
