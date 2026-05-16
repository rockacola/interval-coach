import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Session, SessionId, SessionStatus } from '@/types';
import { generateId, nowMs } from '@/utils/timing';

export const useSessionStore = defineStore(
  'session',
  () => {
    const session = ref<Session | null>(null);

    const isActive = computed(() => session.value?.status === 'active');
    const isPending = computed(() => session.value?.status === 'pending');
    const isEnded = computed(() => session.value?.status === 'ended');
    const sessionId = computed<SessionId | null>(() => session.value?.id ?? null);

    function createSession(name: string): Session {
      const newSession: Session = {
        id: generateId(),
        name,
        status: 'pending',
        createdAtMs: nowMs(),
        startedAtMs: null,
        endedAtMs: null,
      };
      session.value = newSession;
      return newSession;
    }

    function startSession(): void {
      if (!session.value) throw new Error('No session to start');
      session.value.status = 'active';
      session.value.startedAtMs = nowMs();
    }

    function endSession(): void {
      if (!session.value) return;
      session.value.status = 'ended';
      session.value.endedAtMs = nowMs();
    }

    function setStatus(status: SessionStatus): void {
      if (!session.value) return;
      session.value.status = status;
    }

    function clearSession(): void {
      session.value = null;
    }

    return {
      session,
      isActive,
      isPending,
      isEnded,
      sessionId,
      createSession,
      startSession,
      endSession,
      setStatus,
      clearSession,
    };
  },
  {
    persist: true,
  }
);
