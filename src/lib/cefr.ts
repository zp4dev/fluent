/**
 * CEFR levels (A1 → C2) for a lesson and for individual vocabulary items.
 *
 * Lives in its own module rather than next to the lesson types because three
 * unrelated layers need it: the prompt (to ask for it), the UI (to colour the
 * chip), and the PDF renderer. None of them should have to import from each
 * other to agree on what "B1" means.
 *
 * The level is deliberately NOT a paid feature. It is the first thing a learner
 * sees about a lesson and the reason a screenshot gets shared — putting it
 * behind the paywall would cost more in reach than it could earn. The Pro
 * boundary stays where it was: the vocabulary depth fields.
 */

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export function isCefrLevel(value: unknown): value is CefrLevel {
  return (
    typeof value === "string" && CEFR_LEVELS.includes(value as CefrLevel)
  );
}

/**
 * First A1–C2 token in a string, however the model dressed it up.
 *
 * The prompt asks for a bare level, but models answer with "b1", "B1+",
 * "B1-B2", "Upper-intermediate (B2)" or "CEFR: B2" often enough that trusting
 * the raw value would put junk straight into a colour lookup and render an
 * unstyled chip. A range collapses to its FIRST level — "B1-B2" means "starts
 * at B1", which is the honest floor to show a learner deciding whether the
 * video is for them.
 *
 * Returns undefined for anything that isn't a level, so callers only ever deal
 * with a valid level or nothing at all.
 */
export function normalizeCefr(value: unknown): CefrLevel | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  // Letter and digit are matched separately so "B 1" and "b-1" still land.
  const match = /([ABC])\s*-?\s*([12])/.exec(value.toUpperCase());

  if (!match) {
    return undefined;
  }

  const candidate = `${match[1]}${match[2]}`;

  return isCefrLevel(candidate) ? candidate : undefined;
}

/**
 * Colour class for a level chip. The colours themselves live in globals.css so
 * each level's light and dark pair sits together in one place.
 *
 * IMPORTANT: colour must never be the only signal — red/green colour blindness
 * is the common kind and it hits exactly the two ends of this scale. Every chip
 * that uses these classes also prints the level text ("B1") next to the colour.
 */
export function cefrChipClass(level: CefrLevel | undefined): string {
  return level ? `cefr-chip cefr-${level.toLowerCase()}` : "cefr-chip cefr-unknown";
}
