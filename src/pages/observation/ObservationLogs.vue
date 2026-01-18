<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>观测日志</h1>
        <div class="sm-muted sm-small">
          阶段5-F4：观测日志 MVP → 一键发布动态 → Feed 可见
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn primary" :disabled="loading" @click="goCreate">
          创建日志
        </button>
        <button class="sm-btn" :disabled="loading" @click="reload">
          {{ loading ? "加载中..." : "刷新" }}
        </button>
      </div>
    </div>

    <div v-if="error" class="sm-error" style="margin-top: 12px">{{ error }}</div>

    <div class="sm-card panel">
      <div class="panel-head">
        <div class="left">
          <div class="title">我的观测日志</div>
          <div class="sm-muted sm-small">
            列表不包含已软删日志；点击行可进入详情
          </div>
        </div>

        <div class="right">
          <span class="sm-muted sm-small">共 {{ total }} 条</span>
        </div>
      </div>

      <div v-if="!items.length && !loading" class="empty">
        <div class="sm-muted">暂无观测日志</div>
        <button class="sm-btn primary" @click="goCreate">创建第一条</button>
      </div>

      <div v-else class="table">
        <div class="thead">
          <div>观测时间</div>
          <div>方式</div>
          <div>目标数</div>
          <div>已发布</div>
          <div class="op">操作</div>
        </div>

        <div
          v-for="it in items"
          :key="it.id"
          class="row"
          @click="goDetail(it)"
          style="cursor: pointer"
        >
          <div class="main">
            <div class="bold">{{ formatTime(readField(it, "observedAt", "observed_at")) }}</div>
            <div class="sm-muted sm-small">ID: {{ it.id }}</div>
          </div>

          <div class="sm-muted">
            {{ readField(it, "method", "method") || "-" }}
          </div>

          <div class="sm-muted">
            {{ targetCount(it) }}
          </div>

          <div>
            <span v-if="isPublished(it)" class="sm-chip">已发布</span>
            <span v-else class="sm-muted sm-small">—</span>
          </div>

          <div class="actions" @click.stop>
            <button class="sm-btn" @click="goDetail(it)">详情</button>
            <button class="sm-btn" @click="goEdit(it)">编辑</button>
          </div>
        </div>
      </div>

      <div class="pager" v-if="total > pageSize">
        <button class="sm-btn" :disabled="loading || page <= 1" @click="prevPage">上一页</button>
        <div class="sm-muted sm-small">
          第 {{ page }} / {{ totalPages }} 页
        </div>
        <button class="sm-btn" :disabled="loading || page >= totalPages" @click="nextPage">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listObservationLogs } from "@/api/observationLogs";
import { normalizePageData } from "@/utils/paging";

const router = useRouter();

const loading = ref(false);
const error = ref("");

const page = ref(1);
const pageSize = ref(10);

const items = ref([]);
const total = ref(0);

const totalPages = computed(() => {
  const t = Number(total.value || 0);
  const s = Number(pageSize.value || 10);
  return Math.max(1, Math.ceil(t / s));
});

function goCreate() {
  router.push({ name: "ObservationLogCreate" });
}

function goDetail(it) {
  if (!it?.id) return;
  router.push({ name: "ObservationLogDetail", params: { id: it.id } });
}

function goEdit(it) {
  if (!it?.id) return;
  router.push({ name: "ObservationLogEdit", params: { id: it.id } });
}

function readField(obj, camel, snake) {
  if (!obj) return null;
  if (obj[camel] !== undefined && obj[camel] !== null) return obj[camel];
  if (snake && obj[snake] !== undefined && obj[snake] !== null) return obj[snake];
  return null;
}

function targetCount(it) {
  const t = readField(it, "targets", "targets");
  if (Array.isArray(t)) return t.length;
  const n = readField(it, "targetCount", "target_count");
  if (n !== null && n !== undefined) return Number(n);
  return 0;
}

function isPublished(it) {
  const v1 = readField(it, "published", "published");
  if (v1 === true) return true;
  const postId = readField(it, "postId", "post_id");
  if (postId !== null && postId !== undefined) return true;
  const pubAt = readField(it, "publishedAt", "published_at");
  if (pubAt) return true;
  return false;
}

function formatTime(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

async function reload() {
  loading.value = true;
  error.value = "";
  try {
    const data = await listObservationLogs({ page: page.value, size: pageSize.value });
    const pg = normalizePageData(data);
    items.value = pg.records;
    total.value = pg.total;
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

function prevPage() {
  if (page.value <= 1) return;
  page.value -= 1;
  reload();
}

function nextPage() {
  if (page.value >= totalPages.value) return;
  page.value += 1;
  reload();
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
  margin-top: 12px;
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
  grid-template-columns: 1.3fr 0.7fr 0.6fr 0.6fr 0.8fr;
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
  grid-template-columns: 1.3fr 0.7fr 0.6fr 0.6fr 0.8fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  align-items: center;
}

.bold {
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.pager {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
