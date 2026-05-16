<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AddRunnerForm from '@/components/AddRunnerForm.vue';
import AppButton from '@/components/AppButton.vue';
import IconButton from '@/components/IconButton.vue';
import RemovedRunnersList from '@/components/RemovedRunnersList.vue';
import RunnerCard from '@/components/RunnerCard.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import { useRunnerStore } from '@/stores/runnerStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTimingStore } from '@/stores/timingStore';
import { displayToKm, formatDistance, kmToDisplay } from '@/utils/distance';

const router = useRouter();
const runnerStore = useRunnerStore();
const settingsStore = useSettingsStore();
const timingStore = useTimingStore();
const settingsOpen = ref(false);
const editMode = ref(false);

const distanceInput = computed({
  get() {
    return timingStore.intervalDistanceKm !== null
      ? parseFloat(
          kmToDisplay(timingStore.intervalDistanceKm, settingsStore.distanceUnit).toFixed(2)
        )
      : null;
  },
  set(value: number | null) {
    timingStore.setIntervalDistance(
      value !== null && value > 0 ? displayToKm(value, settingsStore.distanceUnit) : null
    );
  },
});

const hasIdleRunners = computed(() =>
  runnerStore.sortedRunners.some((r) => runnerStore.getRuntimeState(r.id)?.state !== 'running')
);

function addRunner(name: string, bib: string) {
  runnerStore.addRunner(name, bib || undefined);
}

function startAllIdleRunners() {
  runnerStore.sortedRunners.forEach((r) => {
    const state = runnerStore.getRuntimeState(r.id);
    if (state && state.state !== 'running') {
      timingStore.startRunnerTimer(r.id);
    }
  });
}
</script>

<template>
  <div class="w-full max-w-lg mx-auto px-2 py-8 space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-tight">Interval Coach</h1>
      <div class="flex items-center gap-1">
        <IconButton
          icon="edit"
          :active="editMode"
          :aria-label="editMode ? 'Exit edit mode' : 'Enter edit mode'"
          :aria-pressed="editMode"
          @click="editMode = !editMode"
        />
        <IconButton icon="settings" aria-label="Open settings" @click="settingsOpen = true" />
      </div>
    </div>

    <SettingsModal v-if="settingsOpen" @close="settingsOpen = false" />

    <!-- Interval distance -->
    <div v-if="editMode" class="flex items-center justify-between">
      <label class="text-sm font-medium text-slate-300" for="interval-distance">
        Interval distance
      </label>
      <div class="flex items-center gap-2">
        <input
          id="interval-distance"
          :value="distanceInput"
          class="w-24 rounded-lg bg-slate-700 border border-slate-600 px-3 py-1.5 text-sm text-right text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          min="0"
          placeholder="—"
          step="any"
          type="number"
          @change="distanceInput = ($event.target as HTMLInputElement).valueAsNumber || null"
        />
        <span class="text-sm text-slate-400 w-5">{{ settingsStore.distanceUnit }}</span>
      </div>
    </div>
    <div v-else-if="distanceInput !== null" class="flex items-center justify-between">
      <span class="text-sm font-medium text-slate-300">Interval distance</span>
      <span class="text-sm text-white"
        >{{ formatDistance(timingStore.intervalDistanceKm!, settingsStore.distanceUnit) }}
        {{ settingsStore.distanceUnit }}</span
      >
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-slate-300">Runners</label>
        <AppButton
          variant="green"
          :class="{ invisible: !runnerStore.sortedRunners.length || !hasIdleRunners }"
          @click="startAllIdleRunners"
        >
          Start All
        </AppButton>
      </div>
      <AddRunnerForm @add="addRunner" />
      <ul v-if="runnerStore.sortedRunners.length" class="space-y-2">
        <li v-for="(runner, idx) in runnerStore.sortedRunners" :key="runner.id">
          <RunnerCard
            :runner="runner"
            :edit-mode="editMode"
            :is-first="idx === 0"
            :is-last="idx === runnerStore.sortedRunners.length - 1"
          />
        </li>
      </ul>
      <p v-else class="text-slate-500 text-sm text-center py-4">
        Add at least one runner to start.
      </p>
    </div>

    <RemovedRunnersList
      v-if="runnerStore.deletedRunners.length"
      :runners="runnerStore.deletedRunners"
      @restore="runnerStore.restoreRunner"
    />

    <div class="flex justify-end">
      <AppButton variant="blue" @click="router.push('/report')">View Run Report →</AppButton>
    </div>
  </div>
</template>
