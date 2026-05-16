import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useRunnerStore } from '@/stores/runnerStore';
import { useTimingStore } from '@/stores/timingStore';

const SESSION_ID = 'session-1';

describe('timingStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setupRunner(name = 'Alice') {
    return useRunnerStore().addRunner(name);
  }

  it('starts an interval and transitions runner to running', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID);

    const state = useRunnerStore().getRuntimeState(runner.id);
    expect(state?.state).toBe('running');
    expect(timing.currentIntervalNumber).toBe(1);
  });

  it('records a finish lap with correct duration', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    const start = 1_000_000;

    timing.startInterval(SESSION_ID, start);
    const finishTs = start + 65_432;
    const lap = timing.recordFinish(runner.id, SESSION_ID, finishTs);

    expect(lap).not.toBeNull();
    expect(lap!.durationMs).toBe(65_432);
    expect(lap!.startMs).toBe(start);
    expect(lap!.finishMs).toBe(finishTs);
  });

  it('accounts for pause duration in lap time', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    const start = 0;

    timing.startInterval(SESSION_ID, start);
    timing.pauseRunner(runner.id, SESSION_ID, 10_000);
    timing.resumeRunner(runner.id, SESSION_ID, 15_000); // 5s paused
    const lap = timing.recordFinish(runner.id, SESSION_ID, 70_000);

    // 70_000 - 0 - 5_000 = 65_000
    expect(lap!.durationMs).toBe(65_000);
  });

  it('does not record finish if runner is not running', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    // No interval started
    const lap = timing.recordFinish(runner.id, SESSION_ID);
    expect(lap).toBeNull();
  });

  it('increments interval counter on each startInterval', () => {
    setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    timing.startInterval(SESSION_ID, 60_000);
    timing.startInterval(SESSION_ID, 120_000);

    expect(timing.currentIntervalNumber).toBe(3);
  });

  it('closes previous interval when new one starts', () => {
    setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    const firstIntervalId = timing.currentIntervalId;
    timing.startInterval(SESSION_ID, 60_000);

    const first = timing.intervals.find((i) => i.id === firstIntervalId);
    expect(first?.endMs).toBe(60_000);
  });

  it('override replaces effective lap duration', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    const lap = timing.recordFinish(runner.id, SESSION_ID, 60_000)!;

    timing.overrideLap(lap.id, 58_000, 'Manual correction');

    expect(lap.override?.overriddenDurationMs).toBe(58_000);
    expect(lap.override?.originalDurationMs).toBe(60_000);
  });

  it('clearOverride restores original duration', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    const lap = timing.recordFinish(runner.id, SESSION_ID, 60_000)!;

    timing.overrideLap(lap.id, 58_000);
    timing.clearOverride(lap.id);

    expect(lap.override).toBeUndefined();
  });

  it('lapsForRunner returns only that runner s laps', () => {
    const alice = setupRunner('Alice');
    const bob = useRunnerStore().addRunner('Bob');
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    timing.recordFinish(alice.id, SESSION_ID, 60_000);

    timing.startInterval(SESSION_ID, 90_000);
    timing.recordFinish(bob.id, SESSION_ID, 150_000);

    expect(timing.lapsForRunner(alice.id)).toHaveLength(1);
    expect(timing.lapsForRunner(bob.id)).toHaveLength(1);
  });
});
