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
    <div className="mx-auto w-full max-w-lg px-4 pb-4 pt-4">
      <div className="mb-4">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          &larr; Takaisin
        </Link>
      </div>

      <UserList users={allUsers} />
    </div>
  );
}
