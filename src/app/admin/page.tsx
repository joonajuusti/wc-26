import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="space-y-2">
        <Link
          href="/admin/matches"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <div className="font-medium text-zinc-900">
            Ottelut
          </div>
          <div className="text-sm text-zinc-500">
            Syötä tuloksia, hallitse joukkueita
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
        >
          <div className="font-medium text-zinc-900">
            Pelaajat
          </div>
          <div className="text-sm text-zinc-500">
            Hallitse kutsukoodeja, tarkista veikkausten tila
          </div>
        </Link>
      </div>
    </div>
  );
}
