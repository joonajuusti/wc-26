"use client";

import { useOptimistic, useTransition } from "react";
import { savePrediction } from "@/actions/predictions";

type MatchWithPrediction = {
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
}: {
  match: MatchWithPrediction;
  stageLabel: string;
}) {
  const [optimisticPrediction, setOptimisticPrediction] = useOptimistic(
    match.prediction,
  );
  const [isPending, startTransition] = useTransition();

  function handlePick(pick: Pick) {
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

  return (
    <div>
      <div className="mb-2 text-xs text-zinc-500 box-border ">
        {stageLabel} &middot; {dateStr} klo {timeStr} {match.locked && "🔒"}
      </div>

      <div className="mt-3 flex gap-3">
        {(["1", "X", "2"] as const).map((option) => {
          const isSelected = optimisticPrediction === option;
          const hasResult = !!match.result;
          const isCorrect = hasResult && option === match.result;

          let buttonClass =
            "min-w-0 flex-1 flex items-center justify-center rounded-md py-3 font-medium ";

          if (!match.locked) {
            buttonClass += "cursor-pointer transition-all active:scale-[0.97] ";
          }

          if (hasResult) {
            if (isCorrect) {
              buttonClass += "bg-green-50 text-green-700 outline-green-500 outline-3 ";
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

          if (!match.locked && isPending && isSelected) {
            buttonClass += "opacity-60 animate-pulse";
          }

          return (
            <button
              key={option}
              className={buttonClass}
              disabled={match.locked || isPending}
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
