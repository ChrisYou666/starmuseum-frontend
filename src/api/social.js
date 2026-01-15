// src/api/social.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/**
 * feed 分页（公共流/关注流等）
 * GET /api/post/page?page=&size=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getFeedPage(params = {}) {
  const p = buildPageParams(params);
  const resp = await api.get(ENDPOINTS.POST_PAGE, { params: p });
  const page = normalizePageData(resp.data);
  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}

/** 帖子详情 */
export async function getPostDetail(id) {
  const resp = await api.get(ENDPOINTS.POST_DETAIL(id));
  return resp.data;
}

/** 点赞 */
export async function likePost(postId) {
  const resp = await api.post(ENDPOINTS.POST_LIKE(postId));
  return resp.data;
}

/** 取消点赞（如果后端是 DELETE，则改这里即可；先按你现有前端调用保持兼容） */
export async function unlikePost(postId) {
  // 你原先 endpoints 里 unlike 与 like 同 path，可能后端用 DELETE 或 POST 取消
  // 这里优先尝试 DELETE，不行再退回 POST（避免后端差异导致联调卡死）
  try {
    const resp = await api.delete(ENDPOINTS.POST_UNLIKE(postId));
    return resp.data;
  } catch (_) {
    const resp2 = await api.post(ENDPOINTS.POST_UNLIKE(postId));
    return resp2.data;
  }
}
