import type { DistanceUnit } from '@/stores/settingsStore';

const KM_PER_MILE = 1.60934;

export function kmToDisplay(km: number, unit: DistanceUnit): number {
  return unit === 'mi' ? km / KM_PER_MILE : km;
}

export function displayToKm(value: number, unit: DistanceUnit): number {
  return unit === 'mi' ? value * KM_PER_MILE : value;
}
