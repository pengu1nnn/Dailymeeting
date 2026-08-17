import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Update from '@/views/Update.vue'
import AlcoholView from '@/views/AlcoholView.vue'
import FaqView from '@/views/faqView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/update',
      name: 'update',
      component: Update,
    },
    {
      path: '/alcohol',
      name: 'alcohol',
      component: AlcoholView,
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
    },
  ],
})

export default router
