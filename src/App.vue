<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-900 text-white">
    <RouterView class="flex-1" />
    <AppFooter />
  </div>
</template>
