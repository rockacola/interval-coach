<script setup lang="ts">
import { ref } from 'vue';

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
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-8 space-y-8">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Interval Coach</h1>
      <p class="text-slate-400 text-sm mt-1">Add runners to get started.</p>
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
            class="text-slate-500 hover:text-red-400 text-sm px-2 py-1"
            @click="removeRunner(runner.id)"
          >
            Remove
          </button>
        </li>
      </ul>

      <p v-else class="text-slate-500 text-sm text-center py-4">
        Add at least one runner to start.
      </p>
    </div>
  </div>
</template>
