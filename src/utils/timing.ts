import type { Lap, TimingEvent } from '@/types';

export function nowMs(): number {
  return Date.now();
}

export function elapsedMs(startMs: number, pausedMs: number, now: number): number {
  return now - startMs - pausedMs;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatStopwatch(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

export function formatStopwatchShort(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

export function formatDurationPrecise(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function computeLapDuration(lap: Lap): number {
  return lap.override?.overriddenDurationMs ?? lap.durationMs;
}

export function fastestLap(laps: Lap[]): Lap | null {
  if (laps.length === 0) return null;
  return laps.reduce((best, lap) =>
    computeLapDuration(lap) < computeLapDuration(best) ? lap : best
  );
}

export function averageLapMs(laps: Lap[]): number | null {
  if (laps.length === 0) return null;
  const total = laps.reduce((sum, lap) => sum + computeLapDuration(lap), 0);
  return Math.round(total / laps.length);
}

export function findEvent(events: TimingEvent[], id: string): TimingEvent | undefined {
  return events.find((e) => e.id === id);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
