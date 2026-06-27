"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MatchCard, type MatchWithPrediction } from "@/components/match-card";
import { Select, Checkbox } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS } from "@/lib/stages";
import { cn } from "@/lib/cn";
import { type Comparison } from "@/components/predictions-list";

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
  readOnly = false,
  showSummary = false,
  correctCount,
  compareCorrectCount,
  totalWithResult,
  allUserNames = [],
  comparison,
}: {
  matchCards: MatchWithPrediction[];
  readOnly?: boolean;
  showSummary?: boolean;
  correctCount: number;
  compareCorrectCount?: number;
  totalWithResult: number;
  allUserNames?: string[];
  comparison: Comparison;
}) {
  const router = useRouter();
  const [onlyOpen, setOnlyOpen] = useState(false);

  const isComparing = comparison.type === "single-user";

  function handleCompareChange(name: string) {
    if (name) {
      router.push(`/predictions?compare=${encodeURIComponent(name)}`);
    } else {
      router.push("/predictions");
    }
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

  return (
    <>
      {!readOnly && allUserNames.length > 0 && (
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
            value={getComparisonTarget(comparison)}
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
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-primary-100 p-4">
            <p className="text-base text-primary-700">
              {isComparing ? "Sinä: " : "Oikein: "}
              <span className="font-bold tabular-nums">
                {formatGuessCount(correctCount, totalWithResult)}
              </span>
            </p>
          </div>
          {isComparing && (
            <div className="rounded-lg bg-accent-100 p-4">
              <p className="truncate text-base text-accent-700">
                {comparison.user.name}:{" "}
                <span className="font-bold tabular-nums">
                  {formatGuessCount(compareCorrectCount ?? 0, totalWithResult)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {readOnly && (
        <p className="mb-4 text-sm text-zinc-400">
          Vain lukitut ottelut näkyvissä
        </p>
      )}

      {!readOnly && (
        <div className="mb-4 flex items-center gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-base text-zinc-600">
            <Checkbox
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
            />
            Vain veikattavissa olevat
          </label>
          {unpredicted > 0 && (
            <Badge variant="warning" className="ml-auto">
              {unpredicted} veikkaamatta
            </Badge>
          )}
        </div>
      )}

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
            {stageMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                stageLabel={STAGE_LABELS[match.stage] || match.stage}
                comparison={comparison}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
