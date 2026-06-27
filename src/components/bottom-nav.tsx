"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PredictionsIcon, TrophyIcon, GearIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function BottomNav({
  isAdmin,
}: {
  isAdmin: boolean;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/predictions", label: "Veikkaukset", Icon: PredictionsIcon },
    { href: "/leaderboard", label: "Tulokset", Icon: TrophyIcon },
  ];

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin", Icon: GearIcon });
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
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "text-primary-700"
                  : "text-zinc-500 hover:text-zinc-700",
              )}
            >
              <link.Icon className="h-6 w-6" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
