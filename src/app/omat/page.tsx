import { getSessionUser } from "@/lib/auth";
import { UserPredictionsView } from "@/components/user-predictions-view";
import { BottomNav } from "@/components/bottom-nav";

export default async function OmatPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <>
      <UserPredictionsView userId={user.id} userName={user.name} isOwnPage />
      <div className="mx-auto max-w-lg px-4 pb-24">
        <BottomNav isAdmin={user.isAdmin} />
      </div>
    </>
  );
}
