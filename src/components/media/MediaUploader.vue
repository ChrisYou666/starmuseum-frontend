<!-- src/components/media/MediaUploader.vue -->
<template>
  <div class="uploader sm-card">
    <div class="head">
      <div class="title">
        <div class="label">{{ title }}</div>
        <div class="hint sm-muted sm-small">{{ hintText }}</div>
      </div>

      <div class="ops">
        <label class="sm-btn primary" :class="{ disabled: disabled || isFull }">
          选择图片
          <input
            class="file"
            type="file"
            accept="image/*"
            multiple
            :disabled="disabled || isFull"
            @change="onPick"
          />
        </label>

        <button class="sm-btn" :disabled="disabled || uploading || items.length === 0" @click="clearAll">
          清空
        </button>
      </div>
    </div>

    <div v-if="error" class="sm-error">{{ error }}</div>

    <div v-if="uploading" class="sm-muted sm-small" style="margin-top:10px;">
      上传中...（{{ uploadingText }}）
    </div>

    <div class="grid" v-if="items.length">
      <div class="cell sm-card" v-for="(m, idx) in items" :key="m.__key">
        <div class="thumb">
          <img class="img" :src="pickUrl(m)" />
          <div class="badges">
            <span v-if="m.exifStripped" class="badge ok">EXIF Cleared</span>
            <span v-if="m.exifHasGps" class="badge warn">GPS</span>
            <span v-if="m.exifHasDevice" class="badge warn">Device</span>
          </div>
        </div>

        <div class="meta">
          <div class="row">
            <span class="id">#{{ m.id }}</span>
            <button class="sm-btn mini" :disabled="disabled || uploading" @click="removeAt(idx)">删除</button>
          </div>
          <div class="sm-muted sm-small">
            {{ (m.sizeBytes ?? 0) > 0 ? formatSize(m.sizeBytes) : "" }}
            <span v-if="m.mimeType"> · {{ m.mimeType }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty sm-muted sm-small">
      暂无图片。最多 {{ max }} 张。
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { uploadMedia } from "@/api/media";
import { notify } from "@/utils/notify";

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // MediaUploadResponse[]
  max: { type: Number, default: 9 },
  bizType: { type: String, default: "POST" },
  title: { type: String, default: "图片" },
  hint: { type: String, default: "上传后将自动清理 EXIF（GPS/设备信息等）" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const items = ref([]);
const uploading = ref(false);
const uploadingText = ref("");
const error = ref("");

watch(
  () => props.modelValue,
  (v) => {
    items.value = (Array.isArray(v) ? v : []).map((x) => ({
      ...x,
      __key: x.__key || `${x.id || "tmp"}_${Math.random().toString(16).slice(2)}`,
    }));
  },
  { immediate: true, deep: true }
);

const isFull = computed(() => items.value.length >= props.max);
const hintText = computed(() => props.hint || `最多 ${props.max} 张`);

function pickUrl(m) {
  return m.mediumUrl || m.thumbUrl || m.originUrl || m.url || "";
}

function formatSize(bytes) {
  const b = Number(bytes || 0);
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function syncOut() {
  emit(
    "update:modelValue",
    items.value.map((x) => {
      const { __key, ...rest } = x;
      return { ...rest, __key };
    })
  );
}

function removeAt(idx) {
  items.value.splice(idx, 1);
  syncOut();
}

function clearAll() {
  items.value = [];
  syncOut();
}

async function onPick(e) {
  error.value = "";
  const fileList = e?.target?.files ? Array.from(e.target.files) : [];
  e.target.value = ""; // 允许再次选同一文件

  if (!fileList.length) return;

  const remain = props.max - items.value.length;
  if (remain <= 0) {
    notify(`最多只能上传 ${props.max} 张`, "warn");
    return;
  }

  const toUpload = fileList.slice(0, remain);

  uploading.value = true;
  try {
    for (let i = 0; i < toUpload.length; i++) {
      const f = toUpload[i];
      uploadingText.value = `${i + 1}/${toUpload.length} - ${f.name}`;
      const res = await uploadMedia(f, { bizType: props.bizType });
      items.value.push({
        ...res,
        __key: `${res.id}_${Math.random().toString(16).slice(2)}`,
      });
      syncOut();
    }
    notify("上传成功", "success");
  } catch (err) {
    error.value = err?.message || "上传失败";
  } finally {
    uploading.value = false;
    uploadingText.value = "";
  }
}
</script>

<style scoped>
.uploader {
  padding: 12px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title .label {
  font-weight: 800;
  font-size: 14px;
}

.ops {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.file {
  display: none;
}

.grid {
  margin-top: 12px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.cell {
  overflow: hidden;
}

.thumb {
  position: relative;
  width: 100%;
  height: 170px;
  background: rgba(255, 255, 255, 0.06);
}
.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badges {
  position: absolute;
  left: 8px;
  top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.92);
}
.badge.ok {
}
.badge.warn {
}

.meta {
  padding: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.id {
  font-weight: 800;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.92);
}

.empty {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 12px;
}

.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}
</style>
