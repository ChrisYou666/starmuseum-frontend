// src/api/auth.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapDeep } from "@/api/unwrap";

export async function register(payload) {
  const res = await api.post(ENDPOINTS.AUTH_REGISTER, payload).then((r) => r.data);
  return unwrapDeep(res);
}

export async function login(payload) {
  const res = await api.post(ENDPOINTS.AUTH_LOGIN, payload).then((r) => r.data);
  // ✅ 这里会把你截图里的双层 data 解到最终 token 对象
  return unwrapDeep(res);
}

export async function refreshToken(payload) {
  const res = await api.post(ENDPOINTS.AUTH_REFRESH, payload).then((r) => r.data);
  return unwrapDeep(res);
}

export async function logout() {
  const res = await api.post(ENDPOINTS.AUTH_LOGOUT).then((r) => r.data);
  return unwrapDeep(res);
}

export async function getMe() {
  const res = await api.get(ENDPOINTS.ME).then((r) => r.data);
  return unwrapDeep(res);
}
