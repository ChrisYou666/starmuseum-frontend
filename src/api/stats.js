// src/api/stats.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function cleanUndefined(obj) {
  const o = { ...(obj || {}) };
  Object.keys(o).forEach((k) => {
    if (o[k] === undefined) delete o[k];
  });
  return o;
}

/**
 * 我的月度统计
 * GET /api/stats/me/month?month=YYYY-MM&top=10
 */
export async function getMyMonthStats({ month, top } = {}) {
  const resp = await api.get(ENDPOINTS.STATS_ME_MONTH, {
    params: cleanUndefined({ month, top }),
  });
  return resp.data;
}

/**
 * 我的区间统计
 * POST /api/stats/me/range
 * body: { from, to, top }
 */
export async function getMyRangeStats({ from, to, top } = {}) {
  const resp = await api.post(ENDPOINTS.STATS_ME_RANGE, cleanUndefined({ from, to, top }));
  return resp.data;
}

/**
 * 热门目标
 * POST /api/stats/hot/targets?top=10
 * body: { from, to }
 */
export async function getHotTargets({ from, to, top } = {}) {
  const resp = await api.post(
    ENDPOINTS.STATS_HOT_TARGETS,
    cleanUndefined({ from, to }),
    { params: cleanUndefined({ top }) }
  );
  return resp.data;
}
