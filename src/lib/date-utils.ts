const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Adds whole calendar days to a `YYYY-MM-DD` date string.
 *
 * The arithmetic is done in UTC so a plain date (which has no time or timezone)
 * never shifts a day because of the viewer's local offset or DST.
 */
export function addDaysToIsoDate(iso: string, days: number): string {
  const match = ISO_DATE_PATTERN.exec(iso.trim());
  if (!match) return iso;

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  if (Number.isNaN(date.getTime())) return iso;

  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
