// src/api/blocks.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/** 拉黑某用户 */
export async function blockUser(blockedUserId) {
  const resp = await api.post(ENDPOINTS.BLOCK_CREATE(blockedUserId));
  return resp.data;
}

/** 取消拉黑 */
export async function unblockUser(blockedUserId) {
  const resp = await api.delete(ENDPOINTS.BLOCK_DELETE(blockedUserId));
  return resp.data;
}

/**
 * 我的拉黑列表（分页）
 * GET /api/blocks?page=&size=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getMyBlocks(params = {}) {
  const p = buildPageParams(params);
  const resp = await api.get(ENDPOINTS.BLOCK_PAGE, { params: p });
  const page = normalizePageData(resp.data);
  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}
