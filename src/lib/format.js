export function formatItemNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return String(value || '');
  }
  return String(Math.trunc(number)).padStart(2, '0');
}
