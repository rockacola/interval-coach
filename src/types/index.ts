// ─── Identifiers ────────────────────────────────────────────────────────────

export type SessionId = string;
export type RunnerId = string;
export type IntervalId = string;
export type LapId = string;
export type EventId = string;

// ─── Timing events (source of truth) ────────────────────────────────────────

export type TimingEventKind =
  | 'SESSION_START'
  | 'SESSION_PAUSE'
  | 'SESSION_RESUME'
  | 'SESSION_END'
  | 'INTERVAL_START' // global interval start
  | 'RUNNER_START' // individual runner interval start
  | 'RUNNER_FINISH' // tap-to-finish capture
  | 'RUNNER_PAUSE'
  | 'RUNNER_RESUME';

export interface TimingEvent {
  id: EventId;
  kind: TimingEventKind;
  timestampMs: number; // wall-clock ms (Date.now())
  sessionId: SessionId;
  runnerId?: RunnerId;
  intervalId?: IntervalId;
}

// ─── Lap ─────────────────────────────────────────────────────────────────────

export interface Lap {
  id: LapId;
  runnerId: RunnerId;
  intervalId: IntervalId;
  intervalNumber: number; // 1-based display index
  startEventId: EventId; // ref to RUNNER_START or INTERVAL_START event
  finishEventId: EventId; // ref to RUNNER_FINISH event
  startMs: number; // derived from event; duplicated for fast access
  finishMs: number;
  durationMs: number; // finishMs - startMs
  override?: LapOverride;
}

export interface LapOverride {
  originalDurationMs: number;
  overriddenDurationMs: number;
  note?: string;
  editedAtMs: number;
}

// ─── Runner ──────────────────────────────────────────────────────────────────

export type RunnerState = 'idle' | 'running' | 'paused' | 'finished';

export interface Runner {
  deleted?: boolean;
  id: RunnerId;
  name: string;
  bibNumber?: string;
  sortOrder: number;
}

export interface RunnerRuntimeState {
  runnerId: RunnerId;
  state: RunnerState;
  currentIntervalId: IntervalId | null;
  currentIntervalStartMs: number | null;
  pausedAtMs: number | null; // set when paused
  totalPausedMs: number; // accumulated pause duration
}

// ─── Interval ────────────────────────────────────────────────────────────────

export type IntervalPhase = 'work' | 'rest';

export interface Interval {
  id: IntervalId;
  sessionId: SessionId;
  number: number; // 1-based
  phase: IntervalPhase;
  startMs: number;
  endMs: number | null; // null while in progress
}

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'pending' | 'active' | 'paused' | 'ended';

export interface Session {
  id: SessionId;
  name: string;
  status: SessionStatus;
  createdAtMs: number;
  startedAtMs: number | null;
  endedAtMs: number | null;
}

// ─── Session summary (derived, not persisted) ─────────────────────────────

export interface RunnerSummary {
  runner: Runner;
  laps: Lap[];
  completedIntervals: number;
  fastestLapMs: number | null;
  averageLapMs: number | null;
}

export interface SessionSummary {
  session: Session;
  runners: RunnerSummary[];
  totalIntervals: number;
}
