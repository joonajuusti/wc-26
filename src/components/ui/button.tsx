import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";
type Size = "xs" | "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg " +
  "transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
  secondary: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
  success: "bg-success-700 text-white shadow-sm hover:bg-success-800",
  danger: "bg-danger-600 text-white shadow-sm hover:bg-danger-700",
  ghost: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
};

const SIZES: Record<Size, string> = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "w-full px-4 py-3 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}
