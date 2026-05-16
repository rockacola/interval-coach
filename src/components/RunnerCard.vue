<script setup lang="ts">
import { computed } from 'vue';

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
        </template>
      </span>
      <!-- Stopwatch + button: inline when not editing -->
      <div v-if="!editMode" class="flex items-center gap-2 shrink-0">
        <span v-if="isRunning" class="font-mono text-sm text-emerald-400">{{
          elapsedDisplay
        }}</span>
        <span v-else-if="restDisplay" class="font-mono text-sm text-slate-400">{{
          restDisplay
        }}</span>
        <button
          class="px-3 py-1 rounded text-sm font-semibold cursor-pointer text-white"
          :class="
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700'
              : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800'
          "
          @click="toggleTimer"
        >
          {{ isRunning ? 'Stop' : 'Start' }}
        </button>
      </div>
    </div>

    <!-- Edit mode: stopwatch + start/stop + reorder + remove all on one row -->
    <div v-if="editMode" class="flex items-center justify-end gap-2">
      <span v-if="isRunning" class="font-mono text-sm text-emerald-400">{{ elapsedDisplay }}</span>
      <span v-else-if="restDisplay" class="font-mono text-sm text-slate-400">{{
        restDisplay
      }}</span>
      <button
        class="px-3 py-1 rounded text-sm font-semibold cursor-pointer text-white"
        :class="
          isRunning
            ? 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700'
            : 'bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800'
        "
        @click="toggleTimer"
      >
        {{ isRunning ? 'Stop' : 'Start' }}
      </button>
      <button
        :disabled="isFirst"
        class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:pointer-events-none px-2 py-1 rounded text-sm cursor-pointer"
        aria-label="Move runner up"
        @click="runnerStore.moveRunnerUp(runner.id)"
      >
        ↑
      </button>
      <button
        :disabled="isLast"
        class="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:pointer-events-none px-2 py-1 rounded text-sm cursor-pointer"
        aria-label="Move runner down"
        @click="runnerStore.moveRunnerDown(runner.id)"
      >
        ↓
      </button>
      <button
        class="bg-red-700 hover:bg-red-600 active:bg-red-800 text-white px-2 py-1 rounded text-sm cursor-pointer"
        aria-label="Remove runner"
        @click="remove"
      >
        ✕
      </button>
    </div>

    <!-- Recorded intervals -->
    <ul v-if="intervals.length" class="space-y-1 border-t border-slate-700 pt-2">
      <li
        v-for="interval in intervals"
        :key="interval.id"
        class="flex items-center gap-3 text-sm text-slate-300"
      >
        <span class="text-slate-500 w-6 text-right">{{ interval.index }}</span>
        <span class="font-mono">{{ formatTime(interval.stopMs - interval.startMs) }}</span>
        <template v-if="editMode">
          <span class="flex items-center gap-1">
            <button
              class="text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 rounded px-2 py-1.5 leading-none cursor-pointer font-bold text-base"
              @click="timingStore.adjustRunnerIntervalStop(interval.id, -1000)"
            >
              −
            </button>
            <button
              class="text-slate-400 hover:text-white hover:bg-slate-700 active:bg-slate-600 rounded px-2 py-1.5 leading-none cursor-pointer font-bold text-base"
              @click="timingStore.adjustRunnerIntervalStop(interval.id, +1000)"
            >
              +
            </button>
            <button
              class="text-red-500 hover:text-red-400 hover:bg-slate-700 active:bg-slate-600 rounded px-2 py-1.5 leading-none cursor-pointer text-xs"
              aria-label="Delete interval"
              @click="timingStore.removeRunnerInterval(interval.id)"
            >
              ✕
            </button>
          </span>
        </template>
      </li>
    </ul>
  </div>
</template>
