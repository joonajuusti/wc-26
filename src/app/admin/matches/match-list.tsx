"use client";

import { useState, useTransition } from "react";
import {
  setMatchResult,
  setMatchTeams,
  lockStage,
  unlockStage,
  lockMatch,
  unlockMatch,
} from "@/actions/admin";
import { STAGE_LABELS } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, Checkbox } from "@/components/ui/form";
import { LockIcon, UnlockIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type Team = { id: string; name: string; flagEmoji: string };
type Match = {
  id: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  stage: string;
  kickoffUtc: Date;
  result: string | null;
  locked: boolean;
};

function label(teamId: string | null, teams: Team[]): string {
  if (!teamId) return "TBD";
  const t = teams.find((t) => t.id === teamId);
  return t ? `${t.id} ${t.name}` : "TBD";
}

function short(teamId: string | null, teams: Team[]): string {
  if (!teamId) return "TBD";
  const t = teams.find((t) => t.id === teamId);
  return t ? t.name : "TBD";
}

export function AdminMatchList({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const stages = [...new Set(matches.map((m) => m.stage))];
  const [filter, setFilter] = useState<string>("all");
  const [hideResolved, setHideResolved] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  let filtered =
    filter === "all" ? matches : matches.filter((m) => m.stage === filter);

  if (hideResolved) {
    filtered = filtered.filter((m) => !m.result);
  }

  function handleResult(matchId: number, result: "1" | "X" | "2") {
    startTransition(async () => {
      setPendingAction(`result-${matchId}`);
      await setMatchResult(matchId, result);
      setPendingAction(null);
    });
  }

  function handleTeam(
    matchId: number,
    side: "home" | "away",
    teamId: string | null,
  ) {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    startTransition(async () => {
      setPendingAction(`team-${matchId}`);
      if (side === "home") {
        await setMatchTeams(matchId, teamId, match.awayTeamId);
      } else {
        await setMatchTeams(matchId, match.homeTeamId, teamId);
      }
      setPendingAction(null);
    });
  }

  function handleLock(stage: string) {
    startTransition(async () => {
      setPendingAction(`lock-${stage}`);
      await lockStage(stage);
      setPendingAction(null);
    });
  }

  function handleUnlock(stage: string) {
    startTransition(async () => {
      setPendingAction(`unlock-${stage}`);
      await unlockStage(stage);
      setPendingAction(null);
    });
  }

  function handleLockMatch(matchId: number) {
    startTransition(async () => {
      setPendingAction(`lockmatch-${matchId}`);
      await lockMatch(matchId);
      setPendingAction(null);
    });
  }

  function handleUnlockMatch(matchId: number) {
    startTransition(async () => {
      setPendingAction(`unlockmatch-${matchId}`);
      await unlockMatch(matchId);
      setPendingAction(null);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Kaikki
        </Button>
        {stages.map((stage) => (
          <Button
            key={stage}
            variant={filter === stage ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(stage)}
          >
            {STAGE_LABELS[stage]}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3">
        {filter !== "all" && (
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleLock(filter)}
              disabled={isPending}
            >
              {pendingAction === `lock-${filter}`
                ? "Lukitaan..."
                : `Lukitse ${STAGE_LABELS[filter]}`}
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => handleUnlock(filter)}
              disabled={isPending}
            >
              {pendingAction === `unlock-${filter}`
                ? "Avataan..."
                : `Avaa ${STAGE_LABELS[filter]}`}
            </Button>
          </div>
        )}
        <label className="ml-auto flex cursor-pointer select-none items-center gap-1.5 text-xs text-zinc-600">
          <Checkbox
            checked={hideResolved}
            onChange={(e) => setHideResolved(e.target.checked)}
          />
          Piilota ratkaistut
        </label>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-400">Ei otteluita</p>
      )}

      <div className="space-y-3">
        {filtered.map((match) => {
          const teamPending = pendingAction === `team-${match.id}`;
          const resultPending = pendingAction === `result-${match.id}`;
          const lockPending =
            pendingAction === `lockmatch-${match.id}` ||
            pendingAction === `unlockmatch-${match.id}`;

          return (
            <Card key={match.id} className="p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                <span className="tabular-nums">
                  P{match.id} &middot; {STAGE_LABELS[match.stage]}
                </span>
                {match.locked && (
                  <Badge variant="danger" size="sm">
                    LUKITTU
                  </Badge>
                )}
                <Button
                  variant={match.locked ? "success" : "secondary"}
                  size="xs"
                  className="ml-auto"
                  onClick={() =>
                    match.locked
                      ? handleUnlockMatch(match.id)
                      : handleLockMatch(match.id)
                  }
                  disabled={isPending}
                >
                  {lockPending ? (
                    "..."
                  ) : match.locked ? (
                    <>
                      <UnlockIcon className="h-3 w-3" />
                      Avaa
                    </>
                  ) : (
                    <>
                      <LockIcon className="h-3 w-3" />
                      Lukitse
                    </>
                  )}
                </Button>
              </div>

              <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <Select
                  size="xs"
                  value={match.homeTeamId ?? ""}
                  onChange={(e) =>
                    handleTeam(match.id, "home", e.target.value || null)
                  }
                  disabled={teamPending}
                  className="min-w-0 flex-1"
                >
                  <option value="">
                    -- {label(match.homeTeamId, teams)} --
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} {t.name}
                    </option>
                  ))}
                </Select>

                <span className="shrink-0 text-zinc-400">vs</span>

                <Select
                  size="xs"
                  value={match.awayTeamId ?? ""}
                  onChange={(e) =>
                    handleTeam(match.id, "away", e.target.value || null)
                  }
                  disabled={teamPending}
                  className="min-w-0 flex-1"
                >
                  <option value="">
                    -- {label(match.awayTeamId, teams)} --
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} {t.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="mt-2 flex gap-2">
                {(["1", "X", "2"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleResult(match.id, option)}
                    disabled={resultPending}
                    className={cn(
                      "flex-1 rounded-md py-1.5 text-xs font-medium transition-all active:scale-[0.97] disabled:opacity-50",
                      match.result === option
                        ? "bg-success-700 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                      resultPending && "animate-pulse",
                    )}
                  >
                    {option === "1"
                      ? short(match.homeTeamId, teams)
                      : option === "2"
                        ? short(match.awayTeamId, teams)
                        : "Tasapeli"}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
