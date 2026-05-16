<script setup lang="ts">
import { ref } from 'vue';

import { useHistoryStore } from '@/stores/historyStore';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimingStore } from '@/stores/timingStore';
import { generateId, nowMs } from '@/utils/timing';

const emit = defineEmits<{ close: [] }>();

const historyStore = useHistoryStore();
const runnerStore = useRunnerStore();
const sessionStore = useSessionStore();
const settingsStore = useSettingsStore();
const timingStore = useTimingStore();

const confirmingNew = ref(false);

function startNewSession(): void {
  const now = nowMs();
  historyStore.archiveSession({
    archivedAtMs: now,
    events: [...timingStore.events],
    intervals: [...timingStore.intervals],
    laps: [...timingStore.laps],
    runners: [...runnerStore.runners],
    session: sessionStore.session ?? {
      createdAtMs: now,
      endedAtMs: now,
      id: generateId(),
      name: 'Session',
      startedAtMs: null,
      status: 'ended',
    },
  });
  timingStore.clearAll();
  runnerStore.clearAll();
  sessionStore.clearSession();
  confirmingNew.value = false;
  emit('close');
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60" @click="$emit('close')" />
    <div class="relative bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Settings</h2>
        <button
          class="text-slate-400 hover:text-white cursor-pointer leading-none"
          aria-label="Close settings"
          @click="$emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Include hours -->
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-300">Include hours</p>
        <div class="flex gap-2">
          <button
            class="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            :class="
              settingsStore.timeFormat === 'HH:mm:ss.SSS'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            "
            @click="settingsStore.setTimeFormat('HH:mm:ss.SSS')"
          >
            Yes
          </button>
          <button
            class="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            :class="
              settingsStore.timeFormat === 'mm:ss.SSS'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            "
            @click="settingsStore.setTimeFormat('mm:ss.SSS')"
          >
            No
          </button>
        </div>
      </div>

      <!-- Session -->
      <div class="border-t border-slate-700 pt-5 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Session</p>

        <template v-if="!confirmingNew">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-300">New session</p>
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              @click="confirmingNew = true"
            >
              Start new
            </button>
          </div>
        </template>

        <template v-else>
          <p class="text-sm text-amber-400">
            This will clear all runners and interval data. Ready to start fresh?
          </p>
          <div class="flex gap-2 justify-end">
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              @click="confirmingNew = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
              @click="startNewSession"
            >
              Yes, start fresh
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
