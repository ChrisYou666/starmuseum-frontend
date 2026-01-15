import { defineStore } from "pinia";
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from "@/api/auth";
import { readAuth, writeAuth, clearAuth } from "@/utils/authStorage";

function extractTokens(payload) {
  const accessToken =
    payload?.accessToken || payload?.token || payload?.access_token || "";
  const refreshToken =
    payload?.refreshToken || payload?.refresh_token || payload?.refresh || "";
  return { accessToken, refreshToken };
}

function pickRole(u) {
  // 兼容后端可能返回的字段名
  return u?.role || u?.userRole || u?.type || u?.userType || "";
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: "",
    refreshToken: "",
    currentUser: null,
    initialized: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,

    // ✅ 兼容：有些地方会用 auth.token
    token: (state) => state.accessToken,

    // ✅ 阶段D需要：路由守卫 / 后台入口判断
    isAdmin: (state) => {
      const role = String(pickRole(state.currentUser) || "").toLowerCase();
      return role === "admin";
    },
  },

  actions: {
    initFromStorage() {
      // ✅ 避免重复 init
      if (this.initialized) return;

      const saved = readAuth();
      this.accessToken = saved.accessToken || "";
      this.refreshToken = saved.refreshToken || "";
      this.currentUser = saved.currentUser || null;
      this.initialized = true;

      // ✅ 兼容：如果 request.js 直接读 localStorage.token
      if (this.accessToken) {
        localStorage.setItem("token", this.accessToken);
      } else {
        localStorage.removeItem("token");
      }
    },

    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken || "";
      this.refreshToken = refreshToken || "";

      writeAuth({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      });

      // ✅ 兼容：如果 request.js 直接读 localStorage.token
      if (this.accessToken) {
        localStorage.setItem("token", this.accessToken);
      } else {
        localStorage.removeItem("token");
      }
    },

    setCurrentUser(user) {
      this.currentUser = user || null;
      writeAuth({ currentUser: this.currentUser });
    },

    clear() {
      this.accessToken = "";
      this.refreshToken = "";
      this.currentUser = null;
      this.initialized = true;

      clearAuth();

      // ✅ 兼容：清理 localStorage.token
      localStorage.removeItem("token");
    },

    async register({ email, nickname, password, confirmPassword }) {
      // 后端要求 nickname 非空，password 8~64
      await apiRegister({ email, nickname, password, confirmPassword });
      return true;
    },

    /**
     * ✅ 兼容两种调用：
     * 1) auth.login({email, password})
     * 2) auth.login(email, password)
     */
    async login(arg1, arg2) {
      let email = "";
      let password = "";

      if (typeof arg1 === "object" && arg1) {
        email = arg1.email || arg1.username || "";
        password = arg1.password || "";
      } else {
        email = arg1 || "";
        password = arg2 || "";
      }

      email = String(email || "").trim();
      password = String(password || "");

      const payload = await apiLogin({ email, password });
      const { accessToken, refreshToken } = extractTokens(payload);

      // ✅ 注意：你的后端如果只有 accessToken，没有 refreshToken
      // 这里就会报错；如果你确认后端阶段3只发 token，请告诉我，我给你改成“refreshToken 可选”版本。
      if (!accessToken || !refreshToken) {
        throw new Error(
          "登录成功但未拿到 accessToken/refreshToken（请检查后端返回字段名）"
        );
      }

      this.setTokens(accessToken, refreshToken);

      const me = await getMe();
      this.setCurrentUser(me);

      return true;
    },

    async logout() {
      try {
        await apiLogout();
      } finally {
        this.clear();
      }
    },
  },
});
