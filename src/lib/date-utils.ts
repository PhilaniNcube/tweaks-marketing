const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Adds whole working days (Monday–Friday) to a `YYYY-MM-DD` date string.
 *
 * If the start date falls on a weekend, counting begins from the next Monday.
 * The arithmetic is done in UTC so a plain date (which has no time or timezone)
 * never shifts a day because of the viewer's local offset or DST.
 */
export function addWorkingDaysToIsoDate(
  iso: string,
  workingDays: number
): string {
  const match = ISO_DATE_PATTERN.exec(iso.trim());
  if (!match) return iso;

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  if (Number.isNaN(date.getTime())) return iso;

  let remaining = Math.max(0, Math.ceil(workingDays));
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    const dayOfWeek = date.getUTCDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--;
    }
  }
  return date.toISOString().slice(0, 10);
}
