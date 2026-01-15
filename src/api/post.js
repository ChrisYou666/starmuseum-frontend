// src/api/post.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

/**
 * 创建帖子（阶段3扩展：位置隐私字段）
 * payload 推荐字段：
 * - content
 * - visibility: PUBLIC | PRIVATE | FOLLOWERS(预留)
 * - mediaIds: number[]
 * - locationVisibility: HIDDEN | CITY | FUZZY | EXACT（可不传走用户默认）
 * - cityName?: string
 * - lat?: number
 * - lon?: number
 */
export async function createPost(payload = {}) {
  // 保持“向后兼容”：如果旧页面不传 location 字段也能发
  const body = {
    content: payload.content,
    visibility: payload.visibility,
    mediaIds: payload.mediaIds,

    // 阶段3位置字段（可选）
    locationVisibility: payload.locationVisibility,
    cityName: payload.cityName,
    lat: payload.lat,
    lon: payload.lon,
  };

  // 清理 undefined，避免后端 DTO 校验误判
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined) delete body[k];
  });

  const resp = await api.post(ENDPOINTS.POST_CREATE, body);
  return resp.data;
}
