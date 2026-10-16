/**
 * Distance for the diner (Reparto 2.3): under 1 km in meters rounded to 50 ("a 650 m", at least
 * "a 50 m"); from 1 km with one decimal and a comma ("a 1,4 km"). 0,98 km rounds to 1000 m, so it
 * is shown as "a 1,0 km".
 */
export function formatDistance(km: number): string {
  const meters = Math.max(50, Math.round((km * 1000) / 50) * 50);
  if (meters < 1000) return `a ${meters} m`;
  const value = (Math.round(km * 10) / 10).toFixed(1).replace('.', ',');
  return `a ${value} km`;
}
