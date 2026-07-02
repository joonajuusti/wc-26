import { flagFocus, flagUrl } from "@/lib/flags";

// Renders a country flag as an <img> instead of an emoji character.
//
// Why: Windows (including Chrome) does not ship flag emoji glyphs in the
// Segoe UI Emoji font, so regional-indicator flag emoji render as bare
// two-letter codes. Serving flag images fixes this everywhere.
//
// `code` is the team's 3-letter id (e.g. "MEX", "ENG"). Falls back to the
// code text if there is no known slug.
export function Flag({
  code,
  className = "",
  alt,
}: {
  code: string;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      className={`inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full align-middle ring-1 ring-black/15 ${className}`}
    >
      {/* Plain <img> over next/image: flags are small bundled assets (SVG for
          simple flags, w160 PNG for complex ones) in public/flags/, so
          next/image's fetch-and-reencode pipeline adds overhead with no benefit. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flagUrl(code)}
        alt={alt ?? code}
        title={alt ?? code}
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ objectPosition: `${flagFocus(code)}% 50%` }}
      />
    </span>
  );
}
