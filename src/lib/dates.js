export const TODAY = '2026-10-28';

export const addYears = (s, n) => {
  const d = new Date(s + 'T00:00:00Z');
  d.setUTCFullYear(d.getUTCFullYear() + n);
  return d.toISOString().slice(0, 10);
};
export const addDays = (s, n) => new Date(Date.parse(s) + n * 864e5).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
export const fmt = (s) =>
  s ? new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '—';
export const termOf = (s, e) => {
  for (let n = 1; n <= 5; n++) if (addYears(s, n) === e) return String(n);
  return 'custom';
};
