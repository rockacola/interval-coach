import { onMounted, onUnmounted, ref } from 'vue';

export function useNow() {
  const now = ref(Date.now());
  let rafId: number;

  function tick() {
    now.value = Date.now();
    rafId = requestAnimationFrame(tick);
  }

  onMounted(() => {
    rafId = requestAnimationFrame(tick);
  });

  onUnmounted(() => {
    cancelAnimationFrame(rafId);
  });

  return { now };
}
