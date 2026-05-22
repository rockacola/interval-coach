import { mkdirSync } from 'fs';
import { join } from 'path';

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173/interval-coach';

// Seeded LCG so the same lap times are generated on every run.
function makePrng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// Build the localStorage state for 3 runners × 10 laps at 5–6 min per lap with ~1 min rest.
// pinia-plugin-persistedstate stores each store under its ID as the key.
function generateSampleData() {
  const rand = makePrng(42);
  const between = (min, max) => Math.floor(min + rand() * (max - min));

  let counter = 0;
  const uid = () => `sample-${++counter}`;

  const runnerDefs = [
    { bibNumber: '1', name: 'Alice' },
    { bibNumber: '2', name: 'Bob' },
    { bibNumber: '3', name: 'Carol' },
  ];

  const runners = runnerDefs.map((def, i) => ({
    bibNumber: def.bibNumber,
    id: uid(),
    name: def.name,
    sortOrder: i,
  }));

  const runtimeStates = {};
  for (const runner of runners) {
    runtimeStates[runner.id] = {
      currentIntervalId: null,
      currentIntervalStartMs: null,
      pausedAtMs: null,
      runnerId: runner.id,
      state: 'idle',
      totalPausedMs: 0,
    };
  }

  // Session started ~75 min ago so rest times look plausible in the screenshot.
  const BASE_MS = Date.now() - 75 * 60 * 1000;
  const runnerIntervals = [];
  let intervalStartMs = BASE_MS;

  for (let lap = 1; lap <= 10; lap++) {
    let maxFinishMs = intervalStartMs;

    for (const runner of runners) {
      const lapMs = between(300_000, 360_000); // 5:00 – 6:00
      const stopMs = intervalStartMs + lapMs;
      maxFinishMs = Math.max(maxFinishMs, stopMs);
      runnerIntervals.push({
        id: uid(),
        index: lap,
        runnerId: runner.id,
        startMs: intervalStartMs,
        stopMs,
      });
    }

    if (lap < 10) {
      intervalStartMs = maxFinishMs + between(55_000, 65_000); // ~1 min rest
    }
  }

  return {
    // key 'runner' → runnerStore state
    runner: { runners, runtimeStates },
    // key 'timing' → timingStore state
    timing: {
      currentIntervalId: null,
      currentIntervalNumber: 0,
      events: [],
      intervalDistanceKm: 1,
      intervals: [],
      laps: [],
      runnerIntervals,
    },
  };
}

async function injectSampleData(page) {
  const data = generateSampleData();
  await page.evaluate((d) => {
    localStorage.setItem('runner', JSON.stringify(d.runner));
    localStorage.setItem('timing', JSON.stringify(d.timing));
  }, data);
}

const ROUTES = [
  { name: 'home', path: '/#/', setup: injectSampleData },
  { name: 'report', path: '/#/report', setup: injectSampleData },
];

async function main() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const dest = join('snapshots', timestamp);
  mkdirSync(dest, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  // Navigate once to establish a localhost context so localStorage is accessible
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });

  for (const { name, path, setup } of ROUTES) {
    await page.evaluate(() => localStorage.clear());
    if (setup) {
      await setup(page);
    }
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load' });
    if (setup) {
      // Hash-route goto is a same-document navigation in Chrome — the page does not
      // reload, so Pinia never re-hydrates from the localStorage data we just injected.
      // Reload to force a fresh page load against the injected state.
      await page.reload({ waitUntil: 'load' });
    }
    // Timeout is intentional: SSE routes never reach networkidle
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    // Two-pass resize: use the footer's document bottom as the authoritative height.
    // scrollHeight is unreliable because body { min-height: 100vh } inflates it when
    // the viewport is resized. Measuring footer bottom avoids that, but vh-unit elements
    // shift on the first resize, so we re-measure and resize once more to settle.
    const footerBottom = (page) =>
      page.evaluate(() => {
        const footer = document.querySelector('footer');
        return footer
          ? Math.ceil(footer.getBoundingClientRect().bottom + window.scrollY)
          : document.documentElement.scrollHeight;
      });
    await page.setViewportSize({ width: 1280, height: await footerBottom(page) });
    await page.setViewportSize({ width: 1280, height: await footerBottom(page) });
    await page.screenshot({ path: join(dest, `${name}.png`) });
    console.log(`captured ${name}`);
  }

  await browser.close();
  console.log(`\nSnapshots saved to ${dest}/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
