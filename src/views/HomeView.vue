<script setup lang="ts">
import AddRunnerForm from '@/components/AddRunnerForm.vue';
import RemovedRunnersList from '@/components/RemovedRunnersList.vue';
import RunnerCard from '@/components/RunnerCard.vue';
import { useRunnerStore } from '@/stores/runnerStore';

const runnerStore = useRunnerStore();

function addRunner(name: string, bib: string) {
  runnerStore.addRunner(name, bib || undefined);
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 py-8 space-y-8">
    <h1 class="text-2xl font-bold tracking-tight">Interval Coach</h1>

    <div class="space-y-3">
      <label class="text-sm font-medium text-slate-300">Runners</label>
      <AddRunnerForm @add="addRunner" />
      <ul v-if="runnerStore.sortedRunners.length" class="space-y-2">
        <li v-for="runner in runnerStore.sortedRunners" :key="runner.id">
          <RunnerCard :runner="runner" />
        </li>
      </ul>
      <p v-else class="text-slate-500 text-sm text-center py-4">
        Add at least one runner to start.
      </p>
    </div>

    <RemovedRunnersList
      v-if="runnerStore.deletedRunners.length"
      :runners="runnerStore.deletedRunners"
    />
  </div>
</template>
