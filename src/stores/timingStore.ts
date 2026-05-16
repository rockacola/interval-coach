import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type {
  Interval,
  IntervalId,
  Lap,
  LapId,
  LapOverride,
  RunnerId,
  SessionId,
  TimingEvent,
  TimingEventKind,
} from '@/types';
import { averageLapMs, fastestLap, generateId, nowMs } from '@/utils/timing';

import { useRunnerStore } from './runnerStore';

export const useTimingStore = defineStore(
  'timing',
  () => {
    const events = ref<TimingEvent[]>([]);
    const intervals = ref<Interval[]>([]);
    const laps = ref<Lap[]>([]);

    const currentIntervalId = ref<IntervalId | null>(null);
    const currentIntervalNumber = ref(0);

    const runnerStore = useRunnerStore();

    // ─── Derived ────────────────────────────────────────────────────────────

    const currentInterval = computed(
      () => intervals.value.find((i) => i.id === currentIntervalId.value) ?? null
    );

    function lapsForRunner(runnerId: RunnerId): Lap[] {
      return laps.value.filter((l) => l.runnerId === runnerId);
    }

    function lapsForInterval(intervalId: IntervalId): Lap[] {
      return laps.value.filter((l) => l.intervalId === intervalId);
    }

    // ─── Event recording ─────────────────────────────────────────────────────

    function recordEvent(
      kind: TimingEventKind,
      sessionId: SessionId,
      runnerId?: RunnerId,
      intervalId?: IntervalId,
      timestampMs?: number
    ): TimingEvent {
      const event: TimingEvent = {
        id: generateId(),
        kind,
        timestampMs: timestampMs ?? nowMs(),
        sessionId,
        runnerId,
        intervalId,
      };
      events.value.push(event);
      return event;
    }

    // ─── Interval management ─────────────────────────────────────────────────

    function startInterval(sessionId: SessionId, timestampMs?: number): Interval {
      const ts = timestampMs ?? nowMs();

      // close previous interval if open
      if (currentIntervalId.value) {
        closeCurrentInterval(ts);
      }

      currentIntervalNumber.value += 1;
      const interval: Interval = {
        id: generateId(),
        sessionId,
        number: currentIntervalNumber.value,
        phase: 'work',
        startMs: ts,
        endMs: null,
      };
      intervals.value.push(interval);
      currentIntervalId.value = interval.id;

      recordEvent('INTERVAL_START', sessionId, undefined, interval.id, ts);

      // Start all idle/finished runners
      runnerStore.runners.forEach((runner) => {
        const state = runnerStore.getRuntimeState(runner.id);
        if (!state || state.state === 'running' || state.state === 'paused') return;
        startRunner(runner.id, sessionId, interval.id, ts);
      });

      return interval;
    }

    function closeCurrentInterval(ts: number): void {
      const interval = intervals.value.find((i) => i.id === currentIntervalId.value);
      if (interval) interval.endMs = ts;
      currentIntervalId.value = null;
    }

    // ─── Per-runner controls ──────────────────────────────────────────────────

    function startRunner(
      runnerId: RunnerId,
      sessionId: SessionId,
      intervalId: IntervalId,
      timestampMs?: number
    ): void {
      const ts = timestampMs ?? nowMs();
      const event = recordEvent('RUNNER_START', sessionId, runnerId, intervalId, ts);
      runnerStore.setRunnerState(runnerId, {
        state: 'running',
        currentIntervalId: intervalId,
        currentIntervalStartMs: ts,
        pausedAtMs: null,
        totalPausedMs: 0,
      });
      void event;
    }

    function recordFinish(
      runnerId: RunnerId,
      sessionId: SessionId,
      timestampMs?: number
    ): Lap | null {
      const ts = timestampMs ?? nowMs();
      const state = runnerStore.getRuntimeState(runnerId);
      if (!state || state.state !== 'running') return null;
      if (!state.currentIntervalId || state.currentIntervalStartMs === null) return null;

      const finishEvent = recordEvent(
        'RUNNER_FINISH',
        sessionId,
        runnerId,
        state.currentIntervalId,
        ts
      );
      const startEvent = events.value.find(
        (e) =>
          e.kind === 'RUNNER_START' &&
          e.runnerId === runnerId &&
          e.intervalId === state.currentIntervalId
      );

      const startMs = state.currentIntervalStartMs;
      const durationMs = ts - startMs - state.totalPausedMs;

      const lap: Lap = {
        id: generateId() as LapId,
        runnerId,
        intervalId: state.currentIntervalId,
        intervalNumber: currentIntervalNumber.value,
        startEventId: startEvent?.id ?? '',
        finishEventId: finishEvent.id,
        startMs,
        finishMs: ts,
        durationMs: Math.max(0, durationMs),
      };
      laps.value.push(lap);

      runnerStore.setRunnerState(runnerId, {
        state: 'finished',
        currentIntervalId: null,
        currentIntervalStartMs: null,
        pausedAtMs: null,
        totalPausedMs: 0,
      });

      return lap;
    }

    function pauseRunner(runnerId: RunnerId, sessionId: SessionId, timestampMs?: number): void {
      const ts = timestampMs ?? nowMs();
      const state = runnerStore.getRuntimeState(runnerId);
      if (!state || state.state !== 'running') return;
      recordEvent('RUNNER_PAUSE', sessionId, runnerId, state.currentIntervalId ?? undefined, ts);
      runnerStore.setRunnerState(runnerId, { state: 'paused', pausedAtMs: ts });
    }

    function resumeRunner(runnerId: RunnerId, sessionId: SessionId, timestampMs?: number): void {
      const ts = timestampMs ?? nowMs();
      const state = runnerStore.getRuntimeState(runnerId);
      if (!state || state.state !== 'paused' || state.pausedAtMs === null) return;
      const pausedDuration = ts - state.pausedAtMs;
      recordEvent('RUNNER_RESUME', sessionId, runnerId, state.currentIntervalId ?? undefined, ts);
      runnerStore.setRunnerState(runnerId, {
        state: 'running',
        pausedAtMs: null,
        totalPausedMs: state.totalPausedMs + pausedDuration,
      });
    }

    // ─── Lap editing ──────────────────────────────────────────────────────────

    function overrideLap(lapId: LapId, newDurationMs: number, note?: string): void {
      const lap = laps.value.find((l) => l.id === lapId);
      if (!lap) return;
      const override: LapOverride = {
        originalDurationMs: lap.override?.originalDurationMs ?? lap.durationMs,
        overriddenDurationMs: newDurationMs,
        note,
        editedAtMs: nowMs(),
      };
      lap.override = override;
    }

    function clearOverride(lapId: LapId): void {
      const lap = laps.value.find((l) => l.id === lapId);
      if (!lap) return;
      delete lap.override;
    }

    // ─── Summary helpers ──────────────────────────────────────────────────────

    function runnerFastestLap(runnerId: RunnerId): Lap | null {
      return fastestLap(lapsForRunner(runnerId));
    }

    function runnerAverageLapMs(runnerId: RunnerId): number | null {
      return averageLapMs(lapsForRunner(runnerId));
    }

    // ─── Reset ────────────────────────────────────────────────────────────────

    function clearAll(): void {
      events.value = [];
      intervals.value = [];
      laps.value = [];
      currentIntervalId.value = null;
      currentIntervalNumber.value = 0;
    }

    return {
      events,
      intervals,
      laps,
      currentIntervalId,
      currentIntervalNumber,
      currentInterval,
      lapsForRunner,
      lapsForInterval,
      recordEvent,
      startInterval,
      startRunner,
      recordFinish,
      pauseRunner,
      resumeRunner,
      overrideLap,
      clearOverride,
      runnerFastestLap,
      runnerAverageLapMs,
      clearAll,
    };
  },
  {
    persist: true,
  }
);
