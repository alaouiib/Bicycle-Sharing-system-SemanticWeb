import Vue from "vue";
import VueRouter from "vue-router";
import stationComponent from "../views/stationComponent.vue";
import createCityComponent from "../views/createCityComponent.vue";

import Home from "../components/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: ""
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  // dynamic segments start with a colon
  { path: "/station/:id", component: stationComponent },
  {
    path: "/createCity",
    component: createCityComponent
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
