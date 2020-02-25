import Vue from "vue"
import App from "./App.vue"
import router from "./router.js"
import "./plugins/element.js"
//导入字体图标
import "./assets/fonts/iconfont.css"
//导入全局样式
import "./assets/css/global.css"

import axios from "axios"

axios.defaults.baseURL = "https://www.liulongbin.top:8888/api/private/v1/"
//拦截器
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount("#app")
