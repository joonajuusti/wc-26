"use client";

import { useTransition } from "react";
import { savePrediction } from "@/actions/predictions";

type MatchWithPrediction = {
  id: number;
  homeLabel: string;
  awayLabel: string;
  stage: string;
  kickoffUtc: Date;
  locked: boolean;
  result: string | null;
  prediction: string | null;
};

export function MatchCard({
  match,
  stageLabel,
}: {
  match: MatchWithPrediction;
  stageLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handlePick(pick: "1" | "X" | "2") {
    startTransition(async () => {
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

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
        {stageLabel} &middot; {dateStr} klo {timeStr}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-sm font-medium truncate">
          {match.homeLabel}
        </div>
        <div className="text-xs text-zinc-400">vs</div>
        <div className="flex-1 text-sm font-medium text-right truncate">
          {match.awayLabel}
        </div>
      </div>

      {match.result && (
        <div className="mt-2 text-center text-xs font-medium text-green-600 dark:text-green-400">
          Tulos: {match.result === "1" ? match.homeLabel : match.result === "2" ? match.awayLabel : "Tasapeli"}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {(["1", "X", "2"] as const).map((option) => {
          const isSelected = match.prediction === option;
          const isCorrect = match.result && match.prediction === match.result;
          const isWrong = match.result && match.prediction && match.prediction !== match.result;

          let buttonClass =
            "flex-1 rounded-md py-2 text-sm font-medium transition-colors ";

          if (isSelected && isCorrect) {
            buttonClass += "bg-green-500 text-white";
          } else if (isSelected && isWrong) {
            buttonClass += "bg-red-400 text-white";
          } else if (isSelected) {
            buttonClass += "bg-blue-600 text-white";
          } else {
            buttonClass +=
              "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
          }

          if (match.locked) {
            buttonClass += " cursor-not-allowed opacity-70";
          }

          return (
            <button
              key={option}
              className={buttonClass}
              disabled={match.locked || isPending}
              onClick={() => handlePick(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {match.locked && !match.result && (
        <div className="mt-2 text-center text-xs text-zinc-400">
          Veikkaus lukittu
        </div>
      )}
    </div>
  );
}
