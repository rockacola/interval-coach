import { describe, expect, it } from 'vitest';

import type { Lap, TimingEvent } from '@/types';
import {
  averageLapMs,
  computeLapDuration,
  elapsedMs,
  fastestLap,
  findEvent,
  formatDuration,
  formatDurationPrecise,
  formatStopwatch,
  formatStopwatchShort,
} from '@/utils/timing';

function makeLap(durationMs: number, overriddenMs?: number): Lap {
  return {
    id: 'test-lap',
    runnerId: 'r1',
    intervalId: 'i1',
    intervalNumber: 1,
    startEventId: 'e1',
    finishEventId: 'e2',
    startMs: 0,
    finishMs: durationMs,
    durationMs,
    override:
      overriddenMs !== undefined
        ? {
            originalDurationMs: durationMs,
            overriddenDurationMs: overriddenMs,
            editedAtMs: Date.now(),
          }
        : undefined,
  };
}

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45_000)).toBe('00:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(90_500)).toBe('01:30');
  });

  it('formats hours', () => {
    expect(formatDuration(3_661_000)).toBe('1:01:01');
  });

  it('clamps negative to zero', () => {
    expect(formatDuration(-5000)).toBe('00:00');
  });
});

describe('formatDurationPrecise', () => {
  it('includes tenths', () => {
    expect(formatDurationPrecise(65_300)).toBe('01:05.3');
  });

  it('shows zero tenths', () => {
    expect(formatDurationPrecise(60_000)).toBe('01:00.0');
  });
});

describe('elapsedMs', () => {
  it('subtracts start and paused time', () => {
    expect(elapsedMs(1000, 500, 3000)).toBe(1500);
  });

  it('returns correct elapsed with no pause', () => {
    expect(elapsedMs(0, 0, 5000)).toBe(5000);
  });
});

describe('computeLapDuration', () => {
  it('returns recorded duration when no override', () => {
    const lap = makeLap(60_000);
    expect(computeLapDuration(lap)).toBe(60_000);
  });

  it('returns override when present', () => {
    const lap = makeLap(60_000, 58_000);
    expect(computeLapDuration(lap)).toBe(58_000);
  });
});

describe('fastestLap', () => {
  it('returns null for empty array', () => {
    expect(fastestLap([])).toBeNull();
  });

  it('returns the single lap', () => {
    const lap = makeLap(60_000);
    expect(fastestLap([lap])).toBe(lap);
  });

  it('finds the fastest', () => {
    const slow = makeLap(90_000);
    const fast = makeLap(55_000);
    const med = makeLap(70_000);
    expect(fastestLap([slow, fast, med])).toBe(fast);
  });

  it('uses override duration when comparing', () => {
    const a = makeLap(60_000); // 60s recorded
    const b = makeLap(90_000, 50_000); // 90s recorded, 50s override
    expect(fastestLap([a, b])).toBe(b);
  });
});

describe('averageLapMs', () => {
  it('returns null for empty array', () => {
    expect(averageLapMs([])).toBeNull();
  });

  it('computes average', () => {
    const laps = [makeLap(60_000), makeLap(80_000)];
    expect(averageLapMs(laps)).toBe(70_000);
  });

  it('rounds to nearest ms', () => {
    const laps = [makeLap(60_000), makeLap(61_000), makeLap(62_000)];
    expect(averageLapMs(laps)).toBe(61_000);
  });
});

describe('formatStopwatch', () => {
  it('formats HH:mm:ss.SSS', () => {
    expect(formatStopwatch(65_432)).toBe('00:01:05.432');
  });

  it('pads hours, minutes, seconds, milliseconds', () => {
    expect(formatStopwatch(3_661_001)).toBe('01:01:01.001');
  });

  it('formats sub-second correctly', () => {
    expect(formatStopwatch(432)).toBe('00:00:00.432');
  });

  it('formats zero as all zeroes', () => {
    expect(formatStopwatch(0)).toBe('00:00:00.000');
  });

  it('clamps negative to zero', () => {
    expect(formatStopwatch(-1000)).toBe('00:00:00.000');
  });
});

describe('formatStopwatchShort', () => {
  it('formats mm:ss.SSS', () => {
    expect(formatStopwatchShort(65_432)).toBe('01:05.432');
  });

  it('formats sub-second correctly', () => {
    expect(formatStopwatchShort(432)).toBe('00:00.432');
  });

  it('formats zero as all zeroes', () => {
    expect(formatStopwatchShort(0)).toBe('00:00.000');
  });

  it('clamps negative to zero', () => {
    expect(formatStopwatchShort(-500)).toBe('00:00.000');
  });

  it('wraps minutes past 60 without hour segment', () => {
    expect(formatStopwatchShort(3_660_000)).toBe('61:00.000');
  });
});

describe('findEvent', () => {
  function makeEvent(id: string): TimingEvent {
    return { id, kind: 'RUNNER_FINISH', timestampMs: 0, sessionId: 's1' };
  }

  it('returns the matching event', () => {
    const e = makeEvent('abc');
    expect(findEvent([makeEvent('x'), e, makeEvent('y')], 'abc')).toBe(e);
  });

  it('returns undefined when not found', () => {
    expect(findEvent([makeEvent('a'), makeEvent('b')], 'z')).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(findEvent([], 'any')).toBeUndefined();
  });
});
