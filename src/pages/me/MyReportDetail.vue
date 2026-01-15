<!-- src/pages/me/MyReportDetail.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">举报详情</div>
      <button class="sm-btn" :disabled="loading" @click="load">
        {{ loading ? "加载中..." : "刷新" }}
      </button>
    </div>

    <div v-if="error" class="sm-error">{{ error }}</div>
    <div v-if="loading" class="sm-muted sm-small">加载中...</div>

    <div v-else-if="report" class="card sm-card">
      <div class="row">
        <div class="k sm-muted sm-small">ID</div>
        <div class="v">#{{ report.id }}</div>
      </div>
      <div class="row">
        <div class="k sm-muted sm-small">状态</div>
        <div class="v"><span class="sm-chip">{{ report.status }}</span></div>
      </div>
      <div class="row">
        <div class="k sm-muted sm-small">目标</div>
        <div class="v">{{ report.targetType }} - {{ report.targetId }}</div>
      </div>
      <div class="row">
        <div class="k sm-muted sm-small">原因</div>
        <div class="v">{{ report.reasonCode }}</div>
      </div>
      <div class="row" v-if="report.createdAt">
        <div class="k sm-muted sm-small">创建时间</div>
        <div class="v">{{ formatTime(report.createdAt) }}</div>
      </div>
      <div class="row" v-if="report.description">
        <div class="k sm-muted sm-small">说明</div>
        <div class="v pre">{{ report.description }}</div>
      </div>

      <div class="evidence" v-if="evidenceList.length">
        <div class="ek sm-muted sm-small">证据图片</div>
        <div class="grid">
          <img
            class="img"
            v-for="m in evidenceList"
            :key="m.id"
            :src="m.mediumUrl || m.thumbUrl || m.originUrl || m.url"
          />
        </div>
      </div>

      <div class="ops" v-if="report.status === 'OPEN'">
        <button class="sm-btn danger" :disabled="withdrawing" @click="withdraw">
          {{ withdrawing ? "撤回中..." : "撤回举报" }}
        </button>
      </div>
      <div class="sm-muted sm-small" v-else>
        只有 OPEN 状态可撤回。
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMyReportDetail, withdrawMyReport } from "@/api/reports";
import { notify } from "@/utils/notify";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);

const loading = ref(false);
const withdrawing = ref(false);
const error = ref("");

const report = ref(null);
const evidenceList = ref([]);

function back() {
  router.push({ name: "MyReports" });
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
    const res = await getMyReportDetail(id.value);
    report.value = res?.report || res;
    evidenceList.value = res?.evidenceMediaList || report.value?.evidenceMediaList || [];
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

async function withdraw() {
  if (!report.value?.id) return;
  withdrawing.value = true;
  try {
    await withdrawMyReport(report.value.id);
    notify("已撤回举报", "success");
    await load();
  } catch (e) {
    notify(e?.message || "撤回失败");
  } finally {
    withdrawing.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.container {
  max-width: 880px;
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

.card {
  padding: 14px;
  display: grid;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px;
  align-items: start;
}

.v {
  color: rgba(255, 255, 255, 0.92);
}

.pre {
  white-space: pre-wrap;
}

.evidence {
  margin-top: 6px;
}
.grid {
  margin-top: 8px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.img {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.ops {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.sm-btn.danger {
  border-color: rgba(255, 0, 0, 0.22);
  background: rgba(255, 0, 0, 0.10);
  color: rgba(255, 200, 200, 0.95);
}
.sm-btn.danger:hover {
  background: rgba(255, 0, 0, 0.14);
}
</style>
