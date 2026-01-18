<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>{{ isEdit ? "编辑观测日志" : "创建观测日志" }}</h1>
        <div class="sm-muted sm-small">阶段5-F4：观测日志 MVP（创建/编辑）</div>
      </div>

      <div class="ops">
        <button class="sm-btn" :disabled="saving" @click="goBack">返回</button>
        <button class="sm-btn primary" :disabled="saving" @click="save">
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </div>

    <div v-if="error" class="sm-error" style="margin-top: 12px">{{ error }}</div>

    <div class="sm-card panel">
      <div class="section-title">基础信息</div>

      <div class="grid">
        <div class="field">
          <label>观测时间（observed_at）*</label>
          <input class="sm-input" type="datetime-local" v-model="form.observedAtLocal" />
          <div class="sm-muted sm-small">后端字段：observedAt（LocalDateTime，不带 Z）</div>
        </div>

        <div class="field">
          <label>方式（方法）*</label>
          <select class="sm-input" v-model="form.method">
            <option :value="OBSERVATION_METHOD.PHOTO">照片（摄影）</option>
            <option :value="OBSERVATION_METHOD.VISUAL">目视</option>
          </select>
        </div>

        <div class="field">
          <label>设备配置（device_profile_id）</label>
          <select class="sm-input" v-model="form.deviceProfileId">
            <option :value="null">不绑定</option>
            <option v-for="p in deviceProfiles" :key="p.id" :value="p.id">
              #{{ p.id }} - {{ p.name }}（{{ p.type }}）
            </option>
          </select>
          <div class="sm-muted sm-small">
            下拉来自 F2 设备配置：method=PHOTO 对应 PHOTO 列表，VISUAL 对应 VISUAL 列表
          </div>
        </div>

        <div class="field">
          <label>成功（可选）</label>
          <select class="sm-input" v-model="form.success">
            <option :value="null">不填写</option>
            <option :value="1">成功</option>
            <option :value="0">失败</option>
          </select>
        </div>

        <div class="field">
          <label>评分（可选）</label>
          <select class="sm-input" v-model="form.rating">
            <option :value="null">不填写</option>
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <div class="field" style="margin-top: 12px">
        <label>备注（notes）</label>
        <textarea class="sm-input" rows="4" v-model="form.notes" placeholder="写点观测记录、天气、装备、心得..."></textarea>
      </div>
    </div>

    <div class="sm-card panel">
      <div class="section-title">位置隐私</div>

      <div class="grid">
        <div class="field">
          <label>visibility *</label>
          <select class="sm-input" v-model="form.location.visibility">
            <option :value="LOCATION_VISIBILITY.HIDDEN">HIDDEN（隐藏）</option>
            <option :value="LOCATION_VISIBILITY.CITY">CITY（只显示城市）</option>
            <option :value="LOCATION_VISIBILITY.FUZZY">FUZZY（模糊坐标）</option>
            <option :value="LOCATION_VISIBILITY.EXACT">EXACT（精确坐标）</option>
          </select>
          <div class="sm-muted sm-small">
            注意：后端 DTO 是 locationVisibility + cityName/lat/lon（平铺字段），前端这里内部用 location 对象存储，但提交会转换成平铺字段。
          </div>
        </div>

        <div class="field">
          <label>city_name（可选）</label>
          <input class="sm-input" v-model="form.location.cityName" placeholder="例如：Shanghai" />
        </div>

        <div class="field">
          <label>lat（FUZZY/EXACT 可填）</label>
          <input class="sm-input" type="number" step="0.000001" v-model.number="form.location.lat" placeholder="例如：31.2304" />
        </div>

        <div class="field">
          <label>lon（FUZZY/EXACT 可填）</label>
          <input class="sm-input" type="number" step="0.000001" v-model.number="form.location.lon" placeholder="例如：121.4737" />
        </div>
      </div>
    </div>

    <div class="sm-card panel">
      <div class="section-title">目标（至少 1 个）*</div>

      <div class="grid">
        <div class="field">
          <label>搜索天体（阶段2：astro/search）</label>
          <input
            class="sm-input"
            v-model="search.q"
            placeholder="输入关键字，例如：sirius / m31 / andromeda"
            @keydown.enter.prevent="doSearch"
          />
          <div class="sm-muted sm-small">只在 q 非空时才会请求后端（避免 MissingServletRequestParameterException: q）。</div>
        </div>

        <div class="field" style="display: flex; align-items: flex-end; gap: 10px">
          <button class="sm-btn" :disabled="searching" @click="doSearch">
            {{ searching ? "搜索中..." : "搜索" }}
          </button>
          <button class="sm-btn" :disabled="searching" @click="clearSearch">清空</button>
        </div>
      </div>

      <div v-if="search.error" class="sm-error" style="margin-top: 10px">{{ search.error }}</div>

      <div v-if="search.results.length" class="search-results">
        <div class="sm-muted sm-small" style="margin-bottom: 8px">搜索结果（点击添加）</div>
        <div class="chips">
          <button v-for="b in search.results" :key="b.id" class="sm-chip-btn" @click="addBodyTarget(b)">
            #{{ b.id }} {{ b.name }}
            <span v-if="b.mag !== undefined && b.mag !== null" class="sm-muted" style="margin-left: 6px">mag {{ Number(b.mag).toFixed(2) }}</span>
          </button>
        </div>
      </div>

      <div class="grid" style="margin-top: 14px">
        <div class="field">
          <label>或输入文本目标（targetType=TEXT）</label>
          <input class="sm-input" v-model="textTarget" placeholder="例如：猎户座星云 / 木星 / 行星摄影" />
        </div>
        <div class="field" style="display: flex; align-items: flex-end; gap: 10px">
          <button class="sm-btn primary" @click="addTextTarget">添加</button>
        </div>
      </div>

      <div class="targets" v-if="form.targets.length">
        <div class="sm-muted sm-small" style="margin: 10px 0">当前目标</div>
        <div class="target-item" v-for="(t, idx) in form.targets" :key="idx">
          <div class="left">
            <div class="main">
              <span class="sm-chip" style="margin-right: 8px">{{ t.targetType }}</span>
              <span v-if="t.targetType === OBS_TARGET_TYPE.TEXT">{{ t.text }}</span>
              <span v-else>#{{ t.bodyId }} - {{ t.bodyName || t.name }}</span>
            </div>
          </div>
          <button class="sm-btn" @click="removeTarget(idx)">移除</button>
        </div>
      </div>

      <div v-else class="sm-muted" style="margin-top: 10px">暂无目标，请至少添加 1 个。</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notify } from "@/utils/notify";
