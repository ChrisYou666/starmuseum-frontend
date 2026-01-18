// src/api/endpoints.js
// 统一管理后端接口路径
// 注意：这里仅维护 path，不做请求。

export const ENDPOINTS = {
  // ===== auth =====
  AUTH_REGISTER: "/api/iam/auth/register",
  AUTH_LOGIN: "/api/iam/auth/login",
  AUTH_REFRESH: "/api/iam/auth/refresh",
  AUTH_LOGOUT: "/api/iam/auth/logout",

  // ===== me =====
  ME: "/api/iam/me",
  ME_PROFILE: "/api/iam/me/profile",
  ME_PRIVACY: "/api/iam/me/privacy",
  ME_AVATAR: "/api/iam/me/avatar",

  // ===== posts =====
  POST_CREATE: "/api/post",
  POST_DETAIL: (id) => `/api/post/${id}`,
  POST_PAGE: "/api/post/page",

  POST_LIKE: (postId) => `/api/post/${postId}/like`,
  POST_UNLIKE: (postId) => `/api/post/${postId}/like`,

  // ===== comment =====
  COMMENT_CREATE: (postId) => `/api/post/${postId}/comment`,
  COMMENT_PAGE: (postId) => `/api/post/${postId}/comment/page`,
  COMMENT_DELETE: (commentId) => `/api/post/comment/${commentId}`,

  // ===== media =====
  MEDIA_UPLOAD: "/api/media/upload",
  MEDIA_UPLOAD_BATCH: "/api/media/upload/batch",
  MEDIA_DETAIL: (id) => `/api/media/${id}`,
  MEDIA_DELETE: (id) => `/api/media/${id}`,
  MEDIA_PAGE: "/api/media/page",

  // ===== 阶段3：Block / Report / Admin / Audit =====

  // blocks
  BLOCK_CREATE: (blockedUserId) => `/api/blocks/${blockedUserId}`,
  BLOCK_DELETE: (blockedUserId) => `/api/blocks/${blockedUserId}`,
  BLOCK_PAGE: "/api/blocks",

  // reports (user side)
  REPORT_CREATE: "/api/reports",
  REPORT_MY_PAGE: "/api/reports/my",
  REPORT_MY_DETAIL: (id) => `/api/reports/my/${id}`,
  REPORT_MY_WITHDRAW: (id) => `/api/reports/my/${id}`,

  // reports (admin)
  ADMIN_REPORT_PAGE: "/api/admin/reports",
  ADMIN_REPORT_DETAIL: (id) => `/api/admin/reports/${id}`,
  ADMIN_REPORT_START: (id) => `/api/admin/reports/${id}/start`,
  ADMIN_REPORT_REVIEW: (id) => `/api/admin/reports/${id}/review`,

  // audit (admin)
  ADMIN_AUDIT_PAGE: "/api/admin/audit",

  // ===== 阶段5：增强体验与扩展 =====

  // 5A: Device Profiles（按后端 DeviceProfileController 对齐）
  DEVICE_PROFILE_CREATE: "/api/astro/device-profiles",
  DEVICE_PROFILE_UPDATE: (id) => `/api/astro/device-profiles/${id}`,

  // ✅ 我的设备配置列表：GET /api/astro/device-profiles?type=PHOTO|VISUAL
  DEVICE_PROFILE_LIST: "/api/astro/device-profiles",

  DEVICE_PROFILE_DETAIL: (id) => `/api/astro/device-profiles/${id}`,
  DEVICE_PROFILE_DELETE: (id) => `/api/astro/device-profiles/${id}`,

  // ✅ 获取默认：GET /api/astro/device-profiles/default?type=PHOTO|VISUAL
  DEVICE_PROFILE_DEFAULT: "/api/astro/device-profiles/default",

  // ✅ 设为默认：POST /api/astro/device-profiles/{id}/default
  DEVICE_PROFILE_SET_DEFAULT: (id) => `/api/astro/device-profiles/${id}/default`,

  // 5A: FOV
  FOV_CALC: "/api/astro/fov/calc",

  // 5B: Observation Logs
  OBS_LOG_CREATE: "/api/observation/logs",
  OBS_LOG_UPDATE: (id) => `/api/observation/logs/${id}`,
  OBS_LOG_PAGE: "/api/observation/logs",
  OBS_LOG_DETAIL: (id) => `/api/observation/logs/${id}`,
  OBS_LOG_DELETE: (id) => `/api/observation/logs/${id}`,
  OBS_LOG_PUBLISH: (id) => `/api/observation/logs/${id}/publish`,

  // 5C: Stats
  STATS_ME_MONTH: "/api/stats/me/month",
  STATS_ME_RANGE: "/api/stats/me/range",
  STATS_HOT_TARGETS: "/api/stats/hot/targets",

  // 5E: Follow & Feed Recommend
  FOLLOW: (userId) => `/api/follow/${userId}`,
  FOLLOW_IS_FOLLOWING: (userId) => `/api/follow/is-following/${userId}`,
  FOLLOW_MY_FOLLOWING: "/api/follow/my/following",
  FOLLOW_MY_FOLLOWERS: "/api/follow/my/followers",

  FEED_RECOMMEND: "/api/feed/recommend",
};
