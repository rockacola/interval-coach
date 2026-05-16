<script setup lang="ts">
import { computed, ref } from 'vue';

import AppButton from '@/components/AppButton.vue';
import GhostButton from '@/components/GhostButton.vue';
import { useNow } from '@/composables/useNow';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimingStore } from '@/stores/timingStore';
import type { Runner } from '@/types';
import { formatDuration, formatStopwatch, formatStopwatchShort } from '@/utils/timing';

const props = defineProps<{
  editMode: boolean;
  isFirst: boolean;
  isLast: boolean;
  runner: Runner;
}>();

const isCollapsed = ref(true);

const runnerStore = useRunnerStore();
const settingsStore = useSettingsStore();
const timingStore = useTimingStore();
const { now } = useNow();

const isRunning = computed(() => runnerStore.getRuntimeState(props.runner.id)?.state === 'running');

const formatTime = computed(() =>
  settingsStore.timeFormat === 'HH:mm:ss.SSS' ? formatStopwatch : formatStopwatchShort
);

const elapsedDisplay = computed(() => {
  const state = runnerStore.getRuntimeState(props.runner.id);
  if (!state || state.currentIntervalStartMs === null) {
    return settingsStore.timeFormat === 'HH:mm:ss.SSS' ? '00:00:00.000' : '00:00.000';
  }
  return formatTime.value(now.value - state.currentIntervalStartMs);
});

const intervals = computed(() => timingStore.intervalsForRunner(props.runner.id));

const restDisplay = computed(() => {
  if (isRunning.value || !intervals.value.length) return null;
  const lastStop = intervals.value[intervals.value.length - 1].stopMs;
  return formatDuration(now.value - lastStop);
});

function adjustRunnerStart(deltaMs: number) {
  const state = runnerStore.getRuntimeState(props.runner.id);
  if (!state || state.currentIntervalStartMs === null) return;
  runnerStore.setRunnerState(props.runner.id, {
    currentIntervalStartMs: state.currentIntervalStartMs + deltaMs,
  });
}

function toggleTimer() {
  if (isRunning.value) {
    timingStore.stopRunnerTimer(props.runner.id);
  } else {
    timingStore.startRunnerTimer(props.runner.id);
  }
}

function remove() {
  runnerStore.removeRunner(props.runner.id);
}

function onNameInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  runnerStore.updateRunner(props.runner.id, { name: value });
}

function onBibInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  runnerStore.updateRunner(props.runner.id, { bibNumber: value });
}
</script>

<template>
  <div class="px-2 py-3 rounded-lg bg-slate-800 space-y-2">
    <!-- Name row -->
    <div class="flex items-center gap-2">
      <button
        v-if="!editMode"
        class="text-slate-500 hover:text-slate-300 text-xs shrink-0 cursor-pointer w-4"
        :aria-label="isCollapsed ? 'Expand runner' : 'Collapse runner'"
        @click="isCollapsed = !isCollapsed"
      >
        {{ isCollapsed ? '▶' : '▼' }}
      </button>
      <span class="flex items-center gap-2 min-w-0 flex-1">
        <template v-if="editMode">
          <input
            :value="runner.bibNumber"
            placeholder="Bib"
            class="text-slate-400 text-sm bg-slate-700 border border-slate-600 rounded px-1 py-0.5 focus:outline-none focus:border-amber-400 w-12 shrink-0"
            @input="onBibInput"
          />
          <input
            :value="runner.name"
            class="font-medium text-sm bg-slate-700 border border-slate-600 rounded px-1 py-0.5 focus:outline-none focus:border-amber-400 min-w-0 flex-1"
            @input="onNameInput"
          />
        </template>
        <template v-else>
          <span v-if="runner.bibNumber" class="text-slate-400 text-sm shrink-0"
            >#{{ runner.bibNumber }}</span
          >
          <span class="font-medium truncate">{{ runner.name }}</span>
          <span
            v-if="isCollapsed && (intervals.length || isRunning)"
            class="text-xs shrink-0"
            :class="isRunning ? 'text-emerald-400' : 'text-slate-400'"
          >
            {{ isRunning ? `lap ${intervals.length + 1}…` : `${intervals.length} laps` }}
          </span>
        </template>
      </span>
      <!-- Sort buttons: edit mode only, in the name row -->
      <span v-if="editMode" class="flex items-center gap-1 shrink-0">
        <GhostButton
          :disabled="isFirst"
          aria-label="Move runner up"
          @click="runnerStore.moveRunnerUp(runner.id)"
          >↑</GhostButton
        >
        <GhostButton
          :disabled="isLast"
          aria-label="Move runner down"
          @click="runnerStore.moveRunnerDown(runner.id)"
          >↓</GhostButton
        >
      </span>
      <!-- Stopwatch + button: inline when not editing -->
      <div v-if="!editMode" class="flex items-center gap-2 shrink-0">
        <span v-if="isRunning" class="font-mono text-sm text-emerald-400">{{
          elapsedDisplay
        }}</span>
        <span v-else-if="restDisplay" class="font-mono text-sm text-slate-400">{{
          restDisplay
        }}</span>
        <AppButton :variant="isRunning ? 'amber' : 'green'" @click="toggleTimer">
          {{ isRunning ? 'Stop' : 'Start' }}
        </AppButton>
      </div>
    </div>

    <!-- Edit mode: stopwatch + start/stop row -->
    <div v-if="editMode" class="flex items-center justify-end gap-2">
      <span v-if="isRunning" class="flex items-center gap-1">
        <GhostButton bold @click="adjustRunnerStart(+1000)">−</GhostButton>
        <GhostButton bold @click="adjustRunnerStart(-1000)">+</GhostButton>
      </span>
      <span v-if="isRunning" class="font-mono text-sm text-emerald-400">{{ elapsedDisplay }}</span>
      <span v-else-if="restDisplay" class="font-mono text-sm text-slate-400">{{
        restDisplay
      }}</span>
      <AppButton :variant="isRunning ? 'amber' : 'green'" @click="toggleTimer">
        {{ isRunning ? 'Stop' : 'Start' }}
      </AppButton>
    </div>

    <!-- Recorded intervals -->
    <ul v-if="intervals.length && !isCollapsed" class="space-y-1 border-t border-slate-700 pt-2">
      <li
        v-for="interval in intervals"
        :key="interval.id"
        class="flex items-center gap-3 text-sm text-slate-300"
      >
        <span class="text-slate-500 w-6 text-right">{{ interval.index }}</span>
        <span class="font-mono">{{ formatTime(interval.stopMs - interval.startMs) }}</span>
        <template v-if="editMode">
          <span class="flex items-center gap-1">
            <GhostButton bold @click="timingStore.adjustRunnerIntervalStop(interval.id, -1000)"
              >−</GhostButton
            >
            <GhostButton bold @click="timingStore.adjustRunnerIntervalStop(interval.id, +1000)"
              >+</GhostButton
            >
            <GhostButton
              danger
              aria-label="Delete interval"
              @click="timingStore.removeRunnerInterval(interval.id)"
              >✕</GhostButton
            >
          </span>
        </template>
      </li>
    </ul>

    <!-- Remove runner: shown at bottom in edit mode -->
    <div v-if="editMode" class="border-t border-slate-700 pt-2 flex justify-end">
      <AppButton variant="red" @click="remove">Remove Runner</AppButton>
    </div>
  </div>
</template>
