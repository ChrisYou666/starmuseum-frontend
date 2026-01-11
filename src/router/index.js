import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import Login from "@/pages/auth/Login.vue";
import Register from "@/pages/auth/Register.vue";
import Feed from "@/pages/social/Feed.vue";
import PostDetail from "@/pages/social/PostDetail.vue";
import CreatePost from "@/pages/social/CreatePost.vue";
import Profile from "@/pages/me/Profile.vue";
import Sky from "@/pages/astro/Sky.vue";

const routes = [
  { path: "/", redirect: "/feed" },

  { path: "/login", name: "Login", component: Login, meta: { public: true } },
  { path: "/register", name: "Register", component: Register, meta: { public: true } },

  { path: "/feed", name: "Feed", component: Feed, meta: { requiresAuth: true } },
  { path: "/post/create", name: "CreatePost", component: CreatePost, meta: { requiresAuth: true } },
  { path: "/post/:id", name: "PostDetail", component: PostDetail, meta: { requiresAuth: true } },

  // Astro（阶段2）
  { path: "/astro/sky", name: "AstroSky", component: Sky, meta: { requiresAuth: true } },

  { path: "/profile", name: "Profile", component: Profile, meta: { requiresAuth: true } },

  // 可选：兜底（防止输入不存在的地址白屏）
  { path: "/:pathMatch(.*)*", redirect: "/feed" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫：未登录访问受保护页面 → 跳登录
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!auth.initialized) auth.initFromStorage();

  // public 页面不需要登录
  if (to.meta && to.meta.public) return true;

  // 需要登录但没登录 → 跳登录，并带 redirect
  if (to.meta && to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