import { OBSERVATION_METHOD, LOCATION_VISIBILITY, OBS_TARGET_TYPE } from "@/constants/enums";
import { searchBodies } from "@/api/astro";
import { getMyDeviceProfiles } from "@/api/deviceProfiles";
import { createObservationLog, updateObservationLog, getObservationLogDetail } from "@/api/observationLogs";

const route = useRoute();
const router = useRouter();

const saving = ref(false);
const error = ref("");

const id = computed(() => (route.params?.id ? Number(route.params.id) : null));
const isEdit = computed(() => !!id.value);

const deviceProfiles = ref([]);

const form = ref({
  observedAtLocal: "", // datetime-local: "YYYY-MM-DDTHH:mm"
  method: OBSERVATION_METHOD.PHOTO,
  deviceProfileId: null,
  notes: "",
  success: null,
  rating: null,
  location: {
    visibility: LOCATION_VISIBILITY.HIDDEN,
    cityName: "",
    lat: null,
    lon: null,
  },
  targets: [],
});

const textTarget = ref("");

const searching = ref(false);
const search = ref({
  q: "",
  results: [],
  error: "",
});

function goBack() {
  router.push({ name: "ObservationLogs" });
}

/**
 * 将 Date 转为后端 LocalDateTime 字符串（不带 Z/时区）
 * 例：2026-01-18T13:05:00
 */
function formatLocalDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

/**
 * datetime-local 只有到分钟：YYYY-MM-DDTHH:mm
 * 转成 LocalDateTime：YYYY-MM-DDTHH:mm:ss
 */
function normalizeObservedAt(localStr) {
  const s = String(localStr || "").trim();
  if (!s) return null;
  // 若没有秒，补 :00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s;
}

function normalizeLocationToPayload(location) {
  const visibility = location?.visibility || LOCATION_VISIBILITY.HIDDEN;

  const payload = {
    locationVisibility: visibility,
    cityName: location?.cityName ? String(location.cityName).trim() : null,
    lat: location?.lat !== null && location?.lat !== undefined ? Number(location.lat) : null,
    lon: location?.lon !== null && location?.lon !== undefined ? Number(location.lon) : null,
  };

  // HIDDEN 时不传坐标/城市也可以（后端以 visibility 为准）
  if (visibility === LOCATION_VISIBILITY.HIDDEN) {
    payload.cityName = null;
    payload.lat = null;
    payload.lon = null;
  }

  // CITY 只保留 cityName
  if (visibility === LOCATION_VISIBILITY.CITY) {
    payload.lat = null;
    payload.lon = null;
  }

  return payload;
}

