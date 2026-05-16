<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import GhostButton from '@/components/GhostButton.vue';
import RunnerReportCard from '@/components/RunnerReportCard.vue';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimingStore } from '@/stores/timingStore';
import { kmToDisplay } from '@/utils/distance';

const router = useRouter();
const runnerStore = useRunnerStore();
const settingsStore = useSettingsStore();
const timingStore = useTimingStore();

const activeRunners = computed(() =>
  runnerStore.sortedRunners.map((runner) => ({
    intervals: timingStore.intervalsForRunner(runner.id),
    runner,
  }))
);

const removedRunners = computed(() =>
  runnerStore.deletedRunners.map((runner) => ({
    intervals: timingStore.intervalsForRunner(runner.id),
    runner,
  }))
);
</script>

<template>
  <div class="w-full max-w-lg mx-auto px-2 py-8 space-y-8">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <GhostButton aria-label="Back to home" @click="router.back()">←</GhostButton>
      <h1 class="text-2xl font-bold tracking-tight">Report</h1>
    </div>

    <!-- Interval distance -->
    <div v-if="timingStore.intervalDistanceKm !== null" class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-300">Interval distance</span>
      <span class="text-sm text-white">
        {{ kmToDisplay(timingStore.intervalDistanceKm!, settingsStore.distanceUnit) }}
        {{ settingsStore.distanceUnit }}
      </span>
    </div>

    <!-- Active runners -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-slate-300">Runners</label>
      <ul class="space-y-2">
        <li v-for="{ runner, intervals } in activeRunners" :key="runner.id">
          <RunnerReportCard
            :distance-km="timingStore.intervalDistanceKm"
            :distance-unit="settingsStore.distanceUnit"
            :intervals="intervals"
            :runner="runner"
          />
        </li>
      </ul>
      <p v-if="!activeRunners.length" class="text-slate-500 text-sm text-center py-4">
        No runners in this session.
      </p>
    </div>

    <!-- Removed runners -->
    <div v-if="removedRunners.length" class="space-y-3">
      <label class="text-sm font-medium text-slate-500">Removed runners</label>
      <ul class="space-y-2">
        <li v-for="{ runner, intervals } in removedRunners" :key="runner.id">
          <RunnerReportCard
            :distance-km="timingStore.intervalDistanceKm"
            :distance-unit="settingsStore.distanceUnit"
            :intervals="intervals"
            :runner="runner"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
