<!-- src/pages/admin/AdminReportDetail.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">管理端 · 举报详情</div>
      <button class="sm-btn" :disabled="loading" @click="load">
        {{ loading ? "加载中..." : "刷新" }}
      </button>
    </div>

    <div v-if="error" class="sm-error">{{ error }}</div>
    <div v-if="loading" class="sm-muted sm-small">加载中...</div>

    <div v-else-if="report" class="grid">
      <div class="leftCol">
        <div class="card sm-card">
          <div class="h">基础信息</div>

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
          <div class="row" v-if="report.reporterUserId">
            <div class="k sm-muted sm-small">举报人</div>
            <div class="v">{{ report.reporterUserId }}</div>
          </div>

          <div class="row" v-if="report.description">
            <div class="k sm-muted sm-small">说明</div>
            <div class="v pre">{{ report.description }}</div>
          </div>

          <div v-if="evidenceList.length" class="evidence">
            <div class="k sm-muted sm-small">证据图片</div>
            <div class="imgGrid">
              <img
                class="img"
                v-for="m in evidenceList"
                :key="m.id"
                :src="m.mediumUrl || m.thumbUrl || m.originUrl || m.url"
              />
            </div>
          </div>
        </div>

        <JsonViewer
          v-if="detailJsonValue !== null && detailJsonValue !== undefined && String(detailJsonValue).trim() !== ''"
          class="mt"
          title="detail_json"
          :value="detailJsonValue"
          :defaultOpen="false"
        />
      </div>

      <div class="rightCol">
        <div class="card sm-card">
          <div class="h">处理操作</div>

          <div class="sm-muted sm-small" style="margin-top:6px;">
            说明：极简管理端只要求能 start/review + 驳回/认定；其余 actions 若后端支持可扩展。
          </div>

          <div class="ops">
            <button class="sm-btn" :disabled="acting || !canStart" @click="startReview">
              {{ acting && actName==='start' ? "处理中..." : "Start Review" }}
            </button>

            <button class="sm-btn primary" :disabled="acting || !canResolve" @click="resolve">
              {{ acting && actName==='resolve' ? "处理中..." : "认定 RESOLVED" }}
            </button>

            <button class="sm-btn danger" :disabled="acting || !canReject" @click="reject">
              {{ acting && actName==='reject' ? "处理中..." : "驳回 REJECTED" }}
            </button>
          </div>

          <div class="notes">
            <div class="k sm-muted sm-small">管理员备注 notes</div>
            <textarea class="sm-textarea" v-model="notes" maxlength="1000" placeholder="记录处理意见（可选）"></textarea>
            <div class="line sm-muted sm-small">
              <span>{{ notes.length }}/1000</span>
              <button class="sm-btn mini" :disabled="acting || !canSaveNotes" @click="saveNotes">
                {{ acting && actName==='notes' ? "保存中..." : "保存 notes" }}
              </button>
            </div>
          </div>

          <div v-if="actionError" class="sm-error" style="margin-top:10px;">{{ actionError }}</div>
        </div>

        <div class="card sm-card mt">
          <div class="h">快捷跳转</div>
          <div class="jump sm-muted sm-small">
            <div>如果后端 detail 返回包含 target 链接信息，你可以在这里扩展 “跳转到帖子/评论/用户”。</div>
          </div>
          <div class="ops" style="margin-top:10px;">
            <button class="sm-btn mini" @click="goList">回举报列表</button>
            <button class="sm-btn mini" @click="goAudit">去审计日志</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty sm-card sm-muted sm-small">
      无数据
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import JsonViewer from "@/components/admin/JsonViewer.vue";
import { notify } from "@/utils/notify";
import {
  adminGetReportDetail,
  adminStartReview,
  adminResolveReport,
  adminRejectReport,
  adminUpdateReportNotes,
} from "@/api/admin";

const route = useRoute();
const router = useRouter();

const id = computed(() => route.params.id);

const loading = ref(false);
const error = ref("");

const report = ref(null);
const evidenceList = ref([]);

