<!-- src/components/report/ReportDialog.vue -->
<template>
  <div v-if="open" class="mask" @click.self="close">
    <div class="dialog sm-card">
      <div class="head">
        <div class="title">举报</div>
        <button class="sm-btn mini" @click="close">✕</button>
      </div>

      <div class="body">
        <div class="field">
          <div class="k sm-muted sm-small">举报原因</div>
          <select class="sm-select" v-model="reasonCode">
            <option value="SPAM">SPAM（垃圾信息）</option>
            <option value="ABUSE">ABUSE（辱骂/骚扰）</option>
            <option value="NUDITY">NUDITY（色情/裸露）</option>
            <option value="VIOLENCE">VIOLENCE（暴力/血腥）</option>
            <option value="OTHERS">OTHERS（其他）</option>
          </select>
        </div>

        <div class="field">
          <div class="k sm-muted sm-small">补充说明（可选）</div>
          <textarea
            class="sm-textarea"
            v-model="description"
            maxlength="500"
            placeholder="描述问题，便于管理员处理..."
          ></textarea>
          <div class="sm-muted sm-small" style="margin-top:6px;">{{ description.length }}/500</div>
        </div>

        <MediaUploader
          v-model="evidenceMediaList"
          :max="9"
          title="证据图片（可选，最多 9 张）"
          :bizType="MEDIA_BIZ_TYPE.REPORT_EVIDENCE"
        />

        <div v-if="error" class="sm-error">{{ error }}</div>
      </div>

      <div class="foot">
        <button class="sm-btn" :disabled="submitting" @click="close">取消</button>
        <button class="sm-btn primary" :disabled="submitting" @click="submit">
          {{ submitting ? "提交中..." : "提交举报" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import MediaUploader from "@/components/media/MediaUploader.vue";
import { createReport } from "@/api/reports";
import { MEDIA_BIZ_TYPE, REPORT_REASON_CODE } from "@/constants/enums";
import { notify } from "@/utils/notify";

const props = defineProps({
  open: { type: Boolean, default: false },
  targetType: { type: String, required: true },
  targetId: { type: [Number, String], required: true },
});

const emit = defineEmits(["update:open", "success"]);

const reasonCode = ref(REPORT_REASON_CODE.SPAM);
const description = ref("");
const evidenceMediaList = ref([]);
const error = ref("");
const submitting = ref(false);

watch(
  () => props.open,
  (v) => {
    if (v) {
      reasonCode.value = REPORT_REASON_CODE.SPAM;
      description.value = "";
      evidenceMediaList.value = [];
      error.value = "";
      submitting.value = false;
    }
  }
);

const evidenceMediaIds = computed(() => evidenceMediaList.value.map((m) => m.id).filter(Boolean));

function close() {
  emit("update:open", false);
}

async function submit() {
  error.value = "";
  if (!props.targetType || !props.targetId) {
    error.value = "targetType/targetId 缺失";
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      targetType: props.targetType,
      targetId: props.targetId,
      reasonCode: reasonCode.value,
      description: description.value?.trim() || undefined,
      evidenceMediaIds: evidenceMediaIds.value.length ? evidenceMediaIds.value : undefined,
    };

    await createReport(payload);
    notify("举报已提交", "success");
    emit("success");
    close();
  } catch (e) {
    error.value = e?.message || "提交失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.dialog {
  width: 100%;
  max-width: 760px;
  overflow: hidden;
}

.head {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
.title {
  font-weight: 900;
}

.body {
  padding: 14px;
  display: grid;
  gap: 12px;
}

.foot {
  padding: 12px 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}
</style>
