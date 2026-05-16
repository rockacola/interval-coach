<script setup lang="ts">
import { computed } from 'vue';

import { useNow } from '@/composables/useNow';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimingStore } from '@/stores/timingStore';
import type { Runner } from '@/types';
import { formatStopwatch, formatStopwatchShort } from '@/utils/timing';

const props = defineProps<{ runner: Runner }>();

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
</script>

<template>
  <div class="px-4 py-3 rounded-lg bg-slate-800 space-y-2">
    <!-- Name + stopwatch + buttons -->
    <div class="flex items-center justify-between">
      <span class="flex items-center gap-3">
        <span>
          <span v-if="runner.bibNumber" class="text-slate-400 text-sm mr-2"
            >#{{ runner.bibNumber }}</span
          >
          <span class="font-medium">{{ runner.name }}</span>
        </span>
        <span v-if="isRunning" class="font-mono text-sm text-emerald-400">{{
          elapsedDisplay
        }}</span>
      </span>
      <div class="flex items-center gap-2">
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
          class="bg-red-700 hover:bg-red-600 active:bg-red-800 text-white px-2 py-1 rounded leading-none cursor-pointer"
          aria-label="Remove runner"
          @click="remove"
        >
          ✕
        </button>
      </div>
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
      </li>
    </ul>
  </div>
</template>
