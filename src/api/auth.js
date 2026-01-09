import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function unwrap(res) {
  // 兼容 Result<T>：{code,message,data}
  if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
  return res;
}

export async function register(payload) {
  const res = await api.post(ENDPOINTS.AUTH_REGISTER, payload).then((r) => r.data);
  return unwrap(res);
}

export async function login(payload) {
  const res = await api.post(ENDPOINTS.AUTH_LOGIN, payload).then((r) => r.data);
  return unwrap(res);
}

export async function refreshToken(payload) {
  const res = await api.post(ENDPOINTS.AUTH_REFRESH, payload).then((r) => r.data);
  return unwrap(res);
}

export async function logout() {
  const res = await api.post(ENDPOINTS.AUTH_LOGOUT).then((r) => r.data);
  return unwrap(res);
}

export async function getMe() {
  const res = await api.get(ENDPOINTS.ME).then((r) => r.data);
  return unwrap(res);
}
