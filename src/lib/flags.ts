// Static map of team id -> ISO 3166 flag slug.
// Most slugs are the lowercased ISO 3166-1 alpha-2 code; England and
// Scotland use ISO 3166-2 subdivision slugs ("gb-eng", "gb-sct").
//
// Windows (and Chrome on Windows) do not render regional-indicator flag
// emoji, so we serve flag images bundled in public/flags/ instead of
// relying on the emoji font. Kept as a static map so we never touch the
// database.
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

// Complex flags (coats of arms, calligraphy) render poorly as SVG at the
// ~20px display size — too much fine detail in too few pixels. These ship
// as pre-rasterized w160 PNGs instead: smaller files and cleaner at small
// sizes, still crisp at 3x retina. Everything else is SVG (infinitely
// scalable, tiny files for simple geometric flags).
const PNG_FLAGS = new Set([
  "EC",
  "ES",
  "MX",
  "HT",
  "HR",
  "SA",
  "PY",
  "EG",
  "PT",
]);

export function flagUrl(code: string): string {
  const upper = code.toUpperCase();
  const slug = flagSlug(upper);
  const ext = slug && PNG_FLAGS.has(slug.toUpperCase()) ? "png" : "svg";
  return `/flags/${slug ?? code.toLowerCase()}.${ext}`;
}

export const FLAG_FOCUS: Record<string, number> = {
  ALG: 50,
  ARG: 50,
  AUS: 45,
  AUT: 50,
  BEL: 50,
  BIH: 50,
  BRA: 50,
  CAN: 50,
  CIV: 50,
  COD: 0,
  COL: 50,
  CPV: 50,
  CRO: 50,
  CUW: 0,
  CZE: 50,
  ECU: 50,
  EGY: 50,
  ENG: 50,
  ESP: 35,
  FRA: 50,
  GER: 50,
  GHA: 50,
  HAI: 50,
  IRN: 50,
  IRQ: 50,
  JOR: 50,
  JPN: 50,
  KOR: 50,
  KSA: 50,
  MAR: 50,
  MEX: 50,
  NED: 50,
  NOR: 42,
  NZL: 45,
  PAN: 50,
  PAR: 50,
  POR: 30,
  QAT: 35,
  RSA: 50,
  SCO: 50,
  SEN: 50,
  SUI: 50,
  SWE: 42,
  TUN: 50,
  TUR: 25,
  URU: 0,
  USA: 18,
  UZB: 50,
};

export function flagFocus(code: string): number {
  return FLAG_FOCUS[code.toUpperCase()] ?? 50;
}
