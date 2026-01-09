import "@/styles/global.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "@/router";
import App from "@/App.vue";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

// 先恢复登录态
const auth = useAuthStore();
auth.initFromStorage();

app.use(router);
app.mount("#app");
