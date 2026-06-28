# Product: Interval Coach

## Purpose

A browser-based interval training coach that manages multiple runners simultaneously, announces intervals via text-to-speech, and logs session history.

## Users

Coaches and athletes running interval training sessions with one or more participants.

## Core Features

- Add and manage multiple runners with individual target paces and distances
- Real-time interval timing with automatic next-interval announcements via speech synthesis
- Per-runner session history and performance reporting
- Configurable settings (units, audio cues)

## Non Goals

- Server-side persistence or user accounts
- GPS or device sensor integration
- Multi-device synchronisation

## Dependencies

- Vue 3 + Vite (SPA)
- Pinia (state management, persisted via localStorage)
- Vue Router
- Web Speech API (browser-native)

## Success Metrics

- Session runs without timing drift across intervals
- Announcements fire at correct interval boundaries for all runners
