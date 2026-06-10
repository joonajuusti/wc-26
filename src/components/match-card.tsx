"use client";

import { useOptimistic, useTransition } from "react";
import { savePrediction } from "@/actions/predictions";

export type MatchWithPrediction = {
  id: number;
  homeFlag: string;
  homeCode: string;
  awayFlag: string;
  awayCode: string;
  stage: string;
  kickoffUtc: Date;
  locked: boolean;
  result: string | null;
  prediction: string | null;
};

type Pick = "1" | "X" | "2";

const renderLabel = (option: Pick, match: MatchWithPrediction) => {
  if (option === "X") {
    return option;
  }

  const flag = option === "1" ? match.homeFlag : match.awayFlag;
  const code = option === "1" ? match.homeCode : match.awayCode;

  return (
    <>
      <span className="text-lg">{flag}</span>
      <span className="ml-1">{code}</span>
    </>
  );
};

export function MatchCard({
  match,
  stageLabel,
  readOnly = false,
}: {
  match: MatchWithPrediction;
  stageLabel: string;
  readOnly?: boolean;
}) {
  const [optimisticPrediction, setOptimisticPrediction] = useOptimistic(
    match.prediction,
  );
  const [isPending, startTransition] = useTransition();

  const activePrediction = readOnly ? match.prediction : optimisticPrediction;

  function handlePick(pick: Pick) {
    if (readOnly) return;
    startTransition(async () => {
      setOptimisticPrediction(pick);
      await savePrediction(match.id, pick);
    });
  }

  const kickOff = new Date(match.kickoffUtc);
  const dateStr = kickOff.toLocaleDateString("fi-FI", {
    day: "numeric",
    month: "numeric",
  });
  const timeStr = kickOff.toLocaleTimeString("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Helsinki",
  });

  const needsPrediction = !match.locked && !match.result && !match.prediction && !readOnly;

  return (
    <div>
      <div className={`mb-1.5 text-xs inline-flex items-center gap-1 rounded px-2 py-1 -ml-2 ${
        needsPrediction
          ? "bg-amber-100 text-amber-700"
          : "text-zinc-500"
      }`}>
        {stageLabel} &middot; {dateStr} klo {timeStr} {match.locked && "🔒"}{needsPrediction && "⚠️"}
      </div>

      <div className="flex gap-3">
        {(["1", "X", "2"] as const).map((option) => {
          const isSelected = activePrediction === option;
          const hasResult = !!match.result;
          const isCorrect = hasResult && option === match.result;

          let buttonClass =
            "min-w-0 flex-1 flex items-center justify-center rounded-md py-3 font-medium ";

          if (!match.locked && !readOnly) {
            buttonClass += "cursor-pointer transition-all active:scale-[0.97] ";
          }

          if (hasResult) {
            if (isCorrect && isSelected) {
              buttonClass += "bg-green-100 text-green-800 outline-green-600 outline-3 ";
            } else if (isCorrect) {
              buttonClass += "bg-green-50 text-green-600 outline-green-300 outline-2 ";
            } else if (isSelected) {
              buttonClass += "bg-red-50 text-red-700 outline-red-400 outline-3 ";
            } else {
              buttonClass += "bg-zinc-100 text-zinc-400 outline-zinc-200 ";
            }
          } else if (isSelected) {
            buttonClass += match.locked
              ? "bg-blue-50 text-blue-700 outline-blue-600 outline-3 opacity-70 "
              : "bg-blue-600 text-white outline-blue-600 outline-3 ";
          } else {
            buttonClass += "bg-zinc-100 text-zinc-700 ";
            if (match.locked) {
              buttonClass += "opacity-70 ";
            }
          }

          return (
            <button
              key={option}
              className={buttonClass}
              disabled={match.locked || isPending || readOnly}
              onClick={() => handlePick(option)}
            >
              {renderLabel(option, match)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
