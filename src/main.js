import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'
import '../public/iconfont/iconfont.css'

Vue.config.productionTip = false;

var axios = require('axios');
// axios.defaults.baseURL = '/api';

Vue.prototype.$axios = axios;

Vue.use(ElementUI);


new Vue({
  el: '#app',
  router,
  render: h => h(App)
});

router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面title */
  document.title = "JustLive"
  next()
})
