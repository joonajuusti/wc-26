"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MatchCard, type MatchWithPrediction } from "@/components/match-card";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Kahdeksannesvälierät",
  r16: "Neljännesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

export function PredictionsView({
  matchCards,
  readOnly = false,
  showSummary = false,
  correctCount,
  compareCorrectCount,
  totalWithResult,
  allUserNames = [],
  compareName,
}: {
  matchCards: MatchWithPrediction[];
  readOnly?: boolean;
  showSummary?: boolean;
  correctCount: number;
  compareCorrectCount?: number;
  totalWithResult: number;
  allUserNames?: string[];
  compareName?: string;
}) {
  const router = useRouter();
  const [onlyOpen, setOnlyOpen] = useState(false);

  const isComparing = !!compareName;

  function handleCompareChange(name: string) {
    if (name) {
      router.push(`/predictions?vertaile=${encodeURIComponent(name)}`);
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
            className={`h-2 w-2 shrink-0 rounded-full ${
              isComparing ? "bg-violet-400" : "bg-zinc-300"
            }`}
          />
          <span
            className={`shrink-0 text-sm ${
              isComparing ? "text-violet-800" : "text-zinc-500"
            }`}
          >
            Vertaile:
          </span>
          <select
            value={compareName ?? ""}
            onChange={(e) => handleCompareChange(e.target.value)}
            className={`w-auto rounded-md border bg-white px-3 py-2.5 text-sm ${
              isComparing
                ? "border-violet-300 text-violet-800"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            <option value="">Ei vertailua</option>
            {allUserNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showSummary && totalWithResult > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-base text-blue-700">
              {isComparing ? "Sinä: " : "Oikein: "}
              <span className="font-bold">
                {correctCount}/{totalWithResult}
              </span>
            </p>
          </div>
          {isComparing && (
            <div className="rounded-lg bg-violet-50 p-4">
              <p className="truncate text-base text-violet-700">
                {compareName}:{" "}
                <span className="font-bold">
                  {compareCorrectCount ?? 0}/{totalWithResult}
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
          <label className="flex items-center gap-2 text-base text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="h-5 w-5 rounded border-zinc-300"
            />
            Vain veikattavissa olevat
          </label>
          {unpredicted > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
              {unpredicted} veikkaamatta
            </span>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-base text-zinc-400">Ei otteluita</p>
      )}

      {Array.from(groupedByStage.entries()).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-6">
          <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-zinc-600">
            {STAGE_LABELS[stage] || stage}
          </h2>
          <div className="space-y-8">
            {stageMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                stageLabel={STAGE_LABELS[match.stage] || match.stage}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
