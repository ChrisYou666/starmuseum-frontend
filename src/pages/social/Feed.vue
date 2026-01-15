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

    <div v-if="error" class="err">{{ error }}</div>

    <div class="list">
      <PostCard
        v-for="p in list"
        :key="p.id"
        :post="p"
        @like="doLike"
        @unlike="doUnlike"
      />
    </div>

    <div class="pager">
      <div class="left">
        <span class="muted">Total: {{ total }}</span>
        <span class="muted">Page: {{ page }}</span>
        <span class="muted">Size: {{ size }}</span>
      </div>

      <div class="right">
        <button class="btn" :disabled="loading || page <= 1" @click="prev">上一页</button>
        <button
          class="btn"
          :disabled="loading || page >= Math.max(1, Math.ceil(total / size))"
          @click="next"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PostCard from "@/components/PostCard.vue";
import { getFeedPage, likePost, unlikePost } from "@/api/social";
import { buildPageParams, normalizePageData } from "@/utils/paging";

const router = useRouter();

const list = ref([]);
const total = ref(0);

const page = ref(1);
const size = ref(10);

const loading = ref(false);
const error = ref("");

async function loadPage() {
  loading.value = true;
  error.value = "";
  try {
    const params = buildPageParams({ page: page.value, size: size.value });
    const resp = await getFeedPage(params);
    const p = normalizePageData(resp);
    list.value = p.records;
    total.value = p.total;
  } catch (e) {
    error.value = e?.message || "加载失败";
  } finally {
    loading.value = false;
  }
}

function goCreate() {
  router.push({ name: "CreatePost" });
}

async function reload() {
  page.value = 1;
  await loadPage();
}

function prev() {
  page.value = Math.max(1, page.value - 1);
  loadPage();
}

function next() {
  const maxPage = Math.max(1, Math.ceil(total.value / size.value));
  page.value = Math.min(maxPage, page.value + 1);
  loadPage();
}

async function doLike(p) {
  try {
    await likePost(p.id);
  } catch (e) {
    // 失败时用 reload 兜底刷新状态
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
.container {
  max-width: 880px;
  margin: 0 auto;
  padding: 18px 14px 40px 14px;
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 12px 0;
}
h1 { margin: 0; font-size: 34px; }

.ops { display: flex; gap: 10px; align-items: center; }

.help { font-size: 12px; color: #888; margin-top: 6px; }

.btn {
  border: 1px solid rgba(0,0,0,.12);
  background: white;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
}
.btn:disabled { opacity: .6; cursor: not-allowed; }
.btn.primary { background: #111; color: white; border-color: #111; }

.err {
  margin: 10px 0;
  padding: 10px 12px;
  border: 1px solid rgba(255,0,0,.18);
  border-radius: 12px;
  background: rgba(255,0,0,.05);
  color: #b00020;
}

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
.left { display: flex; gap: 10px; flex-wrap: wrap; }
.muted { color: #666; font-size: 12px; }
.right { display: flex; gap: 10px; }
</style>
