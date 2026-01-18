<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>观测日志详情</h1>
        <div class="sm-muted sm-small">阶段5-F4：观测日志 MVP（详情/发布）</div>
      </div>

      <div class="ops">
        <button class="sm-btn" @click="goBack">返回</button>
        <button class="sm-btn" :disabled="loading" @click="goEdit">编辑</button>
        <button class="sm-btn" :disabled="loading" @click="doDelete">删除</button>
        <button class="sm-btn primary" :disabled="publishing || loading" @click="doPublish">
          {{ publishing ? "发布中..." : "发布动态" }}
        </button>
      </div>
    </div>

    <div v-if="error" class="sm-error" style="margin-top: 12px">{{ error }}</div>

    <div v-if="loading" class="sm-card panel" style="margin-top: 12px">
      <div class="sm-muted">加载中...</div>
    </div>

    <div v-else class="sm-card panel" style="margin-top: 12px">
      <div class="kv">
        <div class="item">
          <div class="k">ID</div>
          <div class="v">#{{ detail?.id }}</div>
        </div>
        <div class="item">
          <div class="k">observed_at</div>
          <div class="v">{{ formatShowTime(detail?.observedAt) }}</div>
        </div>
        <div class="item">
          <div class="k">method</div>
          <div class="v">{{ detail?.method }}</div>
        </div>
        <div class="item">
          <div class="k">rating</div>
          <div class="v">{{ detail?.rating ?? "—" }}</div>
        </div>
        <div class="item">
          <div class="k">success</div>
          <div class="v">{{ detail?.success === 1 ? "成功" : detail?.success === 0 ? "失败" : "—" }}</div>
        </div>
        <div class="item">
          <div class="k">device_profile_id</div>
          <div class="v">{{ detail?.deviceProfileId ?? "—" }}</div>
        </div>
      </div>

      <div class="block">
        <div class="title">位置（按隐私展示）</div>
        <div class="sm-muted">
          {{ formatLocation(detail) }}
        </div>
      </div>

      <div class="block">
        <div class="title">目标</div>
        <div v-if="(detail?.targets || []).length" class="targets">
          <div class="row" v-for="(t, idx) in detail.targets" :key="idx">
            <span class="sm-chip">{{ normalizeTargetType(t?.targetType) }}</span>
            <span style="margin-left: 10px">{{ formatTarget(t) }}</span>
          </div>
        </div>
        <div v-else class="sm-muted">无目标</div>
      </div>

      <div class="block">
        <div class="title">notes</div>
        <div class="sm-muted" style="white-space: pre-wrap">{{ detail?.notes || "—" }}</div>
      </div>

      <div class="block" v-if="detail?.postId || detail?.alreadyPublished">
        <div class="title">发布状态</div>
        <div class="sm-muted">
          <div v-if="detail?.alreadyPublished">已发布过（alreadyPublished=true）</div>
          <div v-if="detail?.postId">postId：{{ detail.postId }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notify } from "@/utils/notify";
import { LOCATION_VISIBILITY, OBS_TARGET_TYPE } from "@/constants/enums";
import { deleteObservationLog, getObservationLogDetail, publishObservationLog } from "@/api/observationLogs";

const route = useRoute();
const router = useRouter();

const id = computed(() => Number(route.params.id));

const loading = ref(false);
const publishing = ref(false);
const error = ref("");

const detail = ref(null);

function goBack() {
  router.push({ name: "ObservationLogs" });
}

function goEdit() {
  router.push({ name: "ObservationLogEdit", params: { id: id.value } });
}

function formatShowTime(v) {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

function formatLocation(d) {
  // 兼容两种结构：平铺字段 or location 对象
  const visibility =
    d?.locationVisibility ||
    d?.location?.visibility ||
    LOCATION_VISIBILITY.HIDDEN;

  const city = d?.cityName || d?.location?.cityName || null;
  const lat = d?.lat ?? d?.location?.lat ?? null;
  const lon = d?.lon ?? d?.location?.lon ?? null;

  if (visibility === LOCATION_VISIBILITY.HIDDEN) return "HIDDEN（隐藏）";
  if (visibility === LOCATION_VISIBILITY.CITY) return `CITY（城市）：${city || "—"}`;
  if (visibility === LOCATION_VISIBILITY.FUZZY) return `FUZZY（模糊）：${city ? city + " / " : ""}${lat ?? "—"}, ${lon ?? "—"}`;
  if (visibility === LOCATION_VISIBILITY.EXACT) return `EXACT（精确）：${city ? city + " / " : ""}${lat ?? "—"}, ${lon ?? "—"}`;
  return String(visibility || "—");
}

function normalizeTargetType(type) {
  if (type === "BODY") return OBS_TARGET_TYPE.CELESTIAL_BODY;
  return type || "—";
}

function formatTarget(t) {
  if (!t) return "—";
  const type = normalizeTargetType(t.targetType);

  if (type === OBS_TARGET_TYPE.TEXT) return t.text || "—";

  // CELESTIAL_BODY
  return t.bodyName || t.name || (t.bodyId ? `#${t.bodyId}` : "—");
}

async function reload() {
  loading.value = true;
  error.value = "";
  try {
    detail.value = await getObservationLogDetail(id.value);
  } catch (e) {
    error.value = e?.message || "加载失败";
    notify(error.value);
  } finally {
    loading.value = false;
  }
}

async function doDelete() {
  const ok = window.confirm("确认删除该日志？（软删）");
  if (!ok) return;

  loading.value = true;
  try {
    await deleteObservationLog(id.value);
    notify("已删除", "success");
    router.replace({ name: "ObservationLogs" });
  } catch (e) {
    notify(e?.message || "删除失败");
  } finally {
    loading.value = false;
  }
}

async function doPublish() {
  publishing.value = true;
  try {
    const res = await publishObservationLog(id.value, {});
    const postId = res?.postId || res?.data?.postId;
    const already = res?.alreadyPublished || res?.data?.alreadyPublished;

    if (already) notify("已发布过（后端返回 alreadyPublished=true）", "success");
    else notify("发布成功", "success");

    if (postId) {
      router.push({ name: "PostDetail", params: { id: postId } });
    } else {
      // 没拿到 postId 也不算失败，刷新详情看看
      await reload();
    }
  } catch (e) {
    notify(e?.message || "发布失败");
  } finally {
    publishing.value = false;
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

.panel {
  padding: 14px;
}

.kv {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.item {
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
}

.k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
  margin-bottom: 6px;
}

.v {
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.block {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
}

.title {
  font-weight: 900;
  margin-bottom: 8px;
}

.targets {
  display: grid;
  gap: 8px;
}

.row {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
}

@media (max-width: 980px) {
  .kv {
    grid-template-columns: 1fr;
  }
}
</style>
