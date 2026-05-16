# Interval Coach

A mobile-first web app for running coaches to manage live interval training sessions — track intervals, capture split times, and review session summaries without a backend.

## What it is

Interval Coach is a **real-time operational tool** for use during track or field sessions. A coach manages a group of runners, starts intervals, and taps to record each runner's finish. The app runs entirely in the browser with full offline support.

It is **not** a fitness tracker, GPS logger, or training planner.

## Key design principles

- **Timestamps are the source of truth.** All timing is based on `Date.now()` ms values stored in an immutable event log. UI state is derived, never primary.
- **Edits never destroy original data.** Corrected lap times sit in an override layer; the raw recorded event is always preserved.
- **Optimised for outdoor, one-handed, pressure use.** Large tap targets, high-contrast display, minimal steps to core actions.

## Tech stack

| Layer     | Choice                              |
| --------- | ----------------------------------- |
| Framework | Vue 3 (Composition API)             |
| Build     | Vite                                |
| Language  | TypeScript                          |
| Styles    | Tailwind CSS v4                     |
| State     | Pinia + pinia-plugin-persistedstate |
| Routing   | Vue Router (hash history)           |
| Tests     | Vitest                              |
| Deploy    | GitHub Pages                        |

## Getting started

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run test         # run all tests
npm run build        # production build → dist/
npm run preview      # preview production build locally
```

## Project structure

```text
src/
├── types/          # TypeScript models (Session, Runner, Lap, TimingEvent, …)
├── stores/         # Pinia stores (session, runner, timing, history, settings)
├── utils/          # Pure timing utilities (deterministic, fully tested)
├── views/          # Page-level Vue components
├── components/     # Shared UI components
├── router/         # Vue Router config
├── test/           # Vitest unit tests
└── assets/         # CSS entry point
```

## Data model summary

```text
Session
  └─ Interval (work phase, 1…N)
       └─ Lap (one per runner per interval)
            └─ LapOverride? (edit layer, non-destructive)

TimingEvent[]  ← append-only log, source of truth
RunnerRuntimeState  ← derived + cached for fast reads; persisted for resume
```

## Deployment

The app is built as a static site and deployed to GitHub Pages. Hash-based routing (`#/session`) avoids 404s without server config.

```bash
npm run build
# Deploy dist/ to gh-pages branch
```

## See also

- [`docs/overview.md`](docs/overview.md) — architecture and design decisions
- [`docs/tasks.md`](docs/tasks.md) — phased implementation task list
