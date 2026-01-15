// src/api/comment.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/** 创建评论 */
export async function createComment(postId, payload) {
  const resp = await api.post(ENDPOINTS.COMMENT_CREATE(postId), payload);
  return resp.data;
}

/** 删除评论 */
export async function deleteComment(commentId) {
  const resp = await api.delete(ENDPOINTS.COMMENT_DELETE(commentId));
  return resp.data;
}

/**
 * 评论分页
 * GET /api/post/{postId}/comment/page?page=&size=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getCommentPage(postId, params = {}) {
  const p = buildPageParams(params);
  const resp = await api.get(ENDPOINTS.COMMENT_PAGE(postId), { params: p });
  const page = normalizePageData(resp.data);
  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}