const notes = ref("");
const acting = ref(false);
const actName = ref("");
const actionError = ref("");

function back() {
  router.push({ name: "AdminReports" });
}

function goList() {
  router.push({ name: "AdminReports" });
}
function goAudit() {
  router.push({ name: "AdminAudit" });
}

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return String(t);
  return d.toLocaleString();
}

// detail_json 兼容：report.detailJson / report.detail_json / report.detail
const detailJsonValue = computed(() => {
  const r = report.value || {};
  return r.detailJson ?? r.detail_json ?? r.detail ?? null;
});

const canStart = computed(() => {
  const s = String(report.value?.status || "");
  return s === "OPEN";
});
const canResolve = computed(() => {
  const s = String(report.value?.status || "");
  return s === "IN_REVIEW" || s === "OPEN";
});
const canReject = computed(() => {
  const s = String(report.value?.status || "");
  return s === "IN_REVIEW" || s === "OPEN";
});
const canSaveNotes = computed(() => !!report.value?.id);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await adminGetReportDetail(id.value);
    // 兼容：res.report / res
    report.value = res?.report || res;
    evidenceList.value =
      res?.evidenceMediaList ||
      report.value?.evidenceMediaList ||
      report.value?.evidenceList ||
      [];

    notes.value = String(report.value?.notes || report.value?.adminNotes || "");
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

async function startReview() {
  actionError.value = "";
  acting.value = true;
  actName.value = "start";
  try {
    await adminStartReview(report.value.id);
    notify("已开始处理", "success");
    await load();
  } catch (e) {
    actionError.value = e?.message || "操作失败";
  } finally {
    acting.value = false;
    actName.value = "";
  }
}

async function resolve() {
  actionError.value = "";
  acting.value = true;
  actName.value = "resolve";
  try {
    await adminResolveReport(report.value.id, { notes: notes.value?.trim() || undefined });
    notify("已认定（RESOLVED）", "success");
    await load();
  } catch (e) {
    actionError.value = e?.message || "操作失败";
  } finally {
    acting.value = false;
    actName.value = "";
  }
}

async function reject() {
  actionError.value = "";
  acting.value = true;
  actName.value = "reject";
  try {
    await adminRejectReport(report.value.id, { notes: notes.value?.trim() || undefined });
    notify("已驳回（REJECTED）", "success");
    await load();
  } catch (e) {
    actionError.value = e?.message || "操作失败";
  } finally {
    acting.value = false;
    actName.value = "";
  }
}

async function saveNotes() {
  actionError.value = "";
  acting.value = true;
  actName.value = "notes";
  try {
    await adminUpdateReportNotes(report.value.id, { notes: notes.value?.trim() || "" });
    notify("notes 已保存", "success");
    await load();
  } catch (e) {
    // 如果后端没实现 notes 单独接口，这里给出提示，但不阻断使用 resolve/reject 里的 notes
    actionError.value = e?.message || "保存 notes 失败（如果后端未实现 /notes，可忽略）";
  } finally {
    acting.value = false;
    actName.value = "";
  }
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

.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 12px;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  padding: 14px;
  display: grid;
  gap: 10px;
}
.h {
  font-weight: 900;
  font-size: 14px;
}
.row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  align-items: start;
}
.v {
  color: rgba(255, 255, 255, 0.92);
}
.pre {
  white-space: pre-wrap;
}

.evidence .imgGrid {
  margin-top: 8px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 720px) {
  .evidence .imgGrid {
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
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.notes .k {
  margin-bottom: 6px;
}
.notes .line {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.mt {
  margin-top: 12px;
}

.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}

.sm-btn.danger {
  border-color: rgba(255, 0, 0, 0.22);
  background: rgba(255, 0, 0, 0.10);
  color: rgba(255, 200, 200, 0.95);
}
.sm-btn.danger:hover {
  background: rgba(255, 0, 0, 0.14);
}

.empty {
  margin-top: 12px;
  padding: 12px;
  text-align: center;
}
</style>
