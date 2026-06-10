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

type Pick = "1" | "X" | "2";

const formatLabel = (
  option: Pick,
  { homeLabel, awayLabel }: MatchWithPrediction,
) => {
  if (option === "X") {
    return option;
  }

  return `${option === "1" ? homeLabel : awayLabel}`;
};

export function MatchCard({
  match,
  stageLabel,
}: {
  match: MatchWithPrediction;
  stageLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handlePick(pick: Pick) {
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
    <div>
      <div className="mb-2 text-xs text-zinc-500 box-border ">
        {stageLabel} &middot; {dateStr} klo {timeStr} {match.locked && "🔒"}
      </div>

      <div className="mt-3 flex gap-3">
        {(["1", "X", "2"] as const).map((option) => {
          const isSelected = match.prediction === option;
          const isCorrect = match.result && option === match.result;
          const isWrong = match.result && option !== match.result;

          let buttonClass =
            "flex-1 rounded-md py-4 font-medium transition-colors outline-solid ";

          if (!match.locked) {
            buttonClass += "cursor-pointer ";
          }

          if (isCorrect) {
            buttonClass += "outline-green-500 outline-3 ";

            if (isSelected) {
              buttonClass += "bg-green-500 text-white ";
            }
          } else if (isSelected) {
            if (isWrong) {
              buttonClass += "outline-red-400 outline-3";
            } else {
              buttonClass += "outline-blue-600 outline-3";
            }
          } else {
            buttonClass += "bg-zinc-100 text-zinc-700 outline-zinc-300 ";
          }

          if (match.locked) {
            buttonClass += " opacity-70";
          }

          return (
            <button
              key={option}
              className={buttonClass}
              disabled={match.locked || isPending}
              onClick={() => handlePick(option)}
            >
              {formatLabel(option, match)}
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
