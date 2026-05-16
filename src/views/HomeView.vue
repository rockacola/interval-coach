<script setup lang="ts">
import { ref } from 'vue';

import { useLocalStorageRef } from '@/composables/useLocalStorageRef';
import { useRunnerStore } from '@/stores/runnerStore';

const runnerStore = useRunnerStore();

const newRunnerName = ref('');
const newRunnerBib = ref('');

function addRunner() {
  const name = newRunnerName.value.trim();
  if (!name) {
    return;
  }
  runnerStore.addRunner(name, newRunnerBib.value || undefined);
  newRunnerName.value = '';
  newRunnerBib.value = '';
}

function removeRunner(id: string) {
  runnerStore.removeRunner(id);
}

const removedExpanded = useLocalStorageRef('home.removedExpanded', false);
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Interval Coach</h1>
    </div>

    <!-- Add runners -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-slate-300">Runners</label>

      <div class="flex gap-2">
        <input
          v-model="newRunnerBib"
          type="text"
          class="w-16 px-3 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="#"
        />
        <input
          v-model="newRunnerName"
          type="text"
          class="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Runner name"
          @keydown.enter="addRunner"
        />
        <button
          class="px-5 py-3 rounded-lg bg-sky-600 font-semibold text-white disabled:opacity-40"
          :disabled="!newRunnerName.trim()"
          @click="addRunner"
        >
          Add
        </button>
      </div>

      <ul v-if="runnerStore.sortedRunners.length" class="space-y-2">
        <li
          v-for="runner in runnerStore.sortedRunners"
          :key="runner.id"
          class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800"
        >
          <span>
            <span v-if="runner.bibNumber" class="text-slate-400 text-sm mr-2"
              >#{{ runner.bibNumber }}</span
            >
            <span class="font-medium">{{ runner.name }}</span>
          </span>
          <button
            class="bg-red-700 hover:bg-red-600 active:bg-red-800 text-white px-2 py-1 rounded leading-none cursor-pointer"
            aria-label="Remove runner"
            @click="removeRunner(runner.id)"
          >
            ✕
          </button>
        </li>
      </ul>

      <p v-else class="text-slate-500 text-sm text-center py-4">
        Add at least one runner to start.
      </p>
    </div>

    <!-- Removed runners accordion -->
    <div v-if="runnerStore.deletedRunners.length" class="space-y-2">
      <button
        class="flex items-center justify-between w-full text-sm font-medium text-slate-500 hover:text-slate-400 cursor-pointer"
        @click="removedExpanded = !removedExpanded"
      >
        <span
          ><span class="text-xs mr-2">{{ removedExpanded ? '▼' : '▶' }}</span
          >Removed runners ({{ runnerStore.deletedRunners.length }})</span
        >
      </button>
      <ul v-if="removedExpanded" class="space-y-2">
        <li
          v-for="runner in runnerStore.deletedRunners"
          :key="runner.id"
          class="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/50"
        >
          <span class="text-slate-500">
            <span v-if="runner.bibNumber" class="text-sm mr-2">#{{ runner.bibNumber }}</span>
            <span>{{ runner.name }}</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
