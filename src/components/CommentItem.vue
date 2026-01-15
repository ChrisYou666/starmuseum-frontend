<!-- src/components/CommentItem.vue -->
<template>
  <div class="c sm-card">
    <div class="top">
      <div class="user">
        <img class="avatar" :src="comment.avatarUrl || fallbackAvatar" />
        <div>
          <div class="name">{{ comment.nickname || "Unknown" }}</div>
          <div class="sm-muted sm-small">{{ formatTime(comment.createdAt) }}</div>
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn mini" @click="openReport">举报</button>
        <button v-if="canDelete" class="sm-btn mini danger" @click="$emit('delete', comment)">
          删除
        </button>
      </div>
    </div>

    <div class="content">{{ comment.content }}</div>

    <ReportDialog
      v-model:open="reportOpen"
      targetType="COMMENT"
      :targetId="comment.id"
      @success="onReportSuccess"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import ReportDialog from "@/components/report/ReportDialog.vue";
import { notify } from "@/utils/notify";

const props = defineProps({
  comment: { type: Object, required: true },
  me: { type: Object, default: null },
});

defineEmits(["delete"]);

const reportOpen = ref(false);

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23555'/%3E%3Ctext x='32' y='38' text-anchor='middle' font-size='18' fill='%23ccc'%3EUser%3C/text%3E%3C/svg%3E";

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return String(t);
  return d.toLocaleString();
}

const canDelete = computed(() => {
  const myId = props.me?.id;
  const uid = props.comment.userId;
  return myId != null && uid != null && String(myId) === String(uid);
});

function openReport() {
  reportOpen.value = true;
}

function onReportSuccess() {
  notify("已提交举报", "success");
}
</script>

<style scoped>
.c {
  padding: 12px;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.user {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.name {
  font-weight: 800;
}

.ops {
  display: flex;
  gap: 8px;
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

.content {
  margin-top: 10px;
  white-space: pre-wrap;
  line-height: 1.5;
}
</style>
