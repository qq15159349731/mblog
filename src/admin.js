import Vue from 'vue'
import App from './components/admin.vue'
import router from './router/admin'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: {
    App
  }
})
