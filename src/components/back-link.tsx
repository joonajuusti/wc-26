import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Takaisin
    </Link>
  );
}
