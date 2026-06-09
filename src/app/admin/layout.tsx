import { getSessionUser } from "@/lib/auth";
import { BottomNav } from "@/components/bottom-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <>
      {children}
      {user && <BottomNav userId={user.id} isAdmin={user.isAdmin} />}
    </>
  );
}
