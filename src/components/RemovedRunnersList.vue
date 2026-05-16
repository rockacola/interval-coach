<script setup lang="ts">
import { useLocalStorageRef } from '@/composables/useLocalStorageRef';
import type { Runner } from '@/types';

defineProps<{ runners: Runner[] }>();

const expanded = useLocalStorageRef('home.removedExpanded', false);
</script>

<template>
  <div class="space-y-2">
    <button
      class="flex items-center w-full text-sm font-medium text-slate-500 hover:text-slate-400 cursor-pointer"
      @click="expanded = !expanded"
    >
      <span class="text-xs mr-2">{{ expanded ? '▼' : '▶' }}</span>
      Removed runners ({{ runners.length }})
    </button>
    <ul v-if="expanded" class="space-y-2">
      <li
        v-for="runner in runners"
        :key="runner.id"
        class="flex items-center px-4 py-3 rounded-lg bg-slate-800/50"
      >
        <span class="text-slate-500">
          <span v-if="runner.bibNumber" class="text-sm mr-2">#{{ runner.bibNumber }}</span>
          <span>{{ runner.name }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
