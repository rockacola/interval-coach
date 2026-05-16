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

## Phase 2 — Runner Management

- [x] `runnerStore` — add / update / remove / reorder runners + runtime state cache
- [x] `HomeView` — add runners with bib
- [x] Soft-delete runners (sets `Runner.deleted`; runner identity preserved)
- [x] Restore soft-deleted runners via collapsible removed list (`RemovedRunnersList`)
- [x] Per-runner start/stop timer with recorded interval history (`RunnerCard`)
- [ ] Drag-and-drop runner reordering
  - Use native HTML5 drag API or a lightweight library (e.g. `vue-draggable-plus`)
  - Call `runnerStore.reorderRunners()` on drop
- [x] Edit runner name inline — global edit-mode toggle (pencil icon in header) turns name into live input

---

## Phase 3 — Timing Engine

- [x] `timingStore` — startInterval, startRunner, recordFinish, pauseRunner, resumeRunner
- [ ] Live session view — session elapsed timer (rAF-driven), per-runner elapsed display
- [ ] Start Interval button (starts all idle runners)
- [ ] Tap-to-finish button per runner
- [ ] Pause / Resume toggle per runner
- [ ] Per-runner "start late" button (start individual runner who joined an interval late)
- [ ] Rest phase indicator — show time elapsed since last interval ended
- [ ] Haptic feedback on finish tap (`navigator.vibrate(50)`) for outdoor confirmation

---

## Phase 4 — Lap Edit Capability

- [x] `timingStore.overrideLap()` — attaches LapOverride without mutating original
- [x] `timingStore.clearOverride()` — removes override
- [ ] Edit lap modal / inline input in summary view or during session
  - Show original time + corrected time side-by-side
  - Accept `mm:ss` or `mm:ss.t` format input
  - Validate: non-zero, reasonable range (< 1 hour)
- [ ] Visual indicator on laps that have overrides (e.g. pencil icon, original shown greyed)

---

## Phase 5 — Persistence + Restore

- [x] All five stores configured with `persist: true` (session, runner, timing, history, settings)
- [x] `RunnerRuntimeState` (including `state: 'running'`) persisted in runnerStore
- [ ] Manual test: refresh mid-interval → runner timer resumes from correct elapsed

---

## Phase 6 — Summary View

- [ ] Summary view — per-runner lap list, fastest lap, average lap time
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

## Settings + Session Management

- [x] `settingsStore` — persisted user preferences
- [x] Settings modal (cog icon in header) — time display format toggle (include hours yes/no)
- [x] New session action — archives current state to `historyStore`, resets active stores
- [ ] Session history UI — browse and review past sessions from `historyStore`

---

## Phase 8 — Polish + Deployment (post-MVP)

- [ ] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`)
- [ ] PWA manifest + service worker for offline support
- [ ] Prevent screen sleep during active session (`navigator.wakeLock`)
- [ ] Keyboard shortcut: spacebar = start next interval (desktop coach use)
- [ ] Dark mode already default; verify contrast ratios for outdoor daylight
- [ ] Accessibility: ARIA labels on icon-only buttons