function normalizeTargetsToPayload(targets) {
  return (targets || []).map((t) => {
    const type = t?.targetType;
    if (type === OBS_TARGET_TYPE.TEXT) {
      return { targetType: OBS_TARGET_TYPE.TEXT, text: String(t.text || "").trim() };
    }
    // 兼容旧值 BODY -> CELESTIAL_BODY
    const normalizedType = type === "BODY" ? OBS_TARGET_TYPE.CELESTIAL_BODY : type;
    return {
      targetType: normalizedType || OBS_TARGET_TYPE.CELESTIAL_BODY,
      bodyId: t.bodyId ?? t.id,
      bodyName: t.bodyName || t.name,
    };
  });
}

function validateBeforeSubmit(payload) {
  // observedAt
  if (!payload.observedAt) return "观测时间（observed_at）不能为空";
  // method
  if (!payload.method) return "方式（method）不能为空";
  // locationVisibility
  if (!payload.locationVisibility) return "位置隐私（locationVisibility）不能为空";
  // targets
  if (!payload.targets || !payload.targets.length) return "目标至少 1 个";

  // targets content basic check
  for (const t of payload.targets) {
    if (t.targetType === OBS_TARGET_TYPE.TEXT) {
      if (!t.text) return "文本目标不能为空";
    } else {
      if (!t.bodyId) return "天体目标缺少 bodyId";
    }
  }

  // FUZZY/EXACT 建议要求坐标
  if (
    payload.locationVisibility === LOCATION_VISIBILITY.FUZZY ||
    payload.locationVisibility === LOCATION_VISIBILITY.EXACT
  ) {
    if (payload.lat === null || payload.lon === null || Number.isNaN(payload.lat) || Number.isNaN(payload.lon)) {
      return "FUZZY/EXACT 需要填写 lat/lon";
    }
  }

  return "";
}

function buildPayload() {
  const observedAt = normalizeObservedAt(form.value.observedAtLocal);
  const locationPayload = normalizeLocationToPayload(form.value.location);
  const targetsPayload = normalizeTargetsToPayload(form.value.targets);

  return {
    observedAt,
    method: form.value.method,
    deviceProfileId: form.value.deviceProfileId ?? null,
    notes: form.value.notes ? String(form.value.notes).trim() : null,
    success: form.value.success ?? null,
    rating: form.value.rating ?? null,
    ...locationPayload,
    targets: targetsPayload,
    // mediaIds：你后端支持的话以后再接 uploader
    mediaIds: [],
  };
}

async function loadDeviceProfiles() {
  try {
    // 设备配置按 method 过滤：PHOTO -> PHOTO 列表；VISUAL -> VISUAL 列表
    const type = form.value.method === OBSERVATION_METHOD.VISUAL ? "VISUAL" : "PHOTO";
    const data = await getMyDeviceProfiles({ type });
    const arr = Array.isArray(data) ? data : Array.isArray(data?.records) ? data.records : Array.isArray(data?.list) ? data.list : [];
    deviceProfiles.value = arr || [];
  } catch (e) {
    // 不阻塞页面
    deviceProfiles.value = [];
  }
}

function clearSearch() {
  search.value.results = [];
  search.value.error = "";
}

async function doSearch() {
  const q = String(search.value.q || "").trim();
  search.value.error = "";
  search.value.results = [];

  if (!q) {
    // 不请求后端（避免 /api/astro/search 缺 q）
    return;
  }

  searching.value = true;
  try {
    // 你后端 search 是 /api/astro/search?q=...&limit=...&offset=...
    const data = await searchBodies({ q, limit: 20, offset: 1 });
    const list =
      Array.isArray(data) ? data :
        Array.isArray(data?.records) ? data.records :
          Array.isArray(data?.list) ? data.list :
            Array.isArray(data?.items) ? data.items :
              [];

    search.value.results = list || [];
  } catch (e) {
    search.value.error = e?.message || "搜索失败";
  } finally {
    searching.value = false;
  }
}

