// src/stores/astro.js
import { defineStore } from "pinia";
import { getSkySummary, getBodyDetail } from "@/api/astro";

function isFiniteNumber(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

function clampNumber(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
}

function nowIsoZ() {
  // 后端示例使用 Z：2026-01-10T12:00:00Z
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export const useAstroStore = defineStore("astro", {
  state: () => ({
    // 参数
    time: nowIsoZ(),
    lat: 31.2304,
    lon: 121.4737,

    // Summary
    loadingSummary: false,
    errorSummary: "",
    summaryItems: [],
    summaryMeta: null,

    // Detail
    loadingDetail: false,
    errorDetail: "",
    selectedBodyId: null,
    selectedBodyDetail: null,

    // 防并发覆盖（只认最后一次请求）
    _summaryReqSeq: 0,
    _detailReqSeq: 0,
  }),

  actions: {
    initDefaults() {
      if (!this.time) this.time = nowIsoZ();
      if (!isFiniteNumber(this.lat)) this.lat = 31.2304;
      if (!isFiniteNumber(this.lon)) this.lon = 121.4737;
    },

    setNow() {
      this.time = nowIsoZ();
    },

    setLocation(lat, lon) {
      this.lat = lat;
      this.lon = lon;
    },

    validateParams() {
      const errors = [];

      if (!this.time || String(this.time).trim() === "") {
        errors.push("time 不能为空");
      }

      const latN = clampNumber(this.lat, -90, 90);
      const lonN = clampNumber(this.lon, -180, 180);

      if (latN === null) errors.push("lat 必须是数字");
      if (lonN === null) errors.push("lon 必须是数字");

      if (latN !== null && (latN < -90 || latN > 90)) errors.push("lat 必须在 -90~90");
      if (lonN !== null && (lonN < -180 || lonN > 180)) errors.push("lon 必须在 -180~180");

      return { ok: errors.length === 0, errors, latN, lonN };
    },

    clearDetail() {
      this.selectedBodyId = null;
      this.selectedBodyDetail = null;
      this.errorDetail = "";
      this.loadingDetail = false;
    },

    async reloadAll() {
      await this.loadSummary();
      // 不强制刷新 detail：只有当已选中时才刷新
      if (this.selectedBodyId != null) {
        await this.loadBodyDetail(this.selectedBodyId);
      }
    },

    async loadSummary() {
      const v = this.validateParams();
      if (!v.ok) {
        this.errorSummary = v.errors.join("；");
        this.summaryItems = [];
        this.summaryMeta = null;
        return;
      }

      const reqSeq = ++this._summaryReqSeq;
      this.loadingSummary = true;
      this.errorSummary = "";

      try {
        const data = await getSkySummary({
          time: this.time,
          lat: v.latN,
          lon: v.lonN,
          limit: 50,
          visibleOnly: true,
          sort: "alt",
        });

        // 只处理最后一次请求
        if (reqSeq !== this._summaryReqSeq) return;

        // 兼容 data 结构：可能 {items, meta} 或直接数组
        if (Array.isArray(data)) {
          this.summaryItems = data;
          this.summaryMeta = null;
        } else {
          this.summaryItems = data?.items || [];
          this.summaryMeta = data?.meta || null;
        }
      } catch (e) {
        if (reqSeq !== this._summaryReqSeq) return;
        this.errorSummary = e?.message || String(e);
        this.summaryItems = [];
        this.summaryMeta = null;
      } finally {
        if (reqSeq === this._summaryReqSeq) {
          this.loadingSummary = false;
        }
      }
    },

    async loadBodyDetail(bodyId) {
      // ✅底线：绝不允许 /body/undefined
      const id = Number(bodyId);
      if (!Number.isFinite(id) || id <= 0) {
        this.errorDetail = `invalid bodyId: ${bodyId}`;
        this.selectedBodyId = null;
        this.selectedBodyDetail = null;
        return;
      }

      const v = this.validateParams();
      if (!v.ok) {
        this.errorDetail = v.errors.join("；");
        this.selectedBodyId = id;
        this.selectedBodyDetail = null;
        return;
      }

      const reqSeq = ++this._detailReqSeq;
      this.loadingDetail = true;
      this.errorDetail = "";
      this.selectedBodyId = id;

      try {
        const detail = await getBodyDetail({
          id,
          time: this.time,
          lat: v.latN,
          lon: v.lonN,
        });

        if (reqSeq !== this._detailReqSeq) return;

        this.selectedBodyDetail = detail ?? null;
      } catch (e) {
        if (reqSeq !== this._detailReqSeq) return;
        this.errorDetail = e?.message || String(e);
        this.selectedBodyDetail = null;
      } finally {
        if (reqSeq === this._detailReqSeq) {
          this.loadingDetail = false;
        }
      }
    },
  },
});
