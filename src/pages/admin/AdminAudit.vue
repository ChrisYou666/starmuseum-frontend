<!-- src/pages/admin/AdminAudit.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">管理端 · 审计日志</div>
      <button class="sm-btn" :disabled="loading" @click="reload">
        {{ loading ? "加载中..." : "刷新" }}
      </button>
    </div>

    <div class="filters sm-card">
      <div class="row">
        <div class="field">
          <div class="k sm-muted sm-small">action</div>
          <input class="sm-input" v-model="action" placeholder="例如：REPORT_START / REPORT_RESOLVE ..." @keydown.enter="reload" />
        </div>

        <div class="field">
          <div class="k sm-muted sm-small">actorId</div>
          <input class="sm-input" v-model="actorId" placeholder="操作者用户ID（可选）" @keydown.enter="reload" />
        </div>

        <div class="field">
          <div class="k sm-muted sm-small">关键词</div>
          <input class="sm-input" v-model="q" placeholder="例如：reportId / targetId / note ..." @keydown.enter="reload" />
        </div>
      </div>

      <div class="row2">
        <div class="field">
          <div class="k sm-muted sm-small">from（可选）</div>
          <input class="sm-input" v-model="from" placeholder="2026-01-01T00:00:00" @keydown.enter="reload" />
        </div>
        <div class="field">
          <div class="k sm-muted sm-small">to（可选）</div>
          <input class="sm-input" v-model="to" placeholder="2026-01-31T23:59:59" @keydown.enter="reload" />
        </div>

        <div class="ops">
          <button class="sm-btn" @click="reload">查询</button>
          <button class="sm-btn" @click="reset">重置</button>
        </div>
      </div>
    </div>

    <div v-if="error" class="sm-error">{{ error }}</div>

    <div class="list">
      <div class="item sm-card" v-for="a in records" :key="a.id">
        <div class="line1">
          <span class="strong">#{{ a.id }}</span>
          <span class="sm-chip">{{ a.action || a.event || a.type || "ACTION" }}</span>
          <span class="sm-chip sm-muted">actor: {{ a.actorId ?? a.userId ?? "-" }}</span>
        </div>

        <div class="line2 sm-muted sm-small">
          <span v-if="a.createdAt">{{ formatTime(a.createdAt) }}</span>
          <span v-else-if="a.ts">{{ formatTime(a.ts) }}</span>
          <span v-else>time: -</span>
          <span v-if="a.ip"> · ip: {{ a.ip }}</span>
        </div>

        <div v-if="a.summary || a.message" class="line3">
          {{ a.summary || a.message }}
        </div>

        <div v-if="a.detailJson || a.detail_json || a.detail" class="line4">
          <JsonViewer title="detail_json" :value="a.detailJson ?? a.detail_json ?? a.detail" :defaultOpen="false" />
        </div>
      </div>
    </div>

    <div v-if="records.length === 0 && !loading" class="empty sm-card sm-muted sm-small">
      暂无数据
    </div>

    <div class="pager sm-card">
      <div class="sm-muted sm-small">
        Total: {{ total }} · Page: {{ page }} · Size: {{ size }}
      </div>
      <div class="pops">
        <button class="sm-btn mini" :disabled="loading || page<=1" @click="prev">上一页</button>
        <button class="sm-btn mini" :disabled="loading || page>=maxPage" @click="next">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { adminGetAuditLogs } from "@/api/admin";
import JsonViewer from "@/components/admin/JsonViewer.vue";

const router = useRouter();

const action = ref("");
const actorId = ref("");
const q = ref("");
const from = ref("");
const to = ref("");

const records = ref([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);

const loading = ref(false);
const error = ref("");

const maxPage = computed(() => Math.max(1, Math.ceil((total.value || 0) / size.value)));

function back() {
  router.push({ name: "Feed" });
}

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return String(t);
  return d.toLocaleString();
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const params = {
      page: page.value,
      size: size.value,
      action: action.value?.trim() || undefined,
      actorId: actorId.value?.trim() || undefined,
      q: q.value?.trim() || undefined,
      from: from.value?.trim() || undefined,
      to: to.value?.trim() || undefined,
    };
    const res = await adminGetAuditLogs(params);
    records.value = res.records || [];
    total.value = res.total || 0;
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

async function reload() {
  page.value = 1;
  await load();
}

function reset() {
  action.value = "";
  actorId.value = "";
  q.value = "";
  from.value = "";
  to.value = "";
  reload();
}

function prev() {
  page.value = Math.max(1, page.value - 1);
  load();
}
function next() {
  page.value = Math.min(maxPage.value, page.value + 1);
  load();
}

onMounted(load);
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 14px 40px 14px;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 18px 0 12px 0;
}
.title {
  font-size: 16px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
}

.filters {
  padding: 12px;
  display: grid;
  gap: 10px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
@media (max-width: 980px) {
  .row {
    grid-template-columns: 1fr;
  }
}
.row2 {
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
}
.field .k {
  margin-bottom: 6px;
}
.ops {
  display: flex;
  gap: 10px;
}

.list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.item {
  padding: 12px;
}
.line1 {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.line2 {
  margin-top: 6px;
}
.line3 {
  margin-top: 8px;
  white-space: pre-wrap;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
}
.line4 {
  margin-top: 10px;
}
.strong {
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
}
.empty {
  margin-top: 12px;
  padding: 12px;
  text-align: center;
}

.pager {
  margin-top: 14px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pops {
  display: flex;
  gap: 10px;
}
.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}
</style>
