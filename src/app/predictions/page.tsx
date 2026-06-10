import { getSessionUser } from "@/lib/auth";
import { PredictionsList } from "@/components/predictions-list";

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <PredictionsList userId={user.id} showSummary />
    </div>
  );
}
