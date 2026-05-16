<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();
</script>

<template>
  <button
    class="cursor-pointer p-2 rounded hover:bg-slate-700 active:bg-slate-600"
    :class="active ? 'text-amber-400 bg-slate-700' : 'text-slate-400 hover:text-white'"
  >
    <slot />
  </button>
</template>
