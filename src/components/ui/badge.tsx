import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "neutral" | "primary" | "success" | "danger" | "warning" | "accent";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  neutral: "bg-zinc-100 text-zinc-600",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success-100 text-success-800",
  danger: "bg-danger-100 text-danger-700",
  warning: "bg-warning-100 text-warning-700",
  accent: "bg-accent-100 text-accent-700",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
  size?: Size;
};

export function Badge({ variant = "neutral", size = "md", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
