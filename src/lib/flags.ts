// Static map of team id -> flagcdn slug.
// Most slugs are the lowercased ISO 3166-1 alpha-2 code; England and
// Scotland use ISO 3166-2 subdivision slugs ("gb-eng", "gb-sct").
//
// Windows (and Chrome on Windows) do not render regional-indicator flag
// emoji, so we serve flag images from flagcdn instead of relying on the
// emoji font. Kept as a static map so we never touch the database.
export const FLAG_SLUG: Record<string, string> = {
  MEX: "mx",
  RSA: "za",
  KOR: "kr",
  CZE: "cz",
  CAN: "ca",
  BIH: "ba",
  QAT: "qa",
  SUI: "ch",
  BRA: "br",
  MAR: "ma",
  HAI: "ht",
  SCO: "gb-sct",
  USA: "us",
  PAR: "py",
  AUS: "au",
  TUR: "tr",
  GER: "de",
  CUW: "cw",
  CIV: "ci",
  ECU: "ec",
  NED: "nl",
  JPN: "jp",
  SWE: "se",
  TUN: "tn",
  BEL: "be",
  EGY: "eg",
  IRN: "ir",
  NZL: "nz",
  ESP: "es",
  CPV: "cv",
  KSA: "sa",
  URU: "uy",
  FRA: "fr",
  SEN: "sn",
  IRQ: "iq",
  NOR: "no",
  ARG: "ar",
  ALG: "dz",
  AUT: "at",
  JOR: "jo",
  POR: "pt",
  COD: "cd",
  UZB: "uz",
  COL: "co",
  ENG: "gb-eng",
  CRO: "hr",
  GHA: "gh",
  PAN: "pa",
};

export function flagSlug(code: string): string | null {
  return FLAG_SLUG[code.toUpperCase()] ?? null;
}

// w40 = 40px wide PNG. Small enough for in-button display, crisp on hi-dpi.
export function flagUrl(code: string): string {
  const slug = flagSlug(code);
  return `https://flagcdn.com/w40/${slug ?? code.toLowerCase()}.png`;
}
