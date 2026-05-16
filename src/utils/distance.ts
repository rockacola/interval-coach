import type { DistanceUnit } from '@/stores/settingsStore';

const KM_PER_MILE = 1.60934;

export function kmToDisplay(km: number, unit: DistanceUnit): number {
  return unit === 'mi' ? km / KM_PER_MILE : km;
}

export function displayToKm(value: number, unit: DistanceUnit): number {
  return unit === 'mi' ? value * KM_PER_MILE : value;
}

export function formatDistance(km: number, unit: DistanceUnit): string {
  return parseFloat(kmToDisplay(km, unit).toFixed(2)).toString();
}

export function formatPace(durationMs: number, distanceKm: number, unit: DistanceUnit): string {
  const distanceInUnit = kmToDisplay(distanceKm, unit);
  const paceMinutes = durationMs / 1000 / 60 / distanceInUnit;
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${String(secs).padStart(2, '0')}/${unit}`;
}
