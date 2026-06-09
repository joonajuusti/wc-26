"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({
  userId,
  isAdmin,
}: {
  userId: number;
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/predictions", label: "Veikkaukset", emoji: "\u26BD" },
    { href: "/leaderboard", label: "Tulostaulu", emoji: "\u{1F3C6}" },
    { href: `/users/${userId}`, label: "Omat", emoji: "\u{1F464}" },
  ];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", emoji: "\u{1F527}" });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-lg">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="text-lg">{link.emoji}</span>
              <span className="mt-0.5">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
