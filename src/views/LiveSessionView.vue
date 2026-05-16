<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useRunnerStore } from '@/stores/runnerStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useTimingStore } from '@/stores/timingStore';
import type { RunnerId } from '@/types';
import { elapsedMs, formatDuration, formatDurationPrecise, nowMs } from '@/utils/timing';

const router = useRouter();
const sessionStore = useSessionStore();
const runnerStore = useRunnerStore();
const timingStore = useTimingStore();

// Reactive wall-clock for display
const tick = ref(nowMs());
let rafHandle = 0;

function frame() {
  tick.value = nowMs();
  rafHandle = requestAnimationFrame(frame);
}

onMounted(() => {
  rafHandle = requestAnimationFrame(frame);
});
onUnmounted(() => cancelAnimationFrame(rafHandle));

const session = computed(() => sessionStore.session);

const sessionElapsedMs = computed(() => {
  if (!session.value?.startedAtMs) return 0;
  return tick.value - session.value.startedAtMs;
});

const sessionElapsed = computed(() => formatDuration(sessionElapsedMs.value));

function startInterval() {
  if (!session.value) return;
  timingStore.startInterval(session.value.id);
}

function tapFinish(runnerId: RunnerId) {
  if (!session.value) return;
  timingStore.recordFinish(runnerId, session.value.id);
}

function togglePause(runnerId: RunnerId) {
  if (!session.value) return;
  const state = runnerStore.getRuntimeState(runnerId);
  if (!state) return;
  if (state.state === 'running') {
    timingStore.pauseRunner(runnerId, session.value.id);
  } else if (state.state === 'paused') {
    timingStore.resumeRunner(runnerId, session.value.id);
  }
}

function runnerElapsed(runnerId: RunnerId): string {
  const state = runnerStore.getRuntimeState(runnerId);
  if (!state || state.state === 'idle' || state.currentIntervalStartMs === null) return '--:--';
  if (state.state === 'finished') return 'Done';

  let paused = state.totalPausedMs;
  if (state.state === 'paused' && state.pausedAtMs !== null) {
    paused += tick.value - state.pausedAtMs;
  }
  const ms = elapsedMs(state.currentIntervalStartMs, paused, tick.value);
  return formatDurationPrecise(ms);
}

function runnerLapCount(runnerId: RunnerId): number {
  return timingStore.lapsForRunner(runnerId).length;
}

function endSession() {
  sessionStore.endSession();
  router.push({ name: 'summary' });
}

// Guard: redirect to setup if no session
onMounted(() => {
  if (!sessionStore.session) router.replace({ name: 'setup' });
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-900 text-white">
    <!-- Header: session timer -->
    <header class="px-4 pt-6 pb-4 text-center">
      <div class="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">
        {{ session?.name }}
      </div>
      <div class="text-6xl font-mono font-bold tabular-nums tracking-tight">
        {{ sessionElapsed }}
      </div>
      <div class="text-slate-400 text-sm mt-1">
        Interval {{ timingStore.currentIntervalNumber || '—' }}
      </div>
    </header>

    <!-- Runner list -->
    <main class="flex-1 px-4 space-y-3 pb-4">
      <div
        v-for="runner in runnerStore.sortedRunners"
        :key="runner.id"
        class="rounded-xl bg-slate-800 p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="font-semibold text-lg">{{ runner.name }}</span>
            <span v-if="runner.bibNumber" class="text-slate-400 text-sm ml-2"
              >#{{ runner.bibNumber }}</span
            >
          </div>
          <span class="text-slate-400 text-sm">{{ runnerLapCount(runner.id) }} laps</span>
        </div>

        <!-- Per-runner timer -->
        <div class="font-mono text-3xl font-bold tabular-nums mb-4 text-center">
          {{ runnerElapsed(runner.id) }}
        </div>

        <!-- Controls -->
        <div class="flex gap-3">
          <!-- Pause/Resume toggle -->
          <button
            v-if="
              runnerStore.getRuntimeState(runner.id)?.state === 'running' ||
              runnerStore.getRuntimeState(runner.id)?.state === 'paused'
            "
            class="flex-1 py-3 rounded-lg text-sm font-semibold"
            :class="
              runnerStore.getRuntimeState(runner.id)?.state === 'paused'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-700 text-slate-200'
            "
            @click="togglePause(runner.id)"
          >
            {{ runnerStore.getRuntimeState(runner.id)?.state === 'paused' ? 'Resume' : 'Pause' }}
          </button>

          <!-- Tap to finish -->
          <button
            class="flex-[2] py-4 rounded-lg font-bold text-xl text-white disabled:opacity-40 disabled:cursor-not-allowed"
            :class="
              runnerStore.getRuntimeState(runner.id)?.state === 'running'
                ? 'bg-emerald-600 active:bg-emerald-500'
                : 'bg-slate-700'
            "
            :disabled="runnerStore.getRuntimeState(runner.id)?.state !== 'running'"
            @click="tapFinish(runner.id)"
          >
            {{
              runnerStore.getRuntimeState(runner.id)?.state === 'finished'
                ? 'Finished'
                : runnerStore.getRuntimeState(runner.id)?.state === 'idle'
                  ? 'Waiting'
                  : 'Finish'
            }}
          </button>
        </div>
      </div>
    </main>

    <!-- Bottom controls -->
    <footer class="sticky bottom-0 bg-slate-900/95 backdrop-blur px-4 pt-3 pb-6 space-y-3">
      <button
        class="w-full py-4 rounded-xl bg-sky-600 font-bold text-white text-xl active:bg-sky-500"
        @click="startInterval"
      >
        {{
          timingStore.currentIntervalNumber === 0
            ? 'Start Interval 1'
            : `Start Interval ${timingStore.currentIntervalNumber + 1}`
        }}
      </button>
      <button
        class="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium"
        @click="endSession"
      >
        End Session
      </button>
    </footer>
  </div>
</template>
