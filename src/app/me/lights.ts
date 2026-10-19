export const MIN_BULBS = 6;
export const MAX_BULBS = 12;

/**
 * How many bulbs to draw and how many to light for `joined` of `total`.
 * One bulb per person, between MIN_BULBS and MAX_BULBS. Lit bulbs follow
 * the share of people who joined, but the string is never fully dark while
 * someone has joined, and never fully lit while someone is still missing.
 */
export function bulbLayout(joined: number, total: number): { count: number; lit: number } {
  const count = Math.min(MAX_BULBS, Math.max(MIN_BULBS, total));
  let lit = total > 0 ? Math.round((joined / total) * count) : 0;
  if (joined > 0) lit = Math.max(lit, 1);
  if (joined < total) lit = Math.min(lit, count - 1);
  return { count, lit };
}
