import { defineStore } from 'pinia';
import { ref } from 'vue';

export type DistanceUnit = 'km' | 'mi';
export type TimeDisplayFormat = 'HH:mm:ss.SSS' | 'mm:ss.SSS';

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const distanceUnit = ref<DistanceUnit>('km');
    const timeFormat = ref<TimeDisplayFormat>('HH:mm:ss.SSS');

    function setDistanceUnit(unit: DistanceUnit): void {
      distanceUnit.value = unit;
    }

    function setTimeFormat(format: TimeDisplayFormat): void {
      timeFormat.value = format;
    }

    return { distanceUnit, setDistanceUnit, setTimeFormat, timeFormat };
  },
  { persist: true }
);
