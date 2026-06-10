"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

function getTitle(pathname: string): string {
  if (pathname === "/predictions") return "Veikkaukset";
  if (pathname === "/leaderboard") return "Tulokset";
  if (pathname === "/admin") return "Admin";
  if (pathname === "/admin/matches") return "Ottelut";
  if (pathname === "/admin/users") return "Pelaajat";
  if (pathname.startsWith("/users/")) {
    return decodeURIComponent(pathname.slice("/users/".length));
  }
  return "";
}

export function Header({ name }: { name: string }) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  if (!title) return null;

  return (
    <div className="mx-auto w-full max-w-lg shrink-0 px-4 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">{name}</span>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
