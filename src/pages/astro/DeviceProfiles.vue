<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>设备配置</h1>
        <div class="sm-muted sm-small">
          阶段5-F2：设备配置 CRUD + 默认配置（PHOTO / VISUAL）
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn primary" :disabled="loading" @click="openCreate">
          新增配置
        </button>
        <button class="sm-btn" :disabled="loading" @click="reload">
          {{ loading ? "加载中..." : "刷新" }}
        </button>
        <button class="sm-btn" @click="goFov">FOV 视场（可选）</button>
      </div>
    </div>

    <div class="tabs sm-card">
      <button
        class="tab"
        :class="{ active: activeType === DEVICE_PROFILE_TYPE.PHOTO }"
        @click="switchType(DEVICE_PROFILE_TYPE.PHOTO)"
      >
        摄影（PHOTO）
      </button>
      <button
        class="tab"
        :class="{ active: activeType === DEVICE_PROFILE_TYPE.VISUAL }"
        @click="switchType(DEVICE_PROFILE_TYPE.VISUAL)"
      >
        目视（VISUAL）
      </button>
    </div>

    <div v-if="error" class="sm-error" style="margin-top: 12px">{{ error }}</div>

    <div class="sm-card panel">
      <div class="panel-head">
        <div class="left">
          <div class="title">我的配置（{{ activeType }}）</div>
          <div class="sm-muted sm-small">
            默认配置：同一用户同一 type 仅允许一个 default
          </div>
        </div>

        <div class="right">
          <span class="sm-muted sm-small">共 {{ list.length }} 条</span>
        </div>
      </div>

      <div v-if="!list.length && !loading" class="empty">
        <div class="sm-muted">暂无设备配置</div>
        <button class="sm-btn primary" @click="openCreate">新增一个</button>
      </div>

      <div v-else class="table">
        <div class="thead">
          <div>名称</div>
          <div>参数摘要</div>
          <div>默认</div>
          <div class="op">操作</div>
        </div>

        <div v-for="p in list" :key="p.id" class="row">
          <div class="name">
            <div class="main">{{ p.name }}</div>
            <div class="meta sm-muted sm-small">ID: {{ p.id }}</div>
          </div>
          <div class="summary sm-muted">
            {{ profileSummary(p) }}
          </div>
          <div>
            <span v-if="isDefault(p)" class="sm-chip">默认</span>
            <span v-else class="sm-muted sm-small">—</span>
          </div>
          <div class="actions">
            <button class="sm-btn" @click="openEdit(p)">编辑</button>
            <button class="sm-btn" :disabled="loading" @click="doDelete(p)">删除</button>
            <button class="sm-btn" :disabled="loading" @click="goCalc(p)">计算 FOV</button>
            <button class="sm-btn primary" :disabled="loading || isDefault(p)" @click="doSetDefault(p)">
              设为默认
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <DeviceProfileDialog
      v-model:open="dialogOpen"
      :type="activeType"
      :editing="editing"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { DEVICE_PROFILE_TYPE } from "@/constants/enums";
import DeviceProfileDialog from "@/components/astro/DeviceProfileDialog.vue";
import {
  createDeviceProfile,
  updateDeviceProfile,
  getMyDeviceProfiles,
  deleteDeviceProfile,
  setDefaultDeviceProfile,
} from "@/api/deviceProfiles";
import { notify } from "@/utils/notify";

const router = useRouter();

const activeType = ref(DEVICE_PROFILE_TYPE.PHOTO);
const list = ref([]);
const loading = ref(false);
const error = ref("");

const dialogOpen = ref(false);
const editing = ref(null);

function goFov() {
  router.push({ name: "AstroFov" });
}

function goCalc(p) {
  if (!p?.id) return;
  // 带参跳转，FOV 页会自动选中并计算
  router.push({ name: "AstroFov", query: { profileId: p.id } });
}

function openCreate() {
  editing.value = null;
  dialogOpen.value = true;
}

