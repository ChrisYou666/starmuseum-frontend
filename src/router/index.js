// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import Login from "@/pages/auth/Login.vue";
import Register from "@/pages/auth/Register.vue";

import Feed from "@/pages/social/Feed.vue";
import PostDetail from "@/pages/social/PostDetail.vue";
import CreatePost from "@/pages/social/CreatePost.vue";

import Profile from "@/pages/me/Profile.vue";
import Blocks from "@/pages/me/Blocks.vue";
import MyReports from "@/pages/me/MyReports.vue";
import MyReportDetail from "@/pages/me/MyReportDetail.vue";

import UserProfile from "@/pages/user/Profile.vue";

import Sky from "@/pages/astro/Sky.vue";

// ===== 阶段5 =====
import AstroDeviceProfiles from "@/pages/astro/DeviceProfiles.vue";
import AstroFov from "@/pages/astro/Fov.vue";

// ✅ F4：观测日志
import ObservationLogs from "@/pages/observation/ObservationLogs.vue";
import ObservationLogCreate from "@/pages/observation/ObservationLogCreate.vue";
import ObservationLogDetail from "@/pages/observation/ObservationLogDetail.vue";
import ObservationLogEdit from "@/pages/observation/ObservationLogEdit.vue";

import Stats from "@/pages/stats/Stats.vue";

// ✅ 管理端
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

  // ===== 阶段5：设备配置 / FOV =====
  { path: "/astro/device-profiles", name: "AstroDeviceProfiles", component: AstroDeviceProfiles, meta: { requiresAuth: true } },
  { path: "/astro/fov", name: "AstroFov", component: AstroFov, meta: { requiresAuth: true } },

  // ===== 阶段5：F4 观测日志 =====
  { path: "/observation/logs", name: "ObservationLogs", component: ObservationLogs, meta: { requiresAuth: true } },
  { path: "/observation/logs/create", name: "ObservationLogCreate", component: ObservationLogCreate, meta: { requiresAuth: true } },
  { path: "/observation/logs/:id", name: "ObservationLogDetail", component: ObservationLogDetail, meta: { requiresAuth: true } },
  { path: "/observation/logs/:id/edit", name: "ObservationLogEdit", component: ObservationLogEdit, meta: { requiresAuth: true } },

  { path: "/stats", name: "Stats", component: Stats, meta: { requiresAuth: true } },

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
