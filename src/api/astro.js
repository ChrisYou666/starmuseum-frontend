// src/api/astro.js
import api from "./request";

/**
 * 统一解包：后端可能返回
 * 1) { code, message, data }
 * 2) 直接 data
 */
function unwrapPayload(payload) {
  if (payload == null) return payload;
  if (typeof payload === "object" && "code" in payload && "data" in payload) {
    return payload.data;
  }
  return payload;
}

/**
 * 搜索天体
 * GET /api/astro/search?q=xxx&limit=20&offset=1
 */
export async function searchBodies({ q, limit = 20, offset = 1 } = {}) {
  const res = await api.get("/api/astro/search", {
    params: { q, limit, offset },
  });
  return unwrapPayload(res.data);
}

/**
 * 获取天空摘要
 * GET /api/astro/sky/summary?time=...&lat=...&lon=...&limit=50&visibleOnly=true&sort=alt
 */
export async function getSkySummary({
                                      time,
                                      lat,
                                      lon,
                                      limit = 50,
                                      visibleOnly = true,
                                      sort = "alt",
                                    } = {}) {
  const res = await api.get("/api/astro/sky/summary", {
    params: { time, lat, lon, limit, visibleOnly, sort },
  });
  return unwrapPayload(res.data);
}

/**
 * 获取天体详情
 * 后端：
 * GET /api/astro/body/{id}?time=...&lat=...&lon=...
 *
 * ✅企业级：兼容两种调用方式
 * 1) getBodyDetail({ id, time, lat, lon })
 * 2) getBodyDetail(id, { time, lat, lon })
 */
export async function getBodyDetail(arg1, arg2) {
  let id, time, lat, lon;

  if (typeof arg1 === "object" && arg1 !== null) {
    ({ id, time, lat, lon } = arg1);
  } else {
    id = arg1;
    const params = arg2 || {};
    time = params.time;
    lat = params.lat;
    lon = params.lon;
  }

  if (id === undefined || id === null || id === "") {
    throw new Error(`[getBodyDetail] invalid id: ${id}`);
  }

  const res = await api.get(`/api/astro/body/${id}`, {
    params: { time, lat, lon },
  });
  return unwrapPayload(res.data);
}
