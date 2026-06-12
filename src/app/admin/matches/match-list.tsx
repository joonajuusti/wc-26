"use client";

import { useState, useTransition } from "react";
import { setMatchResult, setMatchTeams, lockStage, unlockStage, lockMatch, unlockMatch } from "@/actions/admin";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Kahdeksannesvälierät",
  r16: "Neljännesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

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
  const [hideResolved, setHideResolved] = useState(false);
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
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-all active:scale-[0.97] ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Kaikki
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilter(stage)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all active:scale-[0.97] ${
              filter === stage
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {STAGE_LABELS[stage]}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3">
        {filter !== "all" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleLock(filter)}
              disabled={isPending}
              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-all active:scale-[0.97] hover:bg-red-600 disabled:opacity-50"
            >
              {pendingAction === `lock-${filter}` ? "Lukitaan..." : `Lukitse ${STAGE_LABELS[filter]}`}
            </button>
            <button
              onClick={() => handleUnlock(filter)}
              disabled={isPending}
              className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-all active:scale-[0.97] hover:bg-green-600 disabled:opacity-50"
            >
              {pendingAction === `unlock-${filter}` ? "Avataan..." : `Avaa ${STAGE_LABELS[filter]}`}
            </button>
          </div>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={hideResolved}
            onChange={(e) => setHideResolved(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Piilota ratkaistut
        </label>
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-400">
          Ei otteluita
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((match) => {
          const teamPending = pendingAction === `team-${match.id}`;
          const resultPending = pendingAction === `result-${match.id}`;
          const lockPending =
            pendingAction === `lockmatch-${match.id}` ||
            pendingAction === `unlockmatch-${match.id}`;

          return (
            <div
              key={match.id}
              className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm "
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                <span>
                  P{match.id} &middot; {STAGE_LABELS[match.stage]}
                </span>
                {match.locked && (
                  <span className="text-red-500 font-medium">LUKITTU</span>
                )}
                {match.result && (
                  <span className="text-green-600 font-medium">Tulos: {match.result}</span>
                )}
                <button
                  onClick={() =>
                    match.locked
                      ? handleUnlockMatch(match.id)
                      : handleLockMatch(match.id)
                  }
                  disabled={isPending}
                  className={`ml-auto rounded-md px-2 py-0.5 text-xs font-medium text-white transition-all active:scale-[0.97] disabled:opacity-50 ${
                    match.locked
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-zinc-400 hover:bg-zinc-500"
                  } ${lockPending ? "opacity-50 animate-pulse" : ""}`}
                >
                  {lockPending
                    ? "..."
                    : match.locked
                      ? "Avaa"
                      : "Lukitse"}
                </button>
              </div>

              <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <select
                  value={match.homeTeamId ?? ""}
                  onChange={(e) =>
                    handleTeam(
                      match.id,
                      "home",
                      e.target.value || null,
                    )
                  }
                  disabled={teamPending}
                  className="min-w-0 flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                >
                  <option value="">-- {label(match.homeTeamId, teams)} --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} {t.name}
                    </option>
                  ))}
                </select>

                <span className="text-zinc-400 shrink-0">vs</span>

                <select
                  value={match.awayTeamId ?? ""}
                  onChange={(e) =>
                    handleTeam(
                      match.id,
                      "away",
                      e.target.value || null,
                    )
                  }
                  disabled={teamPending}
                  className="min-w-0 flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
                >
                  <option value="">-- {label(match.awayTeamId, teams)} --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2 flex gap-2">
                {(["1", "X", "2"] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => handleResult(match.id, option)}
                    disabled={resultPending}
                    className={`flex-1 rounded py-1.5 text-xs font-medium transition-all active:scale-[0.97] ${
                      match.result === option
                        ? "bg-green-500 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    } ${resultPending ? "opacity-50 animate-pulse" : ""}`}
                  >
                    {option === "1"
                      ? short(match.homeTeamId, teams)
                      : option === "2"
                        ? short(match.awayTeamId, teams)
                        : "Tasapeli"}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
