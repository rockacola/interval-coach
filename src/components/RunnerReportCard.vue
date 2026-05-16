<script setup lang="ts">
import { computed } from 'vue';

import type { DistanceUnit } from '@/stores/settingsStore';
import type { Runner, RunnerInterval } from '@/types';
import { formatPace } from '@/utils/distance';
import { formatDuration } from '@/utils/timing';

const props = defineProps<{
  distanceKm: number | null;
  distanceUnit: DistanceUnit;
  intervals: RunnerInterval[];
  runner: Runner;
}>();

const rows = computed(() =>
  props.intervals.map((interval, i) => {
    const durationMs = interval.stopMs - interval.startMs;
    const restMs = i > 0 ? interval.startMs - props.intervals[i - 1].stopMs : null;
    const pace =
      props.distanceKm !== null
        ? formatPace(durationMs, props.distanceKm, props.distanceUnit)
        : null;
    return { durationMs, id: interval.id, index: interval.index, pace, restMs };
  })
);

const bestMs = computed(() => {
  if (!rows.value.length) return null;
  return Math.min(...rows.value.map((r) => r.durationMs));
});

const avgMs = computed(() => {
  if (!rows.value.length) return null;
  return rows.value.reduce((sum, r) => sum + r.durationMs, 0) / rows.value.length;
});
</script>

<template>
  <div class="px-2 py-3 rounded-lg bg-slate-800 space-y-2">
    <!-- Header -->
    <div class="flex items-center gap-2">
      <span v-if="runner.bibNumber" class="text-slate-400 text-sm shrink-0"
        >#{{ runner.bibNumber }}</span
      >
      <span class="font-medium truncate">{{ runner.name }}</span>
    </div>

    <!-- No data -->
    <p v-if="!rows.length" class="text-sm text-slate-500">No intervals recorded.</p>

    <template v-else>
      <!-- Intervals -->
      <ul class="space-y-1 border-t border-slate-700 pt-2">
        <template v-for="row in rows" :key="row.id">
          <!-- Rest time between intervals -->
          <li
            v-if="row.restMs !== null"
            class="flex items-center gap-3 text-xs text-slate-600 pl-6"
          >
            <span>rest {{ formatDuration(row.restMs) }}</span>
          </li>
          <!-- Interval row -->
          <li class="flex items-center gap-3 text-sm text-slate-300">
            <span class="text-slate-500 w-6 text-right">{{ row.index }}</span>
            <span class="font-mono">{{ formatDuration(row.durationMs) }}</span>
            <span v-if="row.pace" class="text-slate-400 text-xs">{{ row.pace }}</span>
            <span
              v-if="row.durationMs === bestMs && rows.length > 1"
              class="text-xs text-emerald-500 ml-auto"
              >best</span
            >
          </li>
        </template>
      </ul>

      <!-- Summary -->
      <div class="border-t border-slate-700 pt-2 flex gap-4 text-xs text-slate-400">
        <span
          >avg <span class="text-slate-200 font-mono">{{ formatDuration(avgMs!) }}</span></span
        >
        <span
          >best <span class="text-slate-200 font-mono">{{ formatDuration(bestMs!) }}</span></span
        >
        <template v-if="distanceKm !== null">
          <span
            >avg pace
            <span class="text-slate-200 font-mono">{{
              formatPace(avgMs!, distanceKm, distanceUnit)
            }}</span></span
          >
        </template>
      </div>
    </template>
  </div>
</template>
