# Implementation Tasks

Status key: `[ ]` = not started · `[x]` = done · `[-]` = in progress

---

## Phase 1 — Foundation ✓ (bootstrapped)

- [x] Vite + Vue 3 + TypeScript project scaffold
- [x] TailwindCSS v4 wired via `@tailwindcss/vite` plugin
- [x] Pinia + pinia-plugin-persistedstate configured
- [x] Vue Router with hash history (GitHub Pages compatible)
- [x] `src/types/index.ts` — full data model (Session, Runner, Interval, Lap, TimingEvent, LapOverride, RunnerRuntimeState)
- [x] `src/utils/timing.ts` — pure timing utilities
- [x] Vitest configured with jsdom + global setup
- [x] `vite.config.ts` with `base: '/interval-coach/'` for GitHub Pages

---

## Phase 2 — Session + Runner Management

- [x] `sessionStore` — create / start / end / clear session
- [x] `runnerStore` — add / update / remove / reorder runners + runtime state cache
- [x] `SetupView` — session name input, add runners with bib, remove runner, start session button
- [ ] Drag-and-drop runner reordering in SetupView
  - Use native HTML5 drag API or a lightweight library (e.g. `vue-draggable-plus`)
  - Call `runnerStore.reorderRunners()` on drop
- [ ] Edit runner name / bib in SetupView (inline or modal)

---

## Phase 3 — Timing Engine

- [x] `timingStore` — startInterval, startRunner, recordFinish, pauseRunner, resumeRunner
- [x] `LiveSessionView` — session elapsed timer (rAF-driven), per-runner elapsed display
- [x] Start Interval button (starts all idle runners)
- [x] Tap-to-finish button per runner
- [x] Pause / Resume toggle per runner
- [ ] Per-runner "start late" button (start individual runner who joined an interval late)
- [ ] Rest phase indicator — show time elapsed since last interval ended
- [ ] Haptic feedback on finish tap (`navigator.vibrate(50)`) for outdoor confirmation

---

## Phase 4 — Lap Edit Capability

- [x] `timingStore.overrideLap()` — attaches LapOverride without mutating original
- [x] `timingStore.clearOverride()` — removes override
- [ ] Edit lap modal / inline input in SummaryView or during session
  - Show original time + corrected time side-by-side
  - Accept `mm:ss` or `mm:ss.t` format input
  - Validate: non-zero, reasonable range (< 1 hour)
- [ ] Visual indicator on laps that have overrides (e.g. pencil icon, original shown greyed)

---

## Phase 5 — Persistence + Restore

- [x] All four stores configured with `persist: true`
- [x] `RunnerRuntimeState` (including `state: 'running'`) persisted in runnerStore
- [x] Session guard in LiveSessionView (redirect to setup if no session)
- [ ] "Resume session" banner on SetupView when an active session exists in storage _(partial — banner shown but runners cleared on "Start Session")_
  - Fix: don't call `clearAll()` on Start if there's an existing active session; only on explicit "New Session"
- [ ] Manual test: refresh mid-interval → runner timer resumes from correct elapsed
- [ ] Manual test: refresh after recording laps → lap list intact in SummaryView

---

## Phase 6 — Summary View

- [x] `SummaryView` — per-runner lap list, fastest lap, average lap time
- [ ] Session total time display
- [ ] Export / share summary as text (copy to clipboard)
- [ ] Fastest lap highlighted across all runners (session-best)

---

## Phase 7 — Testing

- [x] Vitest setup with pinia isolation
- [x] `timing.utils.test.ts` — format, elapsed, fastest, average, override
- [x] `timingStore.test.ts` — interval lifecycle, finish recording, pause accounting, override/clear
- [x] `persistence.test.ts` — state shape and integrity after operations
- [ ] Edge case: recordFinish when runner is paused → should return null, not record
- [ ] Edge case: startInterval with no runners in store → should not throw
- [ ] Edge case: overrideLap with non-existent ID → silent no-op (already handled, add test)
- [ ] runnerStore: reorderRunners test — verify sortOrder values
- [ ] sessionStore: end session sets endedAtMs

---

## Phase 8 — Polish + Deployment (post-MVP)

- [ ] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`)
- [ ] PWA manifest + service worker for offline support
- [ ] Prevent screen sleep during active session (`navigator.wakeLock`)
- [ ] Keyboard shortcut: spacebar = start next interval (desktop coach use)
- [ ] Dark mode already default; verify contrast ratios for outdoor daylight
- [ ] Accessibility: ARIA labels on icon-only buttons
