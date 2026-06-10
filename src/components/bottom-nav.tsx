"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/predictions", label: "Veikkaukset", emoji: "\u26BD" },
    { href: "/leaderboard", label: "Tulokset", emoji: "\u{1F3C6}" },
    { href: "/omat", label: "Omat", emoji: "\u{1F464}" },
  ];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", emoji: "\u{1F527}" });
  }

  return (
    <nav className="shrink-0 border-t border-zinc-200 bg-zinc-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex w-full max-w-lg">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs transition-colors ${
                isActive
                  ? "text-blue-600"
                  : "text-zinc-500 hover:text-zinc-700"
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
