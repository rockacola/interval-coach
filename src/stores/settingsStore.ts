import { defineStore } from 'pinia';
import { ref } from 'vue';

export type TimeDisplayFormat = 'HH:mm:ss.SSS' | 'mm:ss.SSS';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const timeFormat = ref<TimeDisplayFormat>('HH:mm:ss.SSS');

    function setTimeFormat(format: TimeDisplayFormat): void {
      timeFormat.value = format;
    }

    return { setTimeFormat, timeFormat };
  },
  { persist: true }
);
