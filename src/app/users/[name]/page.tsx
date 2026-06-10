import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { UserPredictionsView } from "@/components/user-predictions-view";

export default async function UserPage(props: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await props.params;
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [user] = await db.select().from(users).where(eq(users.name, name)).limit(1);
  if (!user) return notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <UserPredictionsView userId={user.id} isOwnPage={user.id === currentUser.id} />
    </div>
  );
}
