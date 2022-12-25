import { BootstrapVue, IconsPlugin } from  'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'


Vue.use(BootstrapVue)
Vue.use(IconsPlugin)


Vue.config.productionTip = false
Vue.prototype.$axios = axios
axios.defaults.baseURL = process.env.VUE_APP_API_ENDPOINT


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
