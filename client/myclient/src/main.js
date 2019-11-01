import Vue from "vue";
import App from "./App.vue";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import router from './router'
import './../node_modules/bulma/css/bulma.css';
Vue.use(Buefy)

Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
// Vue.prototype.moment = moment;
// Vue.prototype.$L = L;


new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
