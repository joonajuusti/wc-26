"use client";

import { useState } from "react";
import { setMatchResult, setMatchTeams, lockStage, unlockStage } from "@/actions/admin";

const STAGE_LABELS: Record<string, string> = {
  group: "Lohkovaihe",
  r32: "Neljännesvälierät (32)",
  r16: "Kahdeksannesvälierät",
  qf: "Puolivälierät",
  sf: "Välierät",
  third: "Pronssiottelu",
  final: "Finaali",
};

type Team = { id: number; name: string; flagEmoji: string };
type Match = {
  id: number;
  matchNumber: number;
  homeLabel: string;
  awayLabel: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  stage: string;
  kickoffUtc: Date;
  result: string | null;
  locked: boolean;
};

export function AdminMatchList({
  matches,
  teams,
}: {
  matches: Match[];
  teams: Team[];
}) {
  const stages = [...new Set(matches.map((m) => m.stage))];
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all" ? matches : matches.filter((m) => m.stage === filter);

  async function handleResult(matchId: number, result: "1" | "X" | "2") {
    await setMatchResult(matchId, result);
  }

  async function handleTeam(
    matchId: number,
    side: "home" | "away",
    teamId: number | null
  ) {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    if (side === "home") {
      await setMatchTeams(matchId, teamId, match.awayTeamId);
    } else {
      await setMatchTeams(matchId, match.homeTeamId, teamId);
    }
  }

  async function handleLock(stage: string) {
    await lockStage(stage);
  }

  async function handleUnlock(stage: string) {
    await unlockStage(stage);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Kaikki
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            onClick={() => setFilter(stage)}
            className={`rounded-md px-3 py-1 text-xs font-medium ${
              filter === stage
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {STAGE_LABELS[stage]}
          </button>
        ))}
      </div>

      {filter !== "all" && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleLock(filter)}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
          >
            Lukitse {STAGE_LABELS[filter]}
          </button>
          <button
            onClick={() => handleUnlock(filter)}
            className="rounded-md bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
          >
            Avaa {STAGE_LABELS[filter]}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((match) => (
          <div
            key={match.id}
            className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-1 text-xs text-zinc-500">
              P{match.matchNumber} &middot; {STAGE_LABELS[match.stage]}
              {match.locked && (
                <span className="ml-2 text-red-500 font-medium">LUKITTU</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm font-medium">
              <select
                value={match.homeTeamId ?? ""}
                onChange={(e) =>
                  handleTeam(
                    match.id,
                    "home",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">-- {match.homeLabel} --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flagEmoji} {t.name}
                  </option>
                ))}
              </select>

              <span className="text-zinc-400">vs</span>

              <select
                value={match.awayTeamId ?? ""}
                onChange={(e) =>
                  handleTeam(
                    match.id,
                    "away",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="flex-1 rounded border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
              >
                <option value="">-- {match.awayLabel} --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.flagEmoji} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 flex gap-2">
              {(["1", "X", "2"] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => handleResult(match.id, option)}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
                    match.result === option
                      ? "bg-green-500 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {option === "1"
                    ? match.homeLabel.split(" ").slice(-1)
                    : option === "2"
                      ? match.awayLabel.split(" ").slice(-1)
                      : "Tasuri"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
