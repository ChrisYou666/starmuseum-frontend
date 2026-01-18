<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>FOV 视场计算</h1>
        <div class="sm-muted sm-small">
          阶段5-F3：设备配置 → 调用 /api/astro/fov/calc → 展示结果（可复制）
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn" @click="backToProfiles">返回设备配置</button>
      </div>
    </div>

    <div v-if="error" class="sm-error" style="margin-top: 12px">{{ error }}</div>

    <div class="sm-card panel">
      <div class="panel-head">
        <div class="title">选择设备配置</div>
        <div class="sm-muted sm-small">选择一个 profileId，然后计算</div>
      </div>

      <div class="form">
        <label class="lbl">Profile</label>
        <select class="sm-input" v-model="selectedId" :disabled="loadingProfiles || loadingCalc">
          <option value="">请选择…</option>

          <optgroup label="PHOTO">
            <option v-for="p in photoList" :key="'p-' + p.id" :value="String(p.id)">
              #{{ p.id }} - {{ p.name }}
            </option>
          </optgroup>

          <optgroup label="VISUAL">
            <option v-for="p in visualList" :key="'v-' + p.id" :value="String(p.id)">
              #{{ p.id }} - {{ p.name }}
            </option>
          </optgroup>
        </select>

        <div class="btns">
          <button class="sm-btn primary" :disabled="!selectedId || loadingCalc" @click="doCalc">
            {{ loadingCalc ? "计算中..." : "计算 FOV" }}
          </button>
          <button class="sm-btn" :disabled="loadingProfiles || loadingCalc" @click="reloadProfiles">
            {{ loadingProfiles ? "加载中..." : "刷新列表" }}
          </button>
        </div>
      </div>
    </div>

    <FovResultCard :result="result" style="margin-top: 12px" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMyDeviceProfiles } from "@/api/deviceProfiles";
import { calcFovByProfileId } from "@/api/fov";
import FovResultCard from "@/components/astro/FovResultCard.vue";

const router = useRouter();
const route = useRoute();

const loadingProfiles = ref(false);
const loadingCalc = ref(false);
const error = ref("");

const profiles = ref([]);
const selectedId = ref("");
const result = ref(null);

const photoList = computed(() =>
  (profiles.value || []).filter((x) => String(x?.type || "").toUpperCase() === "PHOTO")
);
const visualList = computed(() =>
  (profiles.value || []).filter((x) => String(x?.type || "").toUpperCase() === "VISUAL")
);

function backToProfiles() {
  router.push({ name: "AstroDeviceProfiles" });
}

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.list)) return data.list;
  return [];
}

async function reloadProfiles() {
  loadingProfiles.value = true;
  error.value = "";
  try {
    const data = await getMyDeviceProfiles(); // 不传 type，拿全部
    profiles.value = normalizeList(data);
  } catch (e) {
    error.value = e?.message || "加载设备配置失败";
  } finally {
    loadingProfiles.value = false;
  }
}

async function doCalc() {
  if (!selectedId.value) return;
  loadingCalc.value = true;
  error.value = "";
  try {
    const r = await calcFovByProfileId(Number(selectedId.value));
    result.value = r;
  } catch (e) {
    error.value = e?.message || "计算失败";
  } finally {
    loadingCalc.value = false;
  }
}

onMounted(async () => {
  await reloadProfiles();

  // 支持从设备列表页带参跳转：/astro/fov?profileId=1
  const q = route.query?.profileId;
  if (q) {
    selectedId.value = String(q);
    // 自动计算（企业级体验：减少一步点击）
    await doCalc();
  }
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

.panel {
  margin-top: 12px;
  padding: 14px;
}

.panel-head .title {
  font-weight: 900;
}

.form {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.lbl {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
