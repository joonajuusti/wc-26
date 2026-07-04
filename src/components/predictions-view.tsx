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
import { ChevronDownIcon } from "@/components/icons";

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
  const [showComparison, setShowComparison] = useState(false);

  const [optimisticTarget, setOptimisticTarget] = useOptimistic(
    getComparisonTarget(comparison),
  );
  const [, startTransition] = useTransition();

  const isComparing = comparison.type === "single-user";

  function handleCompareChange(name: string) {
    startTransition(() => {
      setOptimisticTarget(name);
      if (name) {
        router.push(`/predictions?compare=${encodeURIComponent(name)}`, {
          scroll: false,
        });
      } else {
        router.push("/predictions", { scroll: false });
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
  const topRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  const selfContentRef = useRef<HTMLDivElement>(null);
  const compareContentRef = useRef<HTMLDivElement>(null);
  const [forceWrap, setForceWrap] = useState(false);

  function scrollToUpcoming() {
    const target = upcomingRef.current;
    if (!target) return;
    const sticky = stickyRef.current;
    if (sticky) {
      target.style.scrollMarginTop = `${sticky.offsetHeight}px`;
    }
    target.scrollIntoView({ block: "start" });
  }

  useIsomorphicLayoutEffect(() => {
    scrollToUpcoming();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (onlyOpen) {
      topRef.current?.scrollIntoView({ block: "start" });
    } else {
      scrollToUpcoming();
    }
  }, [onlyOpen]);

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
      <div ref={topRef} />
      <div ref={stickyRef} className="sticky top-0 z-10 -mx-4 mb-4 bg-zinc-50 px-4 pb-3 pt-3">
        {allUserNames.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowComparison((v) => !v)}
              className="flex w-full items-center justify-end gap-1.5 text-sm text-zinc-500"
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  isComparing ? "bg-accent-400" : "bg-zinc-300",
                )}
              />
              {showComparison ? "Piilota vertailu" : "Näytä vertailu"}
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  showComparison && "rotate-180",
                )}
              />
            </button>
            {showComparison && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-end gap-2">
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

                {showSummary && totalWithResult > 0 && (
                  <div className={cn("grid gap-3", isComparing ? "grid-cols-2" : "grid-cols-1")}>
                    <div className="rounded-lg bg-primary-100 px-2 py-3">
                      <div ref={selfContentRef} className="flex flex-wrap items-baseline gap-x-1">
                        <span className={cn("whitespace-nowrap text-sm text-primary-700", forceWrap && "w-full")}>
                          {isComparing ? "Sinä:" : "Oikein:"}
                        </span>
                        <span className="min-w-0 font-bold tabular-nums text-sm text-primary-700 truncate">
                          {formatGuessCount(correctCount, totalWithResult)}
                        </span>
                      </div>
                    </div>
                    {isComparing && (
                      <div className="rounded-lg bg-accent-100 px-2 py-3">
                        <div ref={compareContentRef} className="flex flex-wrap items-baseline gap-x-1">
                          <span className={cn("min-w-0 truncate whitespace-nowrap text-sm text-accent-700", forceWrap && "w-full")}>
                            {comparison.user.name}:
                          </span>
                          <span className="min-w-0 font-bold tabular-nums text-sm text-accent-700 truncate">
                            {formatGuessCount(compareCorrectCount ?? 0, totalWithResult)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
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
