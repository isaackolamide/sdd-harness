/**
 * Formats a Date as an ISO 8601 date string (YYYY-MM-DD).
 *
 * Pure function — no side effects, no external dependencies.
 *
 * @param date - The date to format.
 * @returns A string in the form "YYYY-MM-DD".
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
