import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Overview' } },
  { path: '/calendar', name: 'calendar', component: () => import('../views/CalendarView.vue'), meta: { title: 'My calendar' } },
  { path: '/log', name: 'log', component: () => import('../views/LogView.vue'), meta: { title: 'Daily log' } },
  { path: '/insights', name: 'insights', component: () => import('../views/InsightsView.vue'), meta: { title: 'Cycle insights' } },
  { path: '/learn', name: 'learn', component: () => import('../views/LearnView.vue'), meta: { title: 'Learn' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: 'Settings' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' })
})

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · Bloom — Cycle Care` : 'Bloom — Cycle Care'
})

export { routes }
export default router
