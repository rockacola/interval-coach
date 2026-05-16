<script setup lang="ts">
defineProps<{
  bold?: boolean;
  danger?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <button
    class="rounded px-2 py-1.5 text-sm leading-none cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
    :class="[
      bold ? 'font-bold' : '',
      danger
        ? 'text-red-500 hover:text-red-400 hover:bg-slate-700 active:bg-slate-600'
        : 'text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 active:bg-slate-500',
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
