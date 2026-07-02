"use client";

import {
  useState,
  useOptimistic,
  useTransition,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { MatchCard, type MatchWithPrediction } from "@/components/match-card";
import { Select, Checkbox } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";
import { type Comparison } from "@/components/predictions-list";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const formatGuessCount = (correct: number, total: number) => {
  const percentage = ((correct / total) * 100).toFixed(0);

  return `${correct}/${total} (${percentage}%)`;
};

const getComparisonTarget = (comp: Comparison) => {
  switch (comp.type) {
    case "none":
      return "";
    case "all":
      return "all";
    case "single-user":
      return comp.user.name;
  }
};

export function PredictionsView({
  matchCards,
  showSummary = false,
  correctCount,
  compareCorrectCount,
  totalWithResult,
  allUserNames = [],
  comparison,
}: {
  matchCards: MatchWithPrediction[];
  showSummary?: boolean;
  correctCount: number;
  compareCorrectCount?: number;
  totalWithResult: number;
  allUserNames?: string[];
  comparison: Comparison;
}) {
  const router = useRouter();
  const [onlyOpen, setOnlyOpen] = useState(false);

  const [optimisticTarget, setOptimisticTarget] = useOptimistic(
    getComparisonTarget(comparison),
  );
  const [, startTransition] = useTransition();

  const isComparing = comparison.type === "single-user";

  function handleCompareChange(name: string) {
    startTransition(() => {
      setOptimisticTarget(name);
      if (name) {
        router.push(`/predictions?compare=${encodeURIComponent(name)}`);
      } else {
        router.push("/predictions");
      }
    });
  }

  const filtered = onlyOpen ? matchCards.filter((m) => !m.locked) : matchCards;

  const unpredicted = matchCards.filter(
    (m) => !m.locked && !m.prediction,
  ).length;

  const groupedByStage = new Map<string, MatchWithPrediction[]>();
  for (const m of filtered) {
    if (!groupedByStage.has(m.stage)) groupedByStage.set(m.stage, []);
    groupedByStage.get(m.stage)!.push(m);
  }

  const now = new Date();
  const upcomingId = filtered.find(
    (m) => new Date(m.kickoffUtc) >= now,
  )?.id;

  const upcomingRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const selfContentRef = useRef<HTMLDivElement>(null);
  const compareContentRef = useRef<HTMLDivElement>(null);
  const [forceWrap, setForceWrap] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const target = upcomingRef.current;
    if (!target) return;
    const sticky = stickyRef.current;
    if (sticky) {
      target.style.scrollMarginTop = `${sticky.offsetHeight}px`;
    }
    target.scrollIntoView({ block: "start" });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isComparing) {
      setForceWrap(false);
      return;
    }
    const a = selfContentRef.current;
    const b = compareContentRef.current;
    if (a && b && a.offsetHeight !== b.offsetHeight) {
      setForceWrap(true);
    }
  }, [isComparing]);

  return (
    <>
      {allUserNames.length > 0 && (
        <div className="mb-4 flex items-center justify-end gap-2">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              isComparing ? "bg-accent-400" : "bg-zinc-300",
            )}
          />
          <span
            className={cn(
              "shrink-0 text-sm",
              isComparing ? "text-accent-700" : "text-zinc-500",
            )}
          >
            Vertaile:
          </span>
          <Select
            value={optimisticTarget}
            onChange={(e) => handleCompareChange(e.target.value)}
            className="w-auto"
          >
            <option value="">Ei vertailua</option>
            <option value="all">Kaikkien kanssa</option>
            {allUserNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {showSummary && totalWithResult > 0 && (
        <div className={cn("mb-4 grid gap-3", isComparing ? "grid-cols-2" : "grid-cols-1")}>
          <div className="rounded-lg bg-primary-100 px-2 py-3">
            <div ref={selfContentRef} className="flex flex-wrap items-baseline gap-x-1">
              <span className={cn("whitespace-nowrap text-base text-primary-700", forceWrap && "w-full")}>
                {isComparing ? "Sinä:" : "Oikein:"}
              </span>
              <span className="min-w-0 font-bold tabular-nums text-base text-primary-700 truncate">
                {formatGuessCount(correctCount, totalWithResult)}
              </span>
            </div>
          </div>
          {isComparing && (
            <div className="rounded-lg bg-accent-100 px-2 py-3">
              <div ref={compareContentRef} className="flex flex-wrap items-baseline gap-x-1">
                <span className={cn("min-w-0 truncate whitespace-nowrap text-base text-accent-700", forceWrap && "w-full")}>
                  {comparison.user.name}:
                </span>
                <span className="min-w-0 font-bold tabular-nums text-base text-accent-700 truncate">
                  {formatGuessCount(compareCorrectCount ?? 0, totalWithResult)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={stickyRef} className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 bg-zinc-50 px-4 pb-2 pt-3">
        <label className="flex cursor-pointer select-none items-start gap-2 text-base text-zinc-600">
          <Checkbox
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          Vain veikattavissa olevat
        </label>
        {unpredicted > 0 && (
          <Badge variant="warning" className="ml-auto shrink-0 self-start whitespace-nowrap">
            {unpredicted} veikkaamatta
          </Badge>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-base text-zinc-400">Ei otteluita</p>
      )}

      {Array.from(groupedByStage.entries()).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-6">
          <hr className="text-zinc-200"></hr>
          <h2 className="mt-3 mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {STAGE_LABELS[stage] || stage}
          </h2>
          <div className="space-y-8">
            {stageMatches.map((match) =>
              match.id === upcomingId ? (
                <div key={match.id} ref={upcomingRef}>
                  <MatchCard
                    match={match}
                    stageLabel={STAGE_LABELS[match.stage] || match.stage}
                    comparison={comparison}
                  />
                </div>
              ) : (
                <MatchCard
                  key={match.id}
                  match={match}
                  stageLabel={STAGE_LABELS[match.stage] || match.stage}
                  comparison={comparison}
                />
              ),
            )}
          </div>
        </div>
      ))}
    </>
  );
}
