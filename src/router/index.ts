import { createRouter, createWebHashHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';

const router = createRouter({
  // Hash history avoids 404s on GitHub Pages without server config
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('@/views/ReportView.vue'),
    },
  ],
});

export default router;
