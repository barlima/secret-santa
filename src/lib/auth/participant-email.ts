/**
 * Each participant signs in through Supabase Auth with a synthetic,
 * never-emailed address derived from their participant id. People only
 * ever see their name and their password.
 */
export const PARTICIPANT_EMAIL_DOMAIN = "santa.local";

export function participantEmail(participantId: string): string {
  return `${participantId}@${PARTICIPANT_EMAIL_DOMAIN}`;
}

/** Bounds enforced in the form and again in the Server Actions. */
export const PASSWORD_MIN_LENGTH = 6;
/** Supabase Auth (bcrypt) ignores bytes beyond 72, so longer passwords are refused. */
export const PASSWORD_MAX_LENGTH = 72;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}
