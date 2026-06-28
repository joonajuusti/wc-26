"use client";

import { useOptimistic, useState, useTransition } from "react";
import { savePrediction } from "@/actions/predictions";
import { Flag } from "@/components/flag";
import { LockIcon, AlertIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { type Comparison } from "@/components/predictions-list";

export type MatchWithPrediction = {
  id: number;
  homeCode: string;
  awayCode: string;
  stage: string;
  kickoffUtc: Date;
  locked: boolean;
  result: string | null;
  prediction: string | null;
  allPredictions: Array<{ pick: string; userId: number }>;
};

type Pick = "1" | "X" | "2";

const renderLabel = (option: Pick, match: MatchWithPrediction) => {
  if (option === "X") {
    return option;
  }

  const code = option === "1" ? match.homeCode : match.awayCode;
  const isKnown = code !== "TBD";

  return (
    <>
      {isKnown && <Flag code={code} />}
      <span className="ml-1 tabular-nums">{code}</span>
    </>
  );
};

export function MatchCard({
  match,
  stageLabel,
  comparison,
}: {
  match: MatchWithPrediction;
  stageLabel: string;
  comparison: Comparison;
}) {
  const [optimisticPrediction, setOptimisticPrediction] = useOptimistic(
    match.prediction,
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activePrediction = optimisticPrediction;

  function handlePick(pick: Pick) {
    startTransition(async () => {
      setOptimisticPrediction(pick);
      setError(null);
      try {
        const res = await savePrediction(match.id, pick);
        if (res && "error" in res && res.error) setError(res.error);
      } catch {
        setError("Tallennus epäonnistui, yritä uudelleen");
      }
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

  const needsPrediction =
    !match.locked && !match.result && !match.prediction;

  return (
    <div>
      <div
        className={cn(
          "mb-1.5 inline-flex items-center gap-1.5 rounded-md text-sm",
          needsPrediction
            ? "bg-warning-100 text-warning-700 px-2 py-1.5 -ml-2 "
            : "text-zinc-500",
        )}
      >
        <span>
          {stageLabel} &middot; {dateStr} klo {timeStr}
        </span>
        {match.result ? (
          <CheckIcon className="h-4 w-4 text-success-700" />
        ) : match.locked ? (
          <LockIcon className="h-4 w-4" />
        ) : null}
        {needsPrediction && <AlertIcon className="h-4 w-4" />}
      </div>

      <div className="flex gap-3">
        {(["1", "X", "2"] as const).map((option) => {
          const isSelected = activePrediction === option;
          const hasResult = !!match.result;
          const isCorrect = hasResult && option === match.result;

          const interactive = !match.locked;

          let buttonClass = cn(
            "relative flex min-w-0 flex-1 items-center justify-center rounded-lg py-4 font-medium",
            interactive && "cursor-pointer transition-all active:scale-[0.97]",
          );

          if (hasResult) {
            if (isCorrect && isSelected) {
              buttonClass = cn(
                buttonClass,
                "bg-success-200 text-success-800 ring-2 ring-inset ring-success-500",
              );
            } else if (isCorrect) {
              buttonClass = cn(
                buttonClass,
                "bg-success-100 text-success-700 ring-2 ring-inset ring-success-300",
              );
            } else if (isSelected) {
              buttonClass = cn(
                buttonClass,
                "bg-danger-100 text-danger-700 ring-2 ring-inset ring-danger-400",
              );
            } else {
              buttonClass = cn(buttonClass, "bg-zinc-100 text-zinc-500");
            }
          } else if (isSelected) {
            buttonClass = cn(
              buttonClass,
              match.locked
                ? "bg-primary-100 text-primary-700 ring-2 ring-inset ring-primary-300 opacity-70"
                : "bg-primary-600 text-white shadow-sm",
            );
          } else {
            buttonClass = cn(
              buttonClass,
              match.locked
                ? "bg-zinc-100 text-zinc-700 opacity-70"
                : "bg-zinc-200 text-zinc-700",
            );
          }

          const predictionsForOption = match.allPredictions.filter(
            ({ pick }) => pick === option,
          );

          const isGuessOfComparedPlayer =
            comparison.type === "single-user" &&
            predictionsForOption.find((p) => p.userId === comparison.user.id);

          return (
            <button
              key={option}
              className={buttonClass}
              disabled={match.locked || isPending}
              onClick={() => handlePick(option)}
            >
              {renderLabel(option, match)}
              {comparison.type === "all" && predictionsForOption.length > 0 && (
                <span
                  className={cn(
                    "absolute top-1 right-2",
                    isGuessOfComparedPlayer
                      ? "text-accent-700 font-bold"
                      : "font-light",
                  )}
                >
                  {predictionsForOption.length}
                </span>
              )}
              {isGuessOfComparedPlayer && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-danger-600">
          <AlertIcon className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
