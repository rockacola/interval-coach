import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSettingsStore } from '@/stores/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('defaults to HH:mm:ss.SSS format', () => {
    expect(useSettingsStore().timeFormat).toBe('HH:mm:ss.SSS');
  });

  it('updates timeFormat via setTimeFormat', () => {
    const store = useSettingsStore();
    store.setTimeFormat('mm:ss.SSS');
    expect(store.timeFormat).toBe('mm:ss.SSS');
  });

  it('can switch back to HH:mm:ss.SSS', () => {
    const store = useSettingsStore();
    store.setTimeFormat('mm:ss.SSS');
    store.setTimeFormat('HH:mm:ss.SSS');
    expect(store.timeFormat).toBe('HH:mm:ss.SSS');
  });

  it('defaults distanceUnit to km', () => {
    expect(useSettingsStore().distanceUnit).toBe('km');
  });

  it('updates distanceUnit via setDistanceUnit', () => {
    const store = useSettingsStore();
    store.setDistanceUnit('mi');
    expect(store.distanceUnit).toBe('mi');
  });

  it('can switch distanceUnit back to km', () => {
    const store = useSettingsStore();
    store.setDistanceUnit('mi');
    store.setDistanceUnit('km');
    expect(store.distanceUnit).toBe('km');
  });
});
