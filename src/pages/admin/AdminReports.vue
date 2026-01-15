<!-- src/pages/admin/AdminReports.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">管理端 · 举报列表</div>
      <button class="sm-btn" :disabled="loading" @click="reload">
        {{ loading ? "加载中..." : "刷新" }}
      </button>
    </div>

    <ReportFilters v-model="filters" @change="onFiltersChange" />

    <div v-if="error" class="sm-error">{{ error }}</div>

    <div class="list">
      <div class="row sm-card" v-for="r in records" :key="r.id" @click="goDetail(r.id)">
        <div class="left">
          <div class="line1">
            <span class="strong">#{{ r.id }}</span>
            <span class="sm-chip">{{ r.status }}</span>
            <span class="sm-chip sm-muted">target: {{ r.targetType }}-{{ r.targetId }}</span>
          </div>
          <div class="line2 sm-muted sm-small">
            <span>reason: {{ r.reasonCode }}</span>
            <span v-if="r.createdAt"> · {{ formatTime(r.createdAt) }}</span>
            <span v-if="r.reporterUserId"> · reporter: {{ r.reporterUserId }}</span>
          </div>
          <div v-if="r.description" class="line3">{{ r.description }}</div>
        </div>
        <div class="right" @click.stop>
          <button class="sm-btn mini" @click="goDetail(r.id)">查看</button>
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
import ReportFilters from "@/components/admin/ReportFilters.vue";
import { adminGetReports } from "@/api/admin";

const router = useRouter();

const filters = ref({
  status: "",
  targetType: "",
  reasonCode: "",
  q: "",
});

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
      status: filters.value.status || undefined,
      targetType: filters.value.targetType || undefined,
      reasonCode: filters.value.reasonCode || undefined,
      q: filters.value.q || undefined,
    };
    const res = await adminGetReports(params);
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

function prev() {
  page.value = Math.max(1, page.value - 1);
  load();
}

function next() {
  page.value = Math.min(maxPage.value, page.value + 1);
  load();
}

function goDetail(id) {
  router.push({ name: "AdminReportDetail", params: { id } });
}

function onFiltersChange() {
  reload();
}

onMounted(load);
</script>

<style scoped>
.container {
  max-width: 980px;
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

.list {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}
.row {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
}
.line1 {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.line2 {
  margin-top: 4px;
}
.line3 {
  margin-top: 6px;
  white-space: pre-wrap;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
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
