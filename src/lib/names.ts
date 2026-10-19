// Pure helpers for displaying names. No imports, so tests/unit can load
// this file directly with Node.

/** "Piotr Wiśniewski" → "PW". */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toLocaleUpperCase();
}

/** "Piotr Wiśniewski" → "Piotr". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/**
 * Display names for chips and lists: first names, falling back to the full
 * name for anyone whose first name is shared ("Jan Nowak", "Jan Kowalski").
 */
export function shortNames<T extends { id: string; full_name: string }>(people: T[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const p of people) {
    const key = firstName(p.full_name).toLocaleLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Map(
    people.map((p) => {
      const first = firstName(p.full_name);
      return [p.id, (counts.get(first.toLocaleLowerCase()) ?? 0) > 1 ? p.full_name : first];
    }),
  );
}
