<script setup lang="ts">
import { ref } from 'vue';

import AppButton from '@/components/AppButton.vue';
import GhostButton from '@/components/GhostButton.vue';
import SettingsToggle from '@/components/SettingsToggle.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSessionStore } from '@/stores/sessionStore';
import type { DistanceUnit, TimeDisplayFormat } from '@/stores/settingsStore';
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

function onDistanceUnitChange(value: string): void {
  settingsStore.setDistanceUnit(value as DistanceUnit);
}

function onTimeFormatChange(value: string): void {
  settingsStore.setTimeFormat(value as TimeDisplayFormat);
}

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
        <GhostButton aria-label="Close settings" @click="$emit('close')">✕</GhostButton>
      </div>

      <!-- Distance unit -->
      <SettingsToggle
        label="Distance unit"
        :model-value="settingsStore.distanceUnit"
        :options="[
          { label: 'km', value: 'km' },
          { label: 'mi', value: 'mi' },
        ]"
        @update:model-value="onDistanceUnitChange"
      />

      <!-- Include hours -->
      <SettingsToggle
        label="Include hours"
        :model-value="settingsStore.timeFormat"
        :options="[
          { label: 'Yes', value: 'HH:mm:ss.SSS' },
          { label: 'No', value: 'mm:ss.SSS' },
        ]"
        @update:model-value="onTimeFormatChange"
      />

      <!-- Session -->
      <div class="border-t border-slate-700 pt-5 space-y-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Session</p>

        <template v-if="!confirmingNew">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-300">New session</p>
            <AppButton variant="slate" @click="confirmingNew = true">Start new</AppButton>
          </div>
        </template>

        <template v-else>
          <p class="text-sm text-amber-400">
            This will clear all runners and interval data. Ready to start fresh?
          </p>
          <div class="flex gap-2 justify-end">
            <AppButton variant="slate" @click="confirmingNew = false">Cancel</AppButton>
            <AppButton variant="danger" @click="startNewSession">Yes, start fresh</AppButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
