import { defineStore } from "pinia";
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from "@/api/auth";
import { readAuth, writeAuth, clearAuth } from "@/utils/authStorage";

function extractTokens(payload) {
  const accessToken = payload?.accessToken || payload?.token || payload?.access_token || "";
  const refreshToken = payload?.refreshToken || payload?.refresh_token || payload?.refresh || "";
  return { accessToken, refreshToken };
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
  },

  actions: {
    initFromStorage() {
      const saved = readAuth();
      this.accessToken = saved.accessToken;
      this.refreshToken = saved.refreshToken;
      this.currentUser = saved.currentUser;
      this.initialized = true;
    },

    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken || "";
      this.refreshToken = refreshToken || "";
      writeAuth({ accessToken: this.accessToken, refreshToken: this.refreshToken });
    },

    setCurrentUser(user) {
      this.currentUser = user || null;
      writeAuth({ currentUser: this.currentUser });
    },

    clear() {
      this.accessToken = "";
      this.refreshToken = "";
      this.currentUser = null;
      clearAuth();
    },

    async register({ email, nickname, password, confirmPassword }) {
      // 后端要求 nickname 非空，password 8~64
      await apiRegister({ email, nickname, password, confirmPassword });
      return true;
    },

    async login({ email, password }) {
      const payload = await apiLogin({ email, password });
      const { accessToken, refreshToken } = extractTokens(payload);

      if (!accessToken || !refreshToken) {
        throw new Error("登录成功但未拿到 accessToken/refreshToken（请检查后端返回字段名）");
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
