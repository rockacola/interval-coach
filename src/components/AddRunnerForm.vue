<script setup lang="ts">
import { ref } from 'vue';

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
      class="w-16 px-3 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
      placeholder="#"
    />
    <input
      v-model="name"
      type="text"
      class="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-sky-500"
      placeholder="Runner name"
      @keydown.enter="submit"
    />
    <button
      class="px-5 py-3 rounded-lg bg-sky-600 font-semibold text-white disabled:opacity-40 cursor-pointer"
      :disabled="!name.trim()"
      @click="submit"
    >
      Add
    </button>
  </div>
</template>
