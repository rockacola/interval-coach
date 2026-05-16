<script setup lang="ts">
import { ref } from 'vue';

import AppButton from '@/components/AppButton.vue';

const emit = defineEmits<{
  add: [name: string, bib: string];
}>();

const name = ref('');
const bib = ref('');

function submit() {
  const trimmed = name.value.trim();
  if (!trimmed) {
    return;
  }
  emit('add', trimmed, bib.value.trim());
  name.value = '';
  bib.value = '';
}
</script>

<template>
  <div class="flex gap-2">
    <input
      v-model="bib"
      type="text"
      class="w-12 px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      placeholder="#"
    />
    <input
      v-model="name"
      type="text"
      class="flex-1 px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      placeholder="Runner name"
      @keydown.enter="submit"
    />
    <AppButton variant="blue" :disabled="!name.trim()" @click="submit">Add</AppButton>
  </div>
</template>
