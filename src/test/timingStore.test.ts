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

  it('runnerFastestLap returns the shortest lap for a runner', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    timing.recordFinish(runner.id, SESSION_ID, 70_000);
    timing.startInterval(SESSION_ID, 90_000);
    timing.recordFinish(runner.id, SESSION_ID, 145_000); // 55s

    expect(timing.runnerFastestLap(runner.id)?.durationMs).toBe(55_000);
  });

  it('runnerFastestLap returns null with no laps', () => {
    const runner = setupRunner();
    expect(useTimingStore().runnerFastestLap(runner.id)).toBeNull();
  });

  it('runnerAverageLapMs returns mean of runner laps', () => {
    const runner = setupRunner();
    const timing = useTimingStore();

    timing.startInterval(SESSION_ID, 0);
    timing.recordFinish(runner.id, SESSION_ID, 60_000);
    timing.startInterval(SESSION_ID, 80_000);
    timing.recordFinish(runner.id, SESSION_ID, 140_000); // 60s again

    expect(timing.runnerAverageLapMs(runner.id)).toBe(60_000);
  });

  it('runnerAverageLapMs returns null with no laps', () => {
    const runner = setupRunner();
    expect(useTimingStore().runnerAverageLapMs(runner.id)).toBeNull();
  });

  it('startRunnerTimer sets runner state to running', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 1_000);
    expect(useRunnerStore().getRuntimeState(runner.id)?.state).toBe('running');
  });

  it('startRunnerTimer is a no-op if already running', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 1_000);
    timing.startRunnerTimer(runner.id, 2_000);
    expect(useRunnerStore().getRuntimeState(runner.id)?.currentIntervalStartMs).toBe(1_000);
  });

  it('stopRunnerTimer records a RunnerInterval and returns it', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 0);
    const interval = timing.stopRunnerTimer(runner.id, 30_000);
    expect(interval).not.toBeNull();
    expect(interval!.startMs).toBe(0);
    expect(interval!.stopMs).toBe(30_000);
    expect(interval!.runnerId).toBe(runner.id);
  });

  it('stopRunnerTimer returns null if runner is not running', () => {
    const runner = setupRunner();
    expect(useTimingStore().stopRunnerTimer(runner.id, 1_000)).toBeNull();
  });

  it('intervalsForRunner returns only that runner intervals', () => {
    const alice = setupRunner('Alice');
    const bob = useRunnerStore().addRunner('Bob');
    const timing = useTimingStore();
    timing.startRunnerTimer(alice.id, 0);
    timing.stopRunnerTimer(alice.id, 30_000);
    timing.startRunnerTimer(bob.id, 0);
    timing.stopRunnerTimer(bob.id, 25_000);
    expect(timing.intervalsForRunner(alice.id)).toHaveLength(1);
    expect(timing.intervalsForRunner(bob.id)).toHaveLength(1);
  });

  it('adjustRunnerIntervalStop shifts stopMs by delta', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 0);
    const interval = timing.stopRunnerTimer(runner.id, 30_000)!;
    timing.adjustRunnerIntervalStop(interval.id, 5_000);
    expect(interval.stopMs).toBe(35_000);
  });

  it('adjustRunnerIntervalStop does not go below startMs', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 10_000);
    const interval = timing.stopRunnerTimer(runner.id, 11_000)!;
    timing.adjustRunnerIntervalStop(interval.id, -9_000);
    expect(interval.stopMs).toBe(10_000);
  });

  it('removeRunnerInterval deletes the interval', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startRunnerTimer(runner.id, 0);
    const interval = timing.stopRunnerTimer(runner.id, 30_000)!;
    timing.removeRunnerInterval(interval.id);
    expect(timing.intervalsForRunner(runner.id)).toHaveLength(0);
  });

  it('clearAll resets all timing state', () => {
    const runner = setupRunner();
    const timing = useTimingStore();
    timing.startInterval(SESSION_ID, 0);
    timing.recordFinish(runner.id, SESSION_ID, 60_000);
    timing.clearAll();
    expect(timing.events).toHaveLength(0);
    expect(timing.laps).toHaveLength(0);
    expect(timing.intervals).toHaveLength(0);
    expect(timing.currentIntervalId).toBeNull();
    expect(timing.currentIntervalNumber).toBe(0);
  });

  it('intervalDistanceKm defaults to null', () => {
    expect(useTimingStore().intervalDistanceKm).toBeNull();
  });

  it('setIntervalDistance stores the value', () => {
    const timing = useTimingStore();
    timing.setIntervalDistance(1.5);
    expect(timing.intervalDistanceKm).toBe(1.5);
  });

  it('setIntervalDistance can be cleared back to null', () => {
    const timing = useTimingStore();
    timing.setIntervalDistance(5);
    timing.setIntervalDistance(null);
    expect(timing.intervalDistanceKm).toBeNull();
  });

  it('clearAll resets intervalDistanceKm', () => {
    const timing = useTimingStore();
    timing.setIntervalDistance(3);
    timing.clearAll();
    expect(timing.intervalDistanceKm).toBeNull();
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
