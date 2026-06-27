export type FormMark = "correct" | "wrong" | "pending";

export const FORM_WINDOW = 5;

export type FormWindowMatch = {
  matchId: number;
  result: string;
  kickoffUtc: Date;
};

export type FormPickLookup = ReadonlyMap<
  number,
  ReadonlyMap<number, string>
>;

export function getFormWindow(
  byMatch: ReadonlyMap<number, ReadonlyArray<{ result: string | null; kickoffUtc: Date }>>,
): FormWindowMatch[] {
  return Array.from(byMatch.entries())
    .filter(([, preds]) => preds.length > 0 && preds[0].result !== null)
    .map(([matchId, preds]) => ({
      matchId,
      result: preds[0].result as string,
      kickoffUtc: preds[0].kickoffUtc,
    }))
    .sort((a, b) => a.kickoffUtc.getTime() - b.kickoffUtc.getTime())
    .slice(-FORM_WINDOW);
}

export function computeRecentForm(
  userId: number,
  windowMatches: ReadonlyArray<FormWindowMatch>,
  picksByMatch: ReadonlyMap<number, ReadonlyMap<number, string>>,
): FormMark[] {
  const marks: FormMark[] = windowMatches.map((m) => {
    const pick = picksByMatch.get(m.matchId)?.get(userId);
    if (!pick) return "pending";
    return pick === m.result ? "correct" : "wrong";
  });
  while (marks.length < FORM_WINDOW) marks.push("pending");
  return marks;
}
