// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import Login from "@/pages/auth/Login.vue";
import Register from "@/pages/auth/Register.vue";
import Feed from "@/pages/social/Feed.vue";
import PostDetail from "@/pages/social/PostDetail.vue";
import CreatePost from "@/pages/social/CreatePost.vue";
import Profile from "@/pages/me/Profile.vue";
import Sky from "@/pages/astro/Sky.vue";

import Blocks from "@/pages/me/Blocks.vue";
import MyReports from "@/pages/me/MyReports.vue";
import MyReportDetail from "@/pages/me/MyReportDetail.vue";
import UserProfile from "@/pages/user/Profile.vue";

// ✅ 管理端（阶段D）
import AdminReports from "@/pages/admin/AdminReports.vue";
import AdminReportDetail from "@/pages/admin/AdminReportDetail.vue";
import AdminAudit from "@/pages/admin/AdminAudit.vue";

const routes = [
  { path: "/", redirect: "/feed" },

  { path: "/login", name: "Login", component: Login, meta: { public: true } },
  { path: "/register", name: "Register", component: Register, meta: { public: true } },

  { path: "/feed", name: "Feed", component: Feed, meta: { requiresAuth: true } },
  { path: "/post/create", name: "CreatePost", component: CreatePost, meta: { requiresAuth: true } },
  { path: "/post/:id", name: "PostDetail", component: PostDetail, meta: { requiresAuth: true } },

  { path: "/user/:id", name: "UserProfile", component: UserProfile, meta: { requiresAuth: true } },

  { path: "/astro/sky", name: "AstroSky", component: Sky, meta: { requiresAuth: true } },

  { path: "/profile", name: "Profile", component: Profile, meta: { requiresAuth: true } },

  { path: "/me/blocks", name: "MyBlocks", component: Blocks, meta: { requiresAuth: true } },

  { path: "/me/reports", name: "MyReports", component: MyReports, meta: { requiresAuth: true } },
  { path: "/me/reports/:id", name: "MyReportDetail", component: MyReportDetail, meta: { requiresAuth: true } },

  // ✅ 管理端路由
  { path: "/admin/reports", name: "AdminReports", component: AdminReports, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/admin/reports/:id", name: "AdminReportDetail", component: AdminReportDetail, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: "/admin/audit", name: "AdminAudit", component: AdminAudit, meta: { requiresAuth: true, requiresAdmin: true } },

  { path: "/:pathMatch(.*)*", redirect: "/feed" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!auth.initialized) auth.initFromStorage();

  if (to.meta && to.meta.public) return true;

  if (to.meta && to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "Login", query: { redirect: to.fullPath } };
  }

  if (to.meta && to.meta.requiresAdmin) {
    if (!auth.isLoggedIn) {
      return { name: "Login", query: { redirect: to.fullPath } };
    }
    if (!auth.isAdmin) {
      return { name: "Feed" };
    }
  }

  return true;
});

export default router;
