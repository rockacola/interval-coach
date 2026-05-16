import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session, Runner, Lap, Interval, TimingEvent, SessionId } from '@/types'

// Future-ready: stores completed session snapshots for history review.
// Currently unused in MVP but wired into persistence so data is not lost.

export interface HistoricalSession {
  session: Session
  runners: Runner[]
  intervals: Interval[]
  laps: Lap[]
  events: TimingEvent[]
  archivedAtMs: number
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoricalSession[]>([])

  function archiveSession(entry: HistoricalSession): void {
    history.value.push(entry)
  }

  function getById(sessionId: SessionId): HistoricalSession | undefined {
    return history.value.find(h => h.session.id === sessionId)
  }

  function clearAll(): void {
    history.value = []
  }

  return {
    history,
    archiveSession,
    getById,
    clearAll,
  }
}, {
  persist: true,
})
