import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "auth" */ '@/views/AuthPage.vue')
  }, {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/DashboardPage.vue'),
    meta: { requiresAuth: true }
  }, {
    path: '*',
    redirect: '/login'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => to.meta.requiresAuth
    ? JSON.parse(window.localStorage.getItem('accessToken'))
      ? next() : next('/login')
    : next()
)

export default router
