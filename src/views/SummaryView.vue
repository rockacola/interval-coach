<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useRunnerStore } from '@/stores/runnerStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useTimingStore } from '@/stores/timingStore';
import { formatDuration } from '@/utils/timing';

const router = useRouter();
const sessionStore = useSessionStore();
const runnerStore = useRunnerStore();
const timingStore = useTimingStore();

const session = computed(() => sessionStore.session);

const runnerSummaries = computed(() =>
  runnerStore.sortedRunners.map((runner) => {
    const laps = timingStore.lapsForRunner(runner.id);
    const fastest = timingStore.runnerFastestLap(runner.id);
    const average = timingStore.runnerAverageLapMs(runner.id);
    return { runner, laps, fastest, average };
  })
);

function newSession() {
  sessionStore.clearSession();
  runnerStore.clearAll();
  timingStore.clearAll();
  router.push({ name: 'setup' });
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Session Summary</h1>
      <p class="text-slate-400 text-sm mt-1">{{ session?.name }}</p>
    </div>

    <div
      v-for="{ runner, laps, fastest, average } in runnerSummaries"
      :key="runner.id"
      class="rounded-xl bg-slate-800 p-4 space-y-3"
    >
      <div class="flex items-center justify-between">
        <span class="font-semibold text-lg">{{ runner.name }}</span>
        <span class="text-slate-400 text-sm">{{ laps.length }} laps</span>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-slate-700/50 rounded-lg p-3">
          <div class="text-slate-400 text-xs mb-1">Fastest lap</div>
          <div class="font-mono font-bold text-xl">
            {{ fastest ? formatDuration(fastest.durationMs) : '—' }}
          </div>
        </div>
        <div class="bg-slate-700/50 rounded-lg p-3">
          <div class="text-slate-400 text-xs mb-1">Average lap</div>
          <div class="font-mono font-bold text-xl">
            {{ average ? formatDuration(average) : '—' }}
          </div>
        </div>
      </div>

      <div v-if="laps.length" class="space-y-1">
        <div
          v-for="(lap, i) in laps"
          :key="lap.id"
          class="flex justify-between text-sm text-slate-300"
        >
          <span class="text-slate-500">Lap {{ i + 1 }}</span>
          <span class="font-mono">{{ formatDuration(lap.durationMs) }}</span>
        </div>
      </div>
    </div>

    <button
      class="w-full py-4 rounded-xl bg-sky-600 font-bold text-white text-xl"
      @click="newSession"
    >
      New Session
    </button>
  </div>
</template>
