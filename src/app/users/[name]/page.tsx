import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { UserPredictionsView } from "@/components/user-predictions-view";
import { BottomNav } from "@/components/bottom-nav";

export default async function UserPage(props: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await props.params;
  const currentUser = await getSessionUser();
  if (!currentUser) return null;

  const [user] = await db.select().from(users).where(eq(users.name, name)).limit(1);
  if (!user) return notFound();

  return (
    <>
      <UserPredictionsView
        userId={user.id}
        userName={user.name}
        isOwnPage={user.id === currentUser.id}
      />
      <div className="mx-auto max-w-lg px-4 pb-24">
        <BottomNav isAdmin={currentUser.isAdmin} />
      </div>
    </>
  );
}