function openEdit(p) {
  editing.value = p;
  dialogOpen.value = true;
}

function readField(obj, camel, snake) {
  if (!obj) return null;
  if (obj[camel] !== undefined && obj[camel] !== null) return obj[camel];
  if (snake && obj[snake] !== undefined && obj[snake] !== null) return obj[snake];
  return null;
}

function isDefault(p) {
  const v = readField(p, "isDefault", "is_default");
  return v === true || v === 1 || v === "1";
}

function profileSummary(p) {
  const t = readField(p, "type", "type") || activeType.value;
  if (t === DEVICE_PROFILE_TYPE.PHOTO) {
    const sw = readField(p, "sensorWidth", "sensor_width");
    const sh = readField(p, "sensorHeight", "sensor_height");
    const f = readField(p, "focalLengthMm", "focal_length_mm");
    const a = [];
    if (sw && sh) a.push(`Sensor: ${Number(sw)} × ${Number(sh)} mm`);
    if (f) a.push(`Focal: ${Number(f)} mm`);
    return a.length ? a.join(" / ") : "—";
  }

  const tf = readField(p, "telescopeFocalMm", "telescope_focal_mm");
  const ef = readField(p, "eyepieceFocalMm", "eyepiece_focal_mm");
  const afov = readField(p, "eyepieceAfovDeg", "eyepiece_afov_deg");
  const b = [];
  if (tf) b.push(`Telescope: ${Number(tf)} mm`);
  if (ef) b.push(`Eyepiece: ${Number(ef)} mm`);
  if (afov) b.push(`AFOV: ${Number(afov)}°`);
  return b.length ? b.join(" / ") : "—";
}

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.list)) return data.list;
  return [];
}

async function reload() {
  loading.value = true;
  error.value = "";
  try {
    const data = await getMyDeviceProfiles({ type: activeType.value });
    list.value = normalizeList(data);
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

async function switchType(t) {
  if (activeType.value === t) return;
  activeType.value = t;
  await reload();
}

async function onSubmit({ editing: ed, payload }) {
  loading.value = true;
  error.value = "";
  try {
    if (ed && ed.id) {
      await updateDeviceProfile(ed.id, payload);
      notify("设备配置已更新", "success");
    } else {
      await createDeviceProfile(payload);
      notify("设备配置已创建", "success");
    }
    await reload();
  } catch (e) {
    error.value = e?.message || "保存失败";
    notify(error.value);
    throw e;
  } finally {
    loading.value = false;
  }
}

async function doDelete(p) {
  if (!p?.id) return;
  const ok = window.confirm(`确认删除设备配置：${p.name || p.id} ？`);
  if (!ok) return;

  loading.value = true;
  error.value = "";
  try {
    await deleteDeviceProfile(p.id);
    notify("已删除", "success");
    await reload();
  } catch (e) {
    error.value = e?.message || "删除失败";
    notify(error.value);
  } finally {
    loading.value = false;
  }
}

async function doSetDefault(p) {
  if (!p?.id) return;
  loading.value = true;
  error.value = "";
  try {
    await setDefaultDeviceProfile(p.id);
    notify("已设为默认", "success");
    await reload();
  } catch (e) {
    error.value = e?.message || "设置默认失败";
    notify(error.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  reload();
});
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

.tabs {
  margin-top: 12px;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.tab {
  width: 100%;
  padding: 12px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
}

.tab.active {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.22);
}

.panel {
  margin-top: 12ոՐpx;
  padding: 14px;
}

.panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
}

.panel-head .title {
  font-weight: 900;
}

.empty {
  margin-top: 14px;
  padding: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.table {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.thead {
  display: grid;
  grid-template-columns: 1.1fr 1.6fr 0.5fr 1.2fr;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
}

.thead .op {
  text-align: right;
}

.row {
  display: grid;
  grid-template-columns: 1.1fr 1.6fr 0.5fr 1.2fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  align-items: center;
}

.name .main {
  font-weight: 800;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .thead {
    display: none;
  }

  .row {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
