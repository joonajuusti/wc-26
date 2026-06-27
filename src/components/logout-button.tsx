"use client";

import { useState } from "react";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "@/components/icons";

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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOutIcon className="h-4 w-4" />
      Kirjaudu ulos
    </Button>
  );
}
