// src/api/request.js
import axios from "axios";
import { ENDPOINTS } from "@/api/endpoints";
import { readAuth, writeAuth, clearAuth } from "@/utils/authStorage";
import { ApiError, unwrapDeep, extractErrorMessage } from "@/api/unwrap";

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

/**
 * ✅ NotVisibleError：用于“内容不可见/已删除/404”等场景
 * 目的：不弹 toast，让页面用 EmptyState 统一兜底
 */
export class NotVisibleError extends Error {
  constructor(message, { status = null, data = null, url = "" } = {}) {
    super(message);
    this.name = "NotVisibleError";
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

// 判断是否属于“不可见/已删除/被拉黑”等应走 EmptyState 的语义
function isNotVisibleMessage(message) {
  const m = String(message || "").toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("不可见") ||
    m.includes("已删除") ||
    m.includes("deleted") ||
    m.includes("blocked") ||
    // 有些后端会用 Forbidden + message 表达不可见
    (m.includes("forbidden") && (m.includes("view") || m.includes("查看") || m.includes("访问")))
  );
}

/**
 * 极简 toast（不依赖 UI 框架）
 * - 阶段3联调期间统一提示
 * - 不会打断页面逻辑（比 alert 更友好）
 * ✅ 已改为暗色玻璃风格，避免白底白字看不清
 */
function toast(message, type = "error") {
  const msg = String(message || "").trim();
  if (!msg) return;

  const id = "__starmuseum_toast_container__";
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement("div");
    container.id = id;
    container.style.position = "fixed";
    container.style.top = "12px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  const item = document.createElement("div");
  item.style.pointerEvents = "auto";
  item.style.maxWidth = "760px";
  item.style.padding = "10px 12px";
  item.style.borderRadius = "12px";
  item.style.boxShadow = "0 10px 30px rgba(0,0,0,.22)";
  item.style.fontSize = "14px";
  item.style.lineHeight = "1.4";
  item.style.border = "1px solid rgba(255,255,255,.14)";
  item.style.background = "rgba(255,255,255,.10)";
  item.style.color = "rgba(255,255,255,.92)";
  item.style.backdropFilter = "blur(10px)";
  item.style.webkitBackdropFilter = "blur(10px)";

  // type 标记（不使用颜色主题，仅加前缀）
  const prefix = type === "success" ? "✅ " : type === "warn" ? "⚠️ " : "❌ ";
  item.textContent = prefix + msg;

  container.appendChild(item);

  window.setTimeout(() => {
    try {
      container.removeChild(item);
    } catch (_) {
      // ignore
    }
  }, 3500);
}

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

function shouldForceRelogin({ status, url, message }) {
  const u = String(url || "");
  const msg = String(message || "").toLowerCase();

  // refresh/me 相关接口如果 401/403，基本可认为 token 已失效
  if (u.includes(ENDPOINTS.AUTH_REFRESH) || u.includes(ENDPOINTS.ME)) return true;

  // 典型“token失效/未登录”语义（后端 message 可能中英混用）
  if (
    msg.includes("token") ||
    msg.includes("unauthorized") ||
    msg.includes("not logged") ||
    msg.includes("login") ||
    msg.includes("未登录") ||
    msg.includes("请登录") ||
    (msg.includes("无效") && msg.includes("token"))
  ) {
    return true;
  }

  // 401 直接认为需要重新登录（refresh 会在下面先尝试）
  if (status === 401) return true;

  return false;
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

// 成功响应拦截：统一递归解包（兼容 advice + Result 双层包装）
api.interceptors.response.use(
  (resp) => {
    try {
      resp.data = unwrapDeep(resp.data);
      return resp;
    } catch (e) {
      // code!=0 的“业务失败”会在这里变成 ApiError
      return Promise.reject(e);
    }
  },
  async (error) => {
    // unwrapDeep 抛出的 ApiError（通常是 HTTP 200 但 code!=0）
    if (error instanceof ApiError || error?.name === "ApiError") {
      toast(error.message || "请求失败");
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const originalRequest = error?.config;

    // 尽可能拿到 message
    const raw = error?.response?.data;
    const msg =
      extractErrorMessage(raw) ||
      raw?.message ||
      raw?.msg ||
      error?.message ||
      (status ? `HTTP ${status}` : "Network error");

    // ✅ 404：统一当“不可见/不存在”处理（交给页面 EmptyState，不 toast）
    if (status === 404) {
      return Promise.reject(new NotVisibleError(msg || "Not Found", { status, data: raw, url: originalRequest?.url }));
    }

    // ✅ 403：阶段3会用 403 表达“禁言/封禁/不可见”等业务拦截
    // 处理策略：
    // - 如果明确 token 失效/未登录/refresh/me 失败 → 硬跳登录
    // - 否则：
    //    - 若语义是“不可见/删除/被拉黑”等 → 抛 NotVisibleError（不 toast）
    //    - 其余业务拦截（禁言/封禁/重复举报等）→ toast message
    if (status === 403) {
      if (shouldForceRelogin({ status, url: originalRequest?.url, message: msg })) {
        goLoginHard();
      } else {
        if (isNotVisibleMessage(msg)) {
          return Promise.reject(new NotVisibleError(msg, { status, data: raw, url: originalRequest?.url }));
        }
        toast(msg, "warn");
      }
      return Promise.reject(error);
    }

    // 只处理 401 刷新（其他 status 直接抛出）
    if (status !== 401) {
      toast(msg);
      return Promise.reject(error);
    }

    // 没有原请求 或 已经重试过，直接回登录
    if (!originalRequest || originalRequest.__isRetryRequest) {
      // 401 且重试失败：认为 token 已失效
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

      // ✅ 递归解包（可能 advice+Result 双层）
      const payload = unwrapDeep(refreshResp.data);

      const newAccessToken = payload?.accessToken || payload?.token || payload?.access_token;
      const newRefreshToken = payload?.refreshToken || payload?.refresh_token || refreshToken;

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

      // refresh 失败：按“需要重新登录”处理，但也尽量提示原因
      const rmsg =
        extractErrorMessage(refreshErr?.response?.data) ||
        refreshErr?.message ||
        "登录状态已失效，请重新登录";
      toast(rmsg);
      goLoginHard();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
