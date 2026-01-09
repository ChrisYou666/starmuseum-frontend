<template>
  <div class="container">
    <div class="head">
      <div>
        <h1>Feed</h1>
        <div class="help">最新动态（/api/post/page）</div>
      </div>

      <div class="ops">
        <button class="btn primary" @click="goCreate">
          发帖
        </button>

        <button class="btn" :disabled="loading" @click="reload">
          {{ loading ? "加载中..." : "刷新" }}
        </button>
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <div class="list">
      <PostCard
        v-for="p in list"
        :key="p.id"
        :post="p"
        @open="openDetail(p)"
        @like="doLike(p)"
        @unlike="doUnlike(p)"
      />
    </div>

    <div class="pager card">
      <button class="btn" :disabled="loading || pageNo <= 1" @click="prevPage">上一页</button>
      <div class="help">第 {{ pageNo }} 页 · 共 {{ total }} 条</div>
      <button class="btn" :disabled="loading || list.length === 0" @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PostCard from "@/components/PostCard.vue";
import { getFeedPage, likePost, unlikePost } from "@/api/social";

const router = useRouter();

const list = ref([]);
const total = ref(0);

const pageNo = ref(1);
const pageSize = ref(10);

const loading = ref(false);
const error = ref("");

function normalizePageResp(resp) {
  const records = resp?.records || resp?.list || resp?.items || [];
  const t = resp?.total ?? records.length;
  return { records, total: t };
}

async function loadPage() {
  loading.value = true;
  error.value = "";
  try {
    const resp = await getFeedPage({ pageNo: pageNo.value, pageSize: pageSize.value });
    const { records, total: t } = normalizePageResp(resp);
    list.value = records || [];
    total.value = t ?? 0;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "加载 Feed 失败";
  } finally {
    loading.value = false;
  }
}

function reload() {
  pageNo.value = 1;
  loadPage();
}

function prevPage() {
  pageNo.value = Math.max(1, pageNo.value - 1);
  loadPage();
}

function nextPage() {
  pageNo.value = pageNo.value + 1;
  loadPage();
}

function goCreate() {
  // 点击“发帖”跳到发帖页面
  router.push("/post/create");
}

function openDetail(p) {
  router.push(`/post/${p.id}`);
}

async function doLike(p) {
  try {
    await likePost(p.id);
  } catch (e) {
    await loadPage();
  }
}

async function doUnlike(p) {
  try {
    await unlikePost(p.id);
  } catch (e) {
    await loadPage();
  }
}

onMounted(loadPage);
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

.ops { display: flex; gap: 10px; align-items: center; }

.list {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.pager {
  margin: 14px 0 22px 0;
  padding: 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
