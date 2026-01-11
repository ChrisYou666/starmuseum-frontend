// src/api/me.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapDeep } from "@/api/unwrap";

export async function getMe() {
  const res = await api.get(ENDPOINTS.ME).then((r) => r.data);
  return unwrapDeep(res);
}

export async function updateProfile(payload) {
  const res = await api.put(ENDPOINTS.ME_PROFILE, payload).then((r) => r.data);
  return unwrapDeep(res);
}

export async function updatePrivacy(payload) {
  const res = await api.put(ENDPOINTS.ME_PRIVACY, payload).then((r) => r.data);
  return unwrapDeep(res);
}

/**
 * 注意：后端不支持 multipart 上传头像
 * 这里只发送 JSON（通常字段是 avatarMediaId / mediaId / avatarUrl 等）
 */
export async function updateAvatar(payload) {
  const res = await api.put(ENDPOINTS.ME_AVATAR, payload).then((r) => r.data);
  return unwrapDeep(res);
}
