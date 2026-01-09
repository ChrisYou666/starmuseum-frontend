export const ENDPOINTS = {
  // auth
  AUTH_REGISTER: "/api/iam/auth/register",
  AUTH_LOGIN: "/api/iam/auth/login",
  AUTH_REFRESH: "/api/iam/auth/refresh",
  AUTH_LOGOUT: "/api/iam/auth/logout",

  // me
  ME: "/api/iam/me",
  ME_PROFILE: "/api/iam/me/profile",
  ME_PRIVACY: "/api/iam/me/privacy",
  ME_AVATAR: "/api/iam/me/avatar",

  // posts
  POST_CREATE: "/api/post",
  POST_DETAIL: (id) => `/api/post/${id}`,
  POST_DELETE: (id) => `/api/post/${id}`,
  POST_PAGE: "/api/post/page",
  POST_MY_PAGE: "/api/post/my/page",
  POST_USER_PAGE: (userId) => `/api/post/user/${userId}/page`,

  // like
  POST_LIKE: (postId) => `/api/post/${postId}/like`,
  POST_UNLIKE: (postId) => `/api/post/${postId}/like`,

  // comment
  COMMENT_CREATE: (postId) => `/api/post/${postId}/comment`,
  COMMENT_PAGE: (postId) => `/api/post/${postId}/comment/page`,
  COMMENT_DELETE: (commentId) => `/api/post/comment/${commentId}`,

  // media
  MEDIA_UPLOAD: "/api/media/upload",
  MEDIA_UPLOAD_BATCH: "/api/media/upload/batch",
  MEDIA_DETAIL: (id) => `/api/media/${id}`,
  MEDIA_DELETE: (id) => `/api/media/${id}`,
  MEDIA_PAGE: "/api/media/page",
};
