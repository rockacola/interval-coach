import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRunnerStore } from '@/stores/runnerStore'
import { useTimingStore } from '@/stores/timingStore'
import { useSessionStore } from '@/stores/sessionStore'

// These tests verify that the data shapes are stable and
// consistent after operations — which is what persists across refresh.

const SESSION_ID = 'session-test'

describe('session persistence shape', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('session preserves start timestamp', () => {
    const sessionStore = useSessionStore()
    sessionStore.createSession('Test')
    const ts = Date.now()
    sessionStore.startSession()

    // startedAtMs should be within 50ms of our marker
    expect(sessionStore.session?.startedAtMs).toBeGreaterThanOrEqual(ts - 50)
    expect(sessionStore.session?.startedAtMs).toBeLessThanOrEqual(ts + 50)
  })

  it('runner store preserves order and runtime state after operations', () => {
    const runnerStore = useRunnerStore()
    const alice = runnerStore.addRunner('Alice')
    const bob = runnerStore.addRunner('Bob')

    runnerStore.reorderRunners([bob.id, alice.id])

    const sorted = runnerStore.sortedRunners
    expect(sorted[0].id).toBe(bob.id)
    expect(sorted[1].id).toBe(alice.id)
  })

  it('lap data is intact after recording finish', () => {
    const runnerStore = useRunnerStore()
    const timing = useTimingStore()

    const runner = runnerStore.addRunner('Carol')
    timing.startInterval(SESSION_ID, 1_000_000)
    const lap = timing.recordFinish(runner.id, SESSION_ID, 1_060_000)!

    expect(lap.startMs).toBe(1_000_000)
    expect(lap.finishMs).toBe(1_060_000)
    expect(lap.durationMs).toBe(60_000)
    expect(lap.runnerId).toBe(runner.id)
    expect(lap.intervalNumber).toBe(1)
  })

  it('events log is append-only and not mutated', () => {
    const runnerStore = useRunnerStore()
    const timing = useTimingStore()

    runnerStore.addRunner('Dave')
    timing.startInterval(SESSION_ID, 0)

    const eventCountAfterStart = timing.events.length
    expect(eventCountAfterStart).toBeGreaterThanOrEqual(2) // INTERVAL_START + RUNNER_START

    // Subsequent operations only append
    timing.startInterval(SESSION_ID, 60_000)
    expect(timing.events.length).toBeGreaterThan(eventCountAfterStart)
  })

  it('multiple runners each get their own runtime state', () => {
    const runnerStore = useRunnerStore()
    const timing = useTimingStore()

    const alice = runnerStore.addRunner('Alice')
    const bob = runnerStore.addRunner('Bob')

    timing.startInterval(SESSION_ID, 0)
    timing.recordFinish(alice.id, SESSION_ID, 55_000)

    expect(runnerStore.getRuntimeState(alice.id)?.state).toBe('finished')
    expect(runnerStore.getRuntimeState(bob.id)?.state).toBe('running')
  })
})
