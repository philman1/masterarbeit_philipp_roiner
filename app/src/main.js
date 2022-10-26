import "./main.css";
import "solana-wallets-vue/styles.css";

import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import store from "./store";
const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

import { createApp } from "vue";
import App from "./App.vue";

createApp(App).use(router).use(store).mount("#app");
