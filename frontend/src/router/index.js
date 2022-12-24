import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "auth" */ '../views/AuthPage.vue')
  }, {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '../views/DashboardPage.vue'),
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

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const authUser = JSON.parse(window.localStorage.getItem('accessToken'))
    authUser ? next() : next('/login')
  } else {
    next();
  }
});

export default router
