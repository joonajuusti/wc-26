"use client";

import { useState } from "react";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      Kirjaudu ulos
    </button>
  );
}