function addBodyTarget(b) {
  if (!b?.id) return;
  const exists = form.value.targets.some((t) => (t.targetType === OBS_TARGET_TYPE.CELESTIAL_BODY || t.targetType === "BODY") && Number(t.bodyId) === Number(b.id));
  if (exists) return;

  form.value.targets.push({
    targetType: OBS_TARGET_TYPE.CELESTIAL_BODY,
    bodyId: b.id,
    bodyName: b.name,
  });
}

function addTextTarget() {
  const t = String(textTarget.value || "").trim();
  if (!t) return;

  form.value.targets.push({
    targetType: OBS_TARGET_TYPE.TEXT,
    text: t,
  });
  textTarget.value = "";
}

function removeTarget(idx) {
  form.value.targets.splice(idx, 1);
}

async function loadDetailIfEdit() {
  if (!isEdit.value) return;

  try {
    const detail = await getObservationLogDetail(id.value);

    // 兼容后端可能返回 detail 结构：data 里就是 VO（你的 unwrap 已经帮你解开）
    const d = detail || {};

    // observedAt：转成 datetime-local
    // 假设后端返回 observedAt 为 "YYYY-MM-DDTHH:mm:ss" 或 ISO 字符串
    if (d.observedAt) {
      const dt = new Date(d.observedAt);
      // datetime-local: YYYY-MM-DDTHH:mm
      const pad = (n) => String(n).padStart(2, "0");
      const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      form.value.observedAtLocal = local;
    }

    form.value.method = d.method || OBSERVATION_METHOD.PHOTO;
    form.value.deviceProfileId = d.deviceProfileId ?? null;
    form.value.notes = d.notes || "";
    form.value.success = d.success ?? null;
    form.value.rating = d.rating ?? null;

    // location：兼容两种返回：平铺字段 or location 对象
    const visibility =
      d.locationVisibility ||
      d.location?.visibility ||
      LOCATION_VISIBILITY.HIDDEN;

    form.value.location.visibility = visibility;
    form.value.location.cityName = d.cityName || d.location?.cityName || "";
    form.value.location.lat = d.lat ?? d.location?.lat ?? null;
    form.value.location.lon = d.lon ?? d.location?.lon ?? null;

    // targets：兼容后端返回 targetType=CELESTIAL_BODY/TEXT
    form.value.targets = Array.isArray(d.targets)
      ? d.targets.map((t) => ({
        targetType: t.targetType === "BODY" ? OBS_TARGET_TYPE.CELESTIAL_BODY : t.targetType,
        bodyId: t.bodyId,
        bodyName: t.bodyName || t.name,
        text: t.text,
      }))
      : [];
  } catch (e) {
    notify(e?.message || "加载详情失败");
  }
}

async function save() {
  error.value = "";
  const payload = buildPayload();

  const msg = validateBeforeSubmit(payload);
  if (msg) {
    error.value = msg;
    notify(msg);
    return;
  }

  saving.value = true;
  try {
    if (isEdit.value) {
      await updateObservationLog(id.value, payload);
      notify("日志已更新", "success");
    } else {
      const created = await createObservationLog(payload);
      notify("日志已创建", "success");
      // 创建成功后跳详情
      if (created?.id) {
        router.replace({ name: "ObservationLogDetail", params: { id: created.id } });
      } else {
        router.replace({ name: "ObservationLogs" });
      }
    }
  } catch (e) {
    error.value = e?.message || "保存失败";
    notify(error.value);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  // 默认 observedAt = 当前时间
  if (!form.value.observedAtLocal) {
    const now = new Date();
    // datetime-local 只到分钟
    const pad = (n) => String(n).padStart(2, "0");
    form.value.observedAtLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  await loadDetailIfEdit();
  await loadDeviceProfiles();
});

// method 改变时，刷新设备配置下拉（PHOTO/VISUAL 分开）
watch(
  () => form.value.method,
  async () => {
    form.value.deviceProfileId = null;
    await loadDeviceProfiles();
  }
);
</script>

<style scoped>
.page {
  padding: 18px 0 40px 0;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding: 18px 0 12px 0;
}

h1 {
  margin: 0;
  font-size: 28px;
}

.ops {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.panel {
  margin-top: 12px;
  padding: 14px;
}

.section-title {
  font-weight: 900;
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 13px;
  margin-bottom: 6px;
  color: rgba(255, 255, 255, 0.86);
}

.search-results {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sm-chip-btn {
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
  padding: 6px 10px;
}

.targets {
  margin-top: 10px;
}

.target-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  margin-top: 8px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
