import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import type { Runner, RunnerId, RunnerRuntimeState } from '@/types';
import { generateId } from '@/utils/timing';

export const useRunnerStore = defineStore(
  'runner',
  () => {
    const runners = ref<Runner[]>([]);
    // Runtime state is derived from timing events but cached here for fast reads.
    // It IS persisted so live state survives refresh.
    const runtimeStates = ref<Record<RunnerId, RunnerRuntimeState>>({});

    const sortedRunners = computed(() =>
      [...runners.value].filter((r) => !r.deleted).sort((a, b) => a.sortOrder - b.sortOrder)
    );

    const deletedRunners = computed(() =>
      [...runners.value].filter((r) => r.deleted).sort((a, b) => a.sortOrder - b.sortOrder)
    );

    function addRunner(name: string, bibNumber?: string): Runner {
      const runner: Runner = {
        id: generateId(),
        name: name.trim(),
        bibNumber: bibNumber?.trim(),
        sortOrder: runners.value.length,
      };
      runners.value.push(runner);
      runtimeStates.value[runner.id] = {
        runnerId: runner.id,
        state: 'idle',
        currentIntervalId: null,
        currentIntervalStartMs: null,
        pausedAtMs: null,
        totalPausedMs: 0,
      };
      return runner;
    }

    function updateRunner(id: RunnerId, patch: Partial<Pick<Runner, 'name' | 'bibNumber'>>): void {
      const runner = runners.value.find((r) => r.id === id);
      if (!runner) return;
      if (patch.name !== undefined) runner.name = patch.name.trim();
      if (patch.bibNumber !== undefined) runner.bibNumber = patch.bibNumber.trim();
    }

    function removeRunner(id: RunnerId): void {
      const runner = runners.value.find((r) => r.id === id);
      if (!runner) {
        return;
      }
      runner.deleted = true;
    }

    function restoreRunner(id: RunnerId): void {
      const runner = runners.value.find((r) => r.id === id);
      if (!runner) {
        return;
      }
      runner.deleted = false;
    }

    function moveRunnerUp(id: RunnerId): void {
      const sorted = sortedRunners.value;
      const idx = sorted.findIndex((r) => r.id === id);
      if (idx <= 0) {
        return;
      }
      const ids = sorted.map((r) => r.id);
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
      reorderRunners(ids);
    }

    function moveRunnerDown(id: RunnerId): void {
      const sorted = sortedRunners.value;
      const idx = sorted.findIndex((r) => r.id === id);
      if (idx === -1 || idx >= sorted.length - 1) {
        return;
      }
      const ids = sorted.map((r) => r.id);
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
      reorderRunners(ids);
    }

    function reorderRunners(orderedIds: RunnerId[]): void {
      orderedIds.forEach((id, index) => {
        const runner = runners.value.find((r) => r.id === id);
        if (runner) runner.sortOrder = index;
      });
    }

    function getRuntimeState(id: RunnerId): RunnerRuntimeState | undefined {
      return runtimeStates.value[id];
    }

    function setRunnerState(id: RunnerId, patch: Partial<RunnerRuntimeState>): void {
      const current = runtimeStates.value[id];
      if (!current) return;
      runtimeStates.value[id] = { ...current, ...patch };
    }

    function resetAllRuntimeStates(): void {
      runners.value.forEach((r) => {
        runtimeStates.value[r.id] = {
          runnerId: r.id,
          state: 'idle',
          currentIntervalId: null,
          currentIntervalStartMs: null,
          pausedAtMs: null,
          totalPausedMs: 0,
        };
      });
    }

    function clearAll(): void {
      runners.value = [];
      runtimeStates.value = {};
    }

    return {
      runners,
      runtimeStates,
      sortedRunners,
      deletedRunners,
      addRunner,
      updateRunner,
      removeRunner,
      restoreRunner,
      moveRunnerUp,
      moveRunnerDown,
      reorderRunners,
      getRuntimeState,
      setRunnerState,
      resetAllRuntimeStates,
      clearAll,
    };
  },
  {
    persist: true,
  }
);
