<script setup lang="ts">
import { computed, ref } from 'vue';

import AddRunnerForm from '@/components/AddRunnerForm.vue';
import AppButton from '@/components/AppButton.vue';
import IconButton from '@/components/IconButton.vue';
import RemovedRunnersList from '@/components/RemovedRunnersList.vue';
import RunnerCard from '@/components/RunnerCard.vue';
import SettingsModal from '@/components/SettingsModal.vue';
import { useRunnerStore } from '@/stores/runnerStore';
import { useTimingStore } from '@/stores/timingStore';

const runnerStore = useRunnerStore();
const timingStore = useTimingStore();
const settingsOpen = ref(false);
const editMode = ref(false);

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
          :active="editMode"
          :aria-label="editMode ? 'Exit edit mode' : 'Enter edit mode'"
          :aria-pressed="editMode"
          @click="editMode = !editMode"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
            />
          </svg>
        </IconButton>
        <IconButton aria-label="Open settings" @click="settingsOpen = true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </IconButton>
      </div>
    </div>

    <SettingsModal v-if="settingsOpen" @close="settingsOpen = false" />

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
  </div>
</template>
