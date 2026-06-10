import { getSessionUser } from "@/lib/auth";
import { UserPredictionsView } from "@/components/user-predictions-view";

export default async function OmatPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <UserPredictionsView userId={user.id} isOwnPage />
    </div>
  );
}
