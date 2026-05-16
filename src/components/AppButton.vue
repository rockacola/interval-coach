<script setup lang="ts">
type Variant = 'amber' | 'blue' | 'danger' | 'green' | 'red' | 'slate';

defineProps<{
  disabled?: boolean;
  variant: Variant;
}>();

const variantClasses: Record<Variant, string> = {
  amber: 'px-3 py-1 text-white bg-amber-600 hover:bg-amber-500 active:bg-amber-700',
  blue: 'px-3 py-1.5 text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700',
  danger: 'px-3 py-1 text-white bg-red-700 hover:bg-red-600 active:bg-red-800',
  green: 'px-3 py-1 text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800',
  red: 'px-3 py-1.5 text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 active:bg-red-900/70',
  slate: 'px-3 py-1 text-slate-300 bg-slate-700 hover:bg-slate-600 active:bg-slate-500',
};
</script>

<template>
  <button
    class="rounded text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
    :class="variantClasses[variant]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
