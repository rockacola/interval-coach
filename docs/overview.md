# Architecture Overview

## Purpose

This document describes the architectural decisions behind Interval Coach for anyone planning feature work or debugging. Refer to `tasks.md` for the phased implementation checklist.

---

## Core invariant: timestamps are the source of truth

Every meaningful action in the app is recorded as a `TimingEvent` with a wall-clock millisecond timestamp. All derived values — lap durations, elapsed time, runner state — are computed from these events.

**This means:**

- The event log is append-only; existing events are never mutated.
- Refreshing or restoring from storage reconstructs identical state from the same event log.
- Edits are represented as an `LapOverride` record layered on top of the original lap, not by modifying the original.

---

## Data model

```text
TimingEvent          Append-only log of what happened and when
Session              Name, lifecycle status, start/end timestamps
Runner               Identity, display order, bib number
Interval             A single work phase within a session (1…N)
Lap                  One runner's time for one interval
LapOverride          Non-destructive edit layer on a Lap
RunnerRuntimeState   Live running/paused/finished state per runner
```

Key relationships:

- A `Lap` references two `TimingEvent` IDs: its `RUNNER_START` and `RUNNER_FINISH`.
- `RunnerRuntimeState` is _derived_ from events but _cached_ in the runner store for O(1) UI reads.
- The timing store owns events, intervals, and laps. Runner state is owned by the runner store.

---

## State stores

| Store          | Owns                                   | Persisted        |
| -------------- | -------------------------------------- | ---------------- |
| `sessionStore` | Active `Session` record                | yes              |
| `runnerStore`  | `Runner[]`, `RunnerRuntimeState` map   | yes              |
| `timingStore`  | `TimingEvent[]`, `Interval[]`, `Lap[]` | yes              |
| `historyStore` | Archived session snapshots             | yes (future use) |

All stores use `pinia-plugin-persistedstate` with `localStorage`. On page load, all state is restored before the Vue app mounts, so the live session resumes exactly.

**What is NOT persisted:**

- Rest timer ticking (derived from elapsed time since last interval end)
- Animation frame counters
- Vue component-local reactive refs

---

## Timing engine design

The timing engine (`timingStore`) is the most critical module. Key decisions:

### Pause accounting

Paused time is accumulated in `RunnerRuntimeState.totalPausedMs`. When paused, `pausedAtMs` captures the moment. On resume, `totalPausedMs += (now - pausedAtMs)`. Lap duration is `finishMs - startMs - totalPausedMs`.

### Clock discipline

- All timestamps use `Date.now()` (wall-clock ms).
- Functions that record events accept an optional `timestampMs` parameter so tests can inject deterministic values without mocking `Date.now()`.
- The UI uses `requestAnimationFrame` to refresh elapsed display; the timer display is derived state, not the source of truth.

### Multi-runner intervals

`startInterval()` automatically calls `startRunner()` for every runner not already running or paused. Individual runners can be paused or finished independently within an interval.

---

## Routing

Hash history (`createWebHashHistory`) is used throughout so the app works on GitHub Pages without a server-side rewrite rule.

Routes:

- `#/` — Home: add/manage runners

---

## Non-destructive edits

When a coach corrects a lap time:

1. The original `Lap.durationMs` is never changed.
2. A `LapOverride` is attached: `{ originalDurationMs, overriddenDurationMs, editedAtMs, note? }`.
3. `computeLapDuration(lap)` in `utils/timing.ts` checks for an override and returns the effective value.
4. All summary computations go through `computeLapDuration`.

This preserves the audit trail and allows undoing an edit by clearing the override.

---

## Persistence restore correctness

Because all stores are persisted as plain JSON and restored by pinia-plugin-persistedstate before mount:

- `RunnerRuntimeState` (including `state: 'running'`) is restored exactly.
- The elapsed-time display resumes from the correct `currentIntervalStartMs` on the next animation frame.
- No "re-hydration" step is needed; the state is already correct.

**Known limitation:** The rest timer (time since interval ended) is not persisted and resets to zero on refresh. This is intentional — rest is a passive countdown, not a critical timing datum.

---

## Future expansion points

The architecture is designed not to block these without requiring rewrites:

| Future feature             | What's already in place                                          |
| -------------------------- | ---------------------------------------------------------------- |
| Session history / review   | `historyStore` wired but empty; `archiveSession()` ready to call |
| Multi-session selection UI | `Session` has its own ID; `historyStore` is an array             |
| Exported splits            | `TimingEvent[]` and `Lap[]` are already complete records         |
| Offline PWA                | Static build + hash routing; add a service worker                |

---

## Testing strategy

Unit tests live in `src/test/`. All timing utility functions are pure — they receive timestamps as arguments and return deterministic results, making them trivially testable without mocking.

Store tests use `setActivePinia(createPinia())` in `beforeEach` to guarantee isolation.

Tests cover:

- `timing.utils.test.ts` — format functions, elapsed calculation, fastest/average lap
- `timingStore.test.ts` — start interval, record finish, pause/resume accounting, override
- `persistence.test.ts` — state shape correctness after operations (what actually gets persisted)
