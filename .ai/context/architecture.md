# Architecture: Interval Coach

## System Overview

Single-page application (SPA) built with Vue 3. All state is client-side; persistence is localStorage via `pinia-plugin-persistedstate`. No backend.

## Components

- **Views**: `HomeView` (active session), `ReportView` (session history)
- **Stores**: `runnerStore`, `sessionStore`, `timingStore`, `historyStore`, `settingsStore`
- **Composables**: `useNow` (reactive clock), `useLocalStorageRef`
- **Utils**: `timing.ts` (interval math), `distance.ts` (unit conversion)

## Data Flow

1. User adds runners via `AddRunnerForm` → `runnerStore`
2. Session starts → `sessionStore` drives `timingStore` tick loop
3. `timingStore` computes current interval per runner and emits timing events
4. `RunnerCard` components react to store state; speech synthesis fires on interval transitions
5. Session end → results written to `historyStore`

## External Services

- Web Speech API (browser-native, no external dependency)

## Deployment Model

Static build deployed to GitHub Pages via `.github/workflows/deploy.yml`. No server.

## Constraints

- All state must survive page refresh (localStorage persistence)
- Speech synthesis availability varies by browser; feature degrades silently
- Timing accuracy depends on `requestAnimationFrame` / `setInterval` behaviour in the host browser
