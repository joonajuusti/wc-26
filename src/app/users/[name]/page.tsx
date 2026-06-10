import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { PredictionsList } from "@/components/predictions-list";

export default async function UserPage(props: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await props.params;
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [user] = await db.select().from(users).where(eq(users.name, name)).limit(1);
  if (!user) return notFound();

  const isOwnPage = user.id === currentUser.id;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <PredictionsList
        userId={user.id}
        readOnly={!isOwnPage}
        showSummary={isOwnPage}
      />
    </div>
  );
}
