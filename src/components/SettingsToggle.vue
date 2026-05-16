<script setup lang="ts">
import AppButton from '@/components/AppButton.vue';

defineProps<{
  label: string;
  modelValue: string;
  options: { label: string; value: string }[];
}>();

defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div class="flex items-center justify-between">
    <p class="text-sm font-medium text-slate-300">{{ label }}</p>
    <div class="flex gap-2">
      <AppButton
        v-for="option in options"
        :key="option.value"
        :variant="modelValue === option.value ? 'green' : 'slate'"
        @click="$emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </AppButton>
    </div>
  </div>
</template>
