import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserList } from "./user-list";
import Link from "next/link";

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const allUsers = await db.select().from(users).orderBy(users.name);

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
        Pelaajat
      </h1>

      <UserList users={allUsers} />
    </div>
  );
}
