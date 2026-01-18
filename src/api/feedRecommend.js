// src/api/feedRecommend.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * 去掉 undefined，避免 axios 生成多余 query/body
 */
function cleanUndefined(obj) {
  const o = { ...(obj || {}) };
  Object.keys(o).forEach((k) => {
    if (o[k] === undefined) delete o[k];
  });
  return o;
}

/**
 * 兼容后端常见两种包装：
 * A: { code, message, data: { records, total, ... }, timestamp }
 * B: { code, message, data: { code, message, data: { records, total } } }
 */
export function unwrapBizData(respData) {
  if (!respData) return respData;

  // 外层 data
  let d = respData.data !== undefined ? respData.data : respData;

  // 处理双层 {code,message,data}
  if (d && typeof d === "object" && "data" in d && ("code" in d || "message" in d)) {
    d = d.data;
  }

  return d;
}

/**
 * Feed 推荐分页（阶段5）
 * GET /api/feed/recommend?page=1&size=10&mode=HOT|FOLLOW|MIX
 */
export async function getFeedRecommendPage({ page = 1, size = 10, mode = "MIX" } = {}) {
  const resp = await api.get(ENDPOINTS.FEED_RECOMMEND, {
    params: cleanUndefined({ page, size, mode }),
  });
  return resp.data;
}

/**
 * 旧接口兜底：post/page
 * 这里不直接 import social.js，避免循环依赖；直接走 endpoints
 */
export async function getLegacyFeedPage({ page = 1, size = 10 } = {}) {
  const resp = await api.get(ENDPOINTS.POST_PAGE, {
    params: cleanUndefined({ page, size }),
  });
  return resp.data;
}
