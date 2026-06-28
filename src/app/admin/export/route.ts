import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  getUsers,
  getTeamsAndMatches,
  getLockedPredictions,
} from "@/lib/queries";
import { computeStandings } from "@/lib/scoring";
import { STAGE_LABELS } from "@/lib/stages";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user?.isAdmin) redirect("/predictions");

  const [allUsers, { allMatches, allTeams }, lockedByMatch] = await Promise.all([
    getUsers(),
    getTeamsAndMatches(),
    getLockedPredictions(),
  ]);

  const ranked = computeStandings(allUsers, lockedByMatch);
  const pointsByUser = new Map(ranked.map((s) => [s.id, s.points]));

  const teamMap = new Map(allTeams.map((t) => [t.id, t]));
  function teamCode(teamId: string | null): string {
    if (!teamId) return "TBD";
    return teamMap.get(teamId)?.id ?? "TBD";
  }

  const header = [
    "Vaihe",
    "Aika",
    "Koti",
    "Vieras",
    "Tulos",
    ...allUsers.map((u) => escapeCsvField(u.name)),
  ];

  const rows: string[][] = [header];

  for (const match of allMatches) {
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

    const picks = lockedByMatch.get(match.id);
    const pickByUser = new Map(
      (picks ?? []).map((p) => [p.userId, p.pick]),
    );

    rows.push([
      STAGE_LABELS[match.stage] ?? match.stage,
      `${dateStr} ${timeStr}`,
      teamCode(match.homeTeamId),
      teamCode(match.awayTeamId),
      match.result ?? "",
      ...allUsers.map((u) => pickByUser.get(u.id) ?? ""),
    ]);
  }

  rows.push([
    "Pisteet",
    "",
    "",
    "",
    "",
    ...allUsers.map((u) => String(pointsByUser.get(u.id) ?? 0)),
  ]);

  const csv = rows.map((row) => row.join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tulokset.csv"',
    },
  });
}
