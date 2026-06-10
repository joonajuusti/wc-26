"use client";

import { useState } from "react";
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
  totalPoints,
  correctCount,
  totalWithResult,
}: {
  matchCards: MatchWithPrediction[];
  readOnly?: boolean;
  showSummary?: boolean;
  totalPoints: number;
  correctCount: number;
  totalWithResult: number;
}) {
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filtered = onlyOpen
    ? matchCards.filter((m) => !m.locked)
    : matchCards;

  const unpredicted = matchCards.filter((m) => !m.locked && !m.prediction).length;

  const groupedByStage = new Map<string, MatchWithPrediction[]>();
  for (const m of filtered) {
    if (!groupedByStage.has(m.stage)) groupedByStage.set(m.stage, []);
    groupedByStage.get(m.stage)!.push(m);
  }

  return (
    <>
      {showSummary && totalWithResult > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Pisteet:{" "}
              <span className="font-bold">{totalPoints}</span>
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Oikein:{" "}
              <span className="font-bold">
                {correctCount}/{totalWithResult}
              </span>
            </p>
          </div>
        </div>
      )}

      {readOnly && (
        <p className="mb-4 text-xs text-zinc-400">
          Vain lukitut ottelut näkyvissä
        </p>
      )}

      {!readOnly && (
        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Vain avoimet
          </label>
          {unpredicted > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {unpredicted} veikkaamatta
            </span>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-400">
          Ei otteluita
        </p>
      )}

      {Array.from(groupedByStage.entries()).map(([stage, stageMatches]) => (
        <div key={stage} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
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
