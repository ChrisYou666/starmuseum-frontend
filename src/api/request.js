import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";
import { readAuth, writeAuth, clearAuth } from "@/utils/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
});

// 专门用于 refresh 的 axios（避免递归触发拦截器）
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, newToken = null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(newToken);
  });
  pendingQueue = [];
}

function goLoginHard() {
  clearAuth();
  // 用硬跳转最稳，避免 router 循环依赖
  window.location.href = "/login";
}

// 请求拦截：自动带 accessToken
api.interceptors.request.use(
  (config) => {
    const { accessToken } = readAuth();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截：401 自动 refresh + 重放
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (status !== 401) return Promise.reject(error);

    // 没有原请求 或 已经重试过，直接回登录
    if (!originalRequest || originalRequest.__isRetryRequest) {
      goLoginHard();
      return Promise.reject(error);
    }

    originalRequest.__isRetryRequest = true;

    // 正在 refresh：排队等待 refresh 结果
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    // 开始 refresh
    isRefreshing = true;
    try {
      const { refreshToken } = readAuth();
      if (!refreshToken) {
        goLoginHard();
        return Promise.reject(error);
      }

      const refreshResp = await refreshClient.post(ENDPOINTS.AUTH_REFRESH, {
        refreshToken,
      });

      // 兼容：后端可能返回 Result 包装：{code,message,data}
      const body = refreshResp.data;
      const payload = body && body.code !== undefined && body.data !== undefined ? body.data : body;

      const newAccessToken =
        payload?.accessToken || payload?.token || payload?.access_token;

      const newRefreshToken =
        payload?.refreshToken || payload?.refresh_token || refreshToken;

      if (!newAccessToken) {
        goLoginHard();
        return Promise.reject(new Error("Refresh success but no accessToken returned"));
      }

      writeAuth({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      resolveQueue(null, newAccessToken);

      // 重放原请求
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      resolveQueue(refreshErr, null);
      goLoginHard();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
