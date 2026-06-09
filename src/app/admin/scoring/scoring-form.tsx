"use client";

import { useState } from "react";
import { updateScoringRule } from "@/actions/scoring";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Neljännesvälierät (32)",
  r16: "Kahdeksannesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

type Rule = { id: number; stage: string; points: number };

export function ScoringForm({ rules }: { rules: Rule[] }) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(rules.map((r) => [r.stage, r.points]))
  );

  async function handleSave(stage: string) {
    await updateScoringRule(stage, values[stage]);
  }

  return (
    <div className="space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {STAGE_LABELS[rule.stage]}
          </div>
          <input
            type="number"
            min={0}
            value={values[rule.stage] ?? rule.points}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [rule.stage]: parseInt(e.target.value) || 0,
              }))
            }
            className="w-16 rounded border border-zinc-200 bg-white px-2 py-1 text-center text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            onClick={() => handleSave(rule.stage)}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Tallenna
          </button>
        </div>
      ))}
    </div>
  );
}
