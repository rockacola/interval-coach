# Getting Started

Interval Coach is a mobile-first web app for running coaches to manage track sessions in real time — starting intervals, recording when each runner finishes a lap, and reviewing results at the end.

This guide assumes you know how to write code but are unfamiliar with the specific tools used here. It explains not just _what_ the tools are, but _why_ they were chosen.

---

## Prerequisites

- **Node.js** — the JavaScript runtime. Install via [nodejs.org](https://nodejs.org) or a version manager like `nvm`. Version is pinned in `.tool-versions` at the project root.
- **npm** — comes bundled with Node.js. Used to install packages and run scripts.

Check your versions:

```bash
node --version
npm --version
```

---

## Running the project

```bash
# Install dependencies (only needed once, or after package.json changes)
npm install

# Start the local development server
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`). The app hot-reloads on file save — you rarely need to restart the dev server.

### Other useful commands

```bash
npm run typecheck      # check TypeScript types without building
npm run lint           # check code style rules
npm run format         # auto-format all files with Prettier
npm run check          # run format + lint + typecheck together (useful before committing)
npm run test           # run the test suite
npm run build          # build a production bundle into dist/
```

---

## Tech stack and why

### Vue 3

Vue is the UI framework. It lets you describe what the screen should look like based on data, and automatically updates the DOM when that data changes — you don't manually touch HTML elements.

This project uses Vue's **Composition API** (the `<script setup>` style). Older Vue code used the Options API (`data()`, `methods:`, `computed:`). Composition API is newer, more TypeScript-friendly, and is the direction the Vue ecosystem has moved toward.

### Vite

Vite is the build tool and dev server. It replaces older tools like Webpack. The key difference: Vite uses native ES modules in the browser during development, so it only compiles the file you just changed rather than rebundling everything. This makes the dev server start near-instantly and hot-reload feel snappy.

### TypeScript

TypeScript adds static types on top of JavaScript. It catches mistakes at edit-time (before you run the code) — for example, passing a `string` where a `number` is expected. The tradeoff is slightly more verbose code, but the payback in a real-time correctness-critical app like this is high.

TypeScript is configured in `tsconfig.app.json` with `strict: true`, which enables all the useful checks.

### Pinia

Pinia is the state management library. State management solves a specific problem: when multiple components on screen need to read or change the same data, where does that data actually live?

Without a state manager, you'd pass data down through props from parent to child and emit events back up — which becomes painful across deeply nested components. Pinia lets you define "stores" (plain TypeScript objects with reactive state and functions) that any component can import and use directly.

Pinia replaced Vuex as the official Vue state manager. It's simpler — no mutations, no modules boilerplate, just `ref()` and functions.

### pinia-plugin-persistedstate

By default, Pinia state lives only in memory. Refresh the page and it's gone. This plugin serializes each store to `localStorage` automatically, so session data survives a page refresh or accidental tap away.

All four stores (`session`, `runner`, `timing`, `history`) are persisted with `persist: true`.

### Vue Router (hash history)

Vue Router handles client-side navigation. Currently the app has a single screen (`HomeView`), with more screens to be added as the live session and summary flows are built.

The app uses **hash history** (`createWebHashHistory`), meaning URLs look like `https://example.com/interval-coach/#/` rather than `https://example.com/interval-coach/`. The reason: this app is deployed to GitHub Pages, which is a static file host. With a normal URL, refreshing the page asks the server for that path — and GitHub Pages returns a 404 because there's no file there. With hash routing, the server always serves `index.html` and the browser handles everything after `#` itself. No server configuration needed.

### Tailwind CSS v4

Tailwind is a utility-first CSS framework. Instead of writing CSS classes like `.runner-card { padding: 1rem; border-radius: 0.75rem; }`, you apply small utility classes directly in the HTML: `class="p-4 rounded-xl"`.

This project uses Tailwind v4 via the `@tailwindcss/vite` plugin, which means there's no `tailwind.config.js` — Tailwind v4 automatically scans your source files and generates only the CSS classes you actually use.

### Vitest

Vitest is the test runner. It's built on top of Vite and understands the same module system, so tests run in the same environment as the app. Tests live in `src/test/`. Run them with `npm run test`.

---

## Project structure

```
src/
├── main.ts              # app entry point — wires up Vue, Pinia, Router
├── App.vue              # root component — renders the current route
├── assets/
│   └── main.css         # global CSS (imports Tailwind)
├── router/
│   └── index.ts         # route definitions
├── stores/              # Pinia stores — all application state lives here
│   ├── sessionStore.ts  # current session (name, status, timestamps)
│   ├── runnerStore.ts   # runner list and per-runner runtime state
│   ├── timingStore.ts   # events, intervals, laps — the core timing logic
│   └── historyStore.ts  # completed session archive
├── views/               # one component per screen (mounted by the router)
│   └── HomeView.vue     # runner management
├── types/
│   └── index.ts         # all shared TypeScript types in one place
├── utils/
│   └── timing.ts        # pure functions: time formatting, lap math
└── test/                # Vitest test files
```

### How a `.vue` file is structured

Each `.vue` file (a Single File Component) has three sections:

```vue
<script setup lang="ts">
// Logic: imports, reactive state, functions
</script>

<template>
  <!-- HTML markup — can reference script variables directly -->
</template>

<style scoped>
/* CSS scoped to this component only (rarely used; we use Tailwind instead) */
</style>
```

The `setup` attribute means the script runs once when the component is created, and everything declared at the top level is automatically available in the template.

---

## The core data model

The most important thing to understand about this codebase is **how timing data is stored**.

### Events are the source of truth

The `TimingEvent[]` array in `timingStore` is an append-only log of everything that happened: session started, interval started, runner finished, runner paused, etc. Each event has a `kind`, a `timestampMs`, and optional `runnerId`/`intervalId`.

```
SESSION_START  t=0
INTERVAL_START t=1000
RUNNER_START   t=1000  runnerId="alice"
RUNNER_START   t=1000  runnerId="bob"
RUNNER_FINISH  t=65000 runnerId="alice"   ← Alice finished in 64s
RUNNER_FINISH  t=71000 runnerId="bob"     ← Bob finished in 70s
```

Everything else — lap durations, runner states, interval counts — is **derived** from these events. This means:

- You can reconstruct the full session state by replaying the event log
- The log is never mutated (events are only appended)
- Correcting a lap time uses a `LapOverride` layer on top of the original data, leaving the event log untouched

### `LapOverride` — non-destructive edits

If a coach taps "finish" a moment late, the recorded time is wrong. Instead of changing the original event, you attach a `LapOverride` to the `Lap` record with the corrected `overriddenDurationMs`. The original data stays intact; display and stats use the override when present.

The function `computeLapDuration(lap)` in `src/utils/timing.ts` is the single place that applies this logic — always use it instead of reading `lap.durationMs` directly.

---

## Code quality tools

Three tools enforce consistent code style:

- **Prettier** — formats code (indentation, quotes, line length). Run `npm run format` to auto-fix. Config in `.prettierrc`.
- **ESLint** — checks for bugs and style issues (import ordering, unused variables, type import style). Run `npm run lint`. Config in `eslint.config.mjs`.
- **TypeScript** — type-checks without emitting any output. Run `npm run typecheck`.

`npm run check` runs all three in sequence. A clean `check` output is the bar to clear before committing.
