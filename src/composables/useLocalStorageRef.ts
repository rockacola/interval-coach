import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useLocalStorageRef<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key);
  const initial = stored !== null ? (JSON.parse(stored) as T) : defaultValue;
  const state = ref<T>(initial) as Ref<T>;

  watch(state, (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  });

  return state;
}
