<template>
  <div class="container">
    <div class="head">
      <div>
        <h1>发帖</h1>
        <div class="help">文字 + 图片（1~9）</div>
      </div>
      <button class="btn" @click="goBack">返回</button>
    </div>

    <div class="card box">
      <div class="label">内容</div>
      <textarea class="ta" v-model="content" placeholder="写点什么..." rows="5"></textarea>

      <div class="row">
        <div class="label">可见性</div>
        <select class="input sel" v-model="visibility">
          <option value="PUBLIC">PUBLIC</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
      </div>

      <div class="label" style="margin-top: 10px;">图片（最多 9 张）</div>
      <div class="row">
        <input type="file" accept="image/*" multiple @change="onPickFiles" />
        <button class="btn" :disabled="uploading || files.length===0" @click="uploadBatch">
          {{ uploading ? "上传中..." : "上传图片" }}
        </button>
      </div>

      <div v-if="files.length" class="grid">
        <div v-for="(f, idx) in files" :key="idx" class="thumb">
          <img :src="f.preview" />
          <button class="x" @click="removeFile(idx)">×</button>
        </div>
      </div>

      <div v-if="uploadedMediaIds.length" class="help" style="margin-top: 10px;">
        已上传 {{ uploadedMediaIds.length }} 张
      </div>

      <div class="actions">
        <button class="btn primary" :disabled="publishing || !canPublish" @click="publish">
          {{ publishing ? "发布中..." : "发布" }}
        </button>
      </div>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="ok" class="alert ok">{{ ok }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { uploadBatchMedia } from "@/api/media";
import { createPost } from "@/api/post";

const router = useRouter();

const content = ref("");
const visibility = ref("PUBLIC");

const files = ref([]); // {file, preview}
const uploadedMediaIds = ref([]);

const uploading = ref(false);
const publishing = ref(false);
const error = ref("");
const ok = ref("");

const canPublish = computed(() => {
  // 有内容 或 有图
  return (content.value && content.value.trim().length > 0) || uploadedMediaIds.value.length > 0;
});

function goBack() {
  router.back();
}

function onPickFiles(e) {
  error.value = "";
  ok.value = "";

  const picked = Array.from(e.target.files || []);
  if (!picked.length) return;

  const remain = 9 - files.value.length;
  const toAdd = picked.slice(0, remain);

  toAdd.forEach((file) => {
    files.value.push({
      file,
      preview: URL.createObjectURL(file),
    });
  });

  // 清空 input，避免选择同一批文件不触发 change
  e.target.value = "";
}

function removeFile(idx) {
  const item = files.value[idx];
  if (item?.preview) URL.revokeObjectURL(item.preview);
  files.value.splice(idx, 1);

  // 删除后建议重新上传一次（简单处理：清空已上传标记）
  uploadedMediaIds.value = [];
}

async function uploadBatch() {
  if (!files.value.length) return;

  uploading.value = true;
  error.value = "";
  ok.value = "";
  try {
    const rawFiles = files.value.map((x) => x.file);
    const resp = await uploadBatchMedia(rawFiles);

    // 兼容返回：可能是 [{id,...}] 或 {ids:[...]} 或 [id...]
    let ids = [];
    if (Array.isArray(resp)) {
      ids = resp.map((x) => (typeof x === "object" ? x.id : x)).filter(Boolean);
    } else if (resp?.ids) {
      ids = resp.ids;
    }
    if (!ids.length) throw new Error("上传成功但未返回 mediaId 列表");

    uploadedMediaIds.value = ids;
    ok.value = "图片上传成功";
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "图片上传失败";
  } finally {
    uploading.value = false;
  }
}

async function publish() {
  publishing.value = true;
  error.value = "";
  ok.value = "";

  try {
    // 如果选择了图片但还没上传，自动先上传
    if (files.value.length && uploadedMediaIds.value.length === 0) {
      await uploadBatch();
      if (!uploadedMediaIds.value.length) return;
    }

    await createPost({
      content: content.value,
      visibility: visibility.value,
      mediaIds: uploadedMediaIds.value,
    });

    ok.value = "发布成功";
    setTimeout(() => router.replace("/feed"), 400);
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "发布失败（请看 Network 响应）";
  } finally {
    publishing.value = false;
  }
}
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 12px 0;
}
h1 { margin: 0; font-size: 34px; }

.box { padding: 14px; border-radius: 18px; }

.ta {
  width: 100%;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.22);
  color: rgba(255,255,255,0.92);
  outline: none;
  resize: vertical;
  margin-top: 6px;
}
.ta:focus {
  border-color: rgba(124,92,255,0.7);
  box-shadow: 0 0 0 4px rgba(124,92,255,0.18);
}

.row { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
.sel { width: 160px; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.thumb {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.10);
}
.thumb img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }
.x {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(0,0,0,0.45);
  color: rgba(255,255,255,0.9);
  cursor: pointer;
}
.actions { margin-top: 14px; display: flex; justify-content: flex-end; }
</style>
