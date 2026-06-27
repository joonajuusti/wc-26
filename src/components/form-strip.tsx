import { CheckIcon, XIcon, MinusIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { FormMark } from "@/lib/form";

const MARK_STYLE: Record<FormMark, { Icon: typeof CheckIcon; className: string }> = {
  correct: { Icon: CheckIcon, className: "text-success-600" },
  wrong: { Icon: XIcon, className: "text-danger-400" },
  pending: { Icon: MinusIcon, className: "text-zinc-300" },
};

export function FormStrip({ marks }: { marks: FormMark[] }) {
  if (marks.length === 0) return null;

  return (
    <span className="inline-flex items-center gap-0.5">
      {marks.map((mark, i) => {
        const { Icon, className } = MARK_STYLE[mark];
        return <Icon key={i} className={cn("h-3.5 w-3.5", className)} />;
      })}
    </span>
  );
}
