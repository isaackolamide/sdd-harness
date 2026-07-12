import { formatDate } from './date';

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15); // Jan 15, 2024
    expect(formatDate(date)).toBe('2024-01-15');
  });

  it('zero-pads single-digit month and day', () => {
    const date = new Date(2023, 5, 7); // Jun 7, 2023
    expect(formatDate(date)).toBe('2023-06-07');
  });

  it('handles December 31', () => {
    const date = new Date(2022, 11, 31); // Dec 31, 2022
    expect(formatDate(date)).toBe('2022-12-31');
  });

  it('returns a string', () => {
    const result = formatDate(new Date(2024, 3, 1));
    expect(typeof result).toBe('string');
  });
});
