import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400",
        "focus:border-primary-400",
        className,
      )}
      {...props}
    />
  );
}

const SELECT_SIZES: Record<string, string> = {
  xs: "rounded-md py-1 pl-2 pr-7 text-xs",
  md: "rounded-lg py-2 pl-3 pr-9 text-sm",
};

type SelectSize = "xs" | "md";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: SelectSize;
};

export function Select({ size = "md", className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "border border-zinc-300 bg-white text-zinc-900 shadow-sm focus:border-primary-400",
        "appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%2712%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%2371717a%27%20stroke-width=%272.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpath%20d=%27m6%209%206%206%206-6%27/%3E%3C/svg%3E')]",
        SELECT_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

export function Checkbox({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-5 w-5 shrink-0 rounded border-zinc-300 accent-primary-600",
        className,
      )}
      {...props}
    />
  );
}
