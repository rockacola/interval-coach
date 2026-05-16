import { createRouter, createWebHashHistory } from 'vue-router';

import LiveSessionView from '@/views/LiveSessionView.vue';
import SetupView from '@/views/SetupView.vue';
import SummaryView from '@/views/SummaryView.vue';

const router = createRouter({
  // Hash history avoids 404s on GitHub Pages without server config
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'setup',
      component: SetupView,
    },
    {
      path: '/session',
      name: 'session',
      component: LiveSessionView,
    },
    {
      path: '/summary',
      name: 'summary',
      component: SummaryView,
    },
  ],
});

export default router;
