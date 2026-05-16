import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { useRunnerStore } from '@/stores/runnerStore';

describe('runnerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('addRunner', () => {
    it('adds a runner with trimmed name', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('  Alice  ');
      expect(runner.name).toBe('Alice');
    });

    it('assigns ascending sortOrder', () => {
      const store = useRunnerStore();
      const a = store.addRunner('Alice');
      const b = store.addRunner('Bob');
      expect(a.sortOrder).toBe(0);
      expect(b.sortOrder).toBe(1);
    });

    it('initialises runtime state as idle', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice');
      expect(store.getRuntimeState(runner.id)?.state).toBe('idle');
    });

    it('stores optional bib number trimmed', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice', '  7  ');
      expect(runner.bibNumber).toBe('7');
    });
  });

  describe('sortedRunners', () => {
    it('excludes deleted runners', () => {
      const store = useRunnerStore();
      const a = store.addRunner('Alice');
      store.addRunner('Bob');
      store.removeRunner(a.id);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Bob']);
    });

    it('orders by sortOrder ascending', () => {
      const store = useRunnerStore();
      store.addRunner('Alice'); // sortOrder 0
      store.addRunner('Bob'); // sortOrder 1
      store.addRunner('Carol'); // sortOrder 2
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Carol']);
    });
  });

  describe('deletedRunners', () => {
    it('includes only deleted runners', () => {
      const store = useRunnerStore();
      const a = store.addRunner('Alice');
      store.addRunner('Bob');
      store.removeRunner(a.id);
      expect(store.deletedRunners.map((r) => r.name)).toEqual(['Alice']);
    });

    it('is empty when no runners are deleted', () => {
      const store = useRunnerStore();
      store.addRunner('Alice');
      expect(store.deletedRunners).toHaveLength(0);
    });
  });

  describe('removeRunner / restoreRunner', () => {
    it('marks runner as deleted', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice');
      store.removeRunner(runner.id);
      expect(runner.deleted).toBe(true);
    });

    it('restores deleted runner', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice');
      store.removeRunner(runner.id);
      store.restoreRunner(runner.id);
      expect(runner.deleted).toBe(false);
    });

    it('is a no-op for unknown id', () => {
      const store = useRunnerStore();
      expect(() => store.removeRunner('ghost')).not.toThrow();
    });

    it('restoreRunner is a no-op for unknown id', () => {
      const store = useRunnerStore();
      expect(() => store.restoreRunner('ghost')).not.toThrow();
    });
  });

  describe('updateRunner', () => {
    it('updates name with trim', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice');
      store.updateRunner(runner.id, { name: '  Bob  ' });
      expect(runner.name).toBe('Bob');
    });

    it('updates bibNumber with trim', () => {
      const store = useRunnerStore();
      const runner = store.addRunner('Alice');
      store.updateRunner(runner.id, { bibNumber: '  42  ' });
      expect(runner.bibNumber).toBe('42');
    });

    it('is a no-op for unknown id', () => {
      const store = useRunnerStore();
      expect(() => store.updateRunner('ghost', { name: 'X' })).not.toThrow();
    });
  });

  describe('moveRunnerUp', () => {
    it('swaps runner with the one above it', () => {
      const store = useRunnerStore();
      store.addRunner('Alice');
      const bob = store.addRunner('Bob');
      store.moveRunnerUp(bob.id);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Bob', 'Alice']);
    });

    it('is a no-op when already first', () => {
      const store = useRunnerStore();
      const alice = store.addRunner('Alice');
      store.addRunner('Bob');
      store.moveRunnerUp(alice.id);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Alice', 'Bob']);
    });
  });

  describe('moveRunnerDown', () => {
    it('swaps runner with the one below it', () => {
      const store = useRunnerStore();
      const alice = store.addRunner('Alice');
      store.addRunner('Bob');
      store.moveRunnerDown(alice.id);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Bob', 'Alice']);
    });

    it('is a no-op when already last', () => {
      const store = useRunnerStore();
      store.addRunner('Alice');
      const bob = store.addRunner('Bob');
      store.moveRunnerDown(bob.id);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Alice', 'Bob']);
    });
  });

  describe('resetAllRuntimeStates', () => {
    it('resets all runners back to idle', () => {
      const store = useRunnerStore();
      const a = store.addRunner('Alice');
      const b = store.addRunner('Bob');
      store.setRunnerState(a.id, { state: 'running' });
      store.setRunnerState(b.id, { state: 'paused' });
      store.resetAllRuntimeStates();
      expect(store.getRuntimeState(a.id)?.state).toBe('idle');
      expect(store.getRuntimeState(b.id)?.state).toBe('idle');
    });
  });

  describe('clearAll', () => {
    it('removes all runners and runtime states', () => {
      const store = useRunnerStore();
      store.addRunner('Alice');
      store.addRunner('Bob');
      store.clearAll();
      expect(store.runners).toHaveLength(0);
      expect(store.sortedRunners).toHaveLength(0);
    });
  });

  describe('reorderRunners', () => {
    it('reassigns sortOrder to match given id sequence', () => {
      const store = useRunnerStore();
      const a = store.addRunner('Alice');
      const b = store.addRunner('Bob');
      const c = store.addRunner('Carol');
      store.reorderRunners([c.id, a.id, b.id]);
      expect(store.sortedRunners.map((r) => r.name)).toEqual(['Carol', 'Alice', 'Bob']);
    });
  });
});
