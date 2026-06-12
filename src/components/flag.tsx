import { flagUrl } from "@/lib/flags";

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
    // Plain <img> over next/image: these are tiny (~1KB) pre-optimized PNGs
    // served from a dedicated flag CDN, so next/image's fetch-and-reencode
    // pipeline would add config overhead with no benefit.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(code)}
      alt={alt ?? code}
      title={alt ?? code}
      loading="lazy"
      // Real flags have varying native aspect ratios (square, 3:2, 4:7, ...).
      // Use a fixed bounding box with object-contain so the footprint stays
      // consistent (buttons line up) while each flag preserves its true
      // proportions — no cropping. Non-fitting flags letterbox within the box.
      className={`inline-block h-5 w-7 shrink-0 object-contain align-middle ${className}`}
    />
  );
}
