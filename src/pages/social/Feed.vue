<!-- src/pages/social/Feed.vue -->
<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>Feed</h1>
        <div class="sm-muted sm-small">
          阶段5-F1：推荐 Feed 已接入（/api/feed/recommend）。Tab 影响 mode（MIX / FOLLOW / HOT）
          <span v-if="usingFallback" class="sm-warn">（当前使用旧接口兜底 /api/post/page）</span>
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn primary" @click="goCreate">发帖</button>
        <button class="sm-btn" :disabled="loading" @click="reload">
          {{ loading ? "加载中..." : "刷新" }}
        </button>
      </div>
    </div>

    <!-- Tab UI -->
    <div class="tabs sm-card">
      <button class="tab" :class="{ active: mode === 'MIX' }" @click="setMode('MIX')">
        推荐 <span class="sm-chip small">MIX</span>
      </button>
      <button class="tab" :class="{ active: mode === 'FOLLOW' }" @click="setMode('FOLLOW')">
        关注 <span class="sm-chip small">FOLLOW</span>
      </button>
      <button class="tab" :class="{ active: mode === 'HOT' }" @click="setMode('HOT')">
        热门 <span class="sm-chip small">HOT</span>
      </button>
    </div>

    <div v-if="error" class="sm-error" style="margin-top:12px">{{ error }}</div>

    <div class="list">
      <PostCard
        v-for="p in list"
        :key="p.id"
        :post="p"
        @like="doLike"
        @unlike="doUnlike"
      />
    </div>

    <!-- 翻页按钮（企业级更稳，后续需要可升级无限滚动） -->
    <div class="pager sm-card">
      <div class="left">
        <span class="sm-muted sm-small">Mode: {{ mode }}</span>
        <span class="sm-muted sm-small">Total: {{ total }}</span>
        <span class="sm-muted sm-small">Page: {{ page }}</span>
        <span class="sm-muted sm-small">Size: {{ size }}</span>
      </div>

      <div class="right">
        <button class="sm-btn" :disabled="loading || page <= 1" @click="prev">上一页</button>
        <button
          class="sm-btn"
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
import { likePost, unlikePost } from "@/api/social";
import { normalizePageData } from "@/utils/paging";
import { getFeedRecommendPage, getLegacyFeedPage, unwrapBizData } from "@/api/feedRecommend";

const router = useRouter();

const list = ref([]);
const total = ref(0);

const page = ref(1);
const size = ref(10);

// ✅ 阶段5：Tab 对应 mode
const mode = ref("MIX");

const loading = ref(false);
const error = ref("");

// 企业级：可观测性——当前是否使用兜底
const usingFallback = ref(false);

function resetForNewQuery() {
  list.value = [];
  total.value = 0;
  page.value = 1;
}

function mapToPostCardShape(item) {
  // 如果推荐接口返回结构与 PostCard 完全一致，这里不需要动
  // 企业级保险：如果字段名不同，可在这里做适配
  return item;
}

async function loadPage() {
  loading.value = true;
  error.value = "";

  try {
    usingFallback.value = false;

    // 1) 优先新接口（推荐 Feed）
    const resp = await getFeedRecommendPage({
      page: page.value,
      size: size.value,
      mode: mode.value,
    });

    const biz = unwrapBizData(resp);
    const p = normalizePageData(biz); // 你现有工具：统一解析 records/total

    list.value = (p.records || []).map(mapToPostCardShape);
    total.value = Number(p.total || 0);
  } catch (e1) {
    // 2) 兜底旧接口
    usingFallback.value = true;

    try {
      const resp2 = await getLegacyFeedPage({ page: page.value, size: size.value });
      const biz2 = unwrapBizData(resp2);
      const p2 = normalizePageData(biz2);

      list.value = (p2.records || []).map(mapToPostCardShape);
      total.value = Number(p2.total || 0);

      // 同时给出提示（企业级：别“悄悄失败”）
      const msg = e1?.message || "推荐接口不可用，已使用旧接口兜底";
      error.value = `提示：${msg}`;
    } catch (e2) {
      error.value = e2?.message || e1?.message || "加载失败";
    }
  } finally {
    loading.value = false;
  }
}

function setMode(m) {
  if (mode.value === m) return;
  mode.value = m;
  resetForNewQuery();
  loadPage();
}

function goCreate() {
  router.push({ name: "CreatePost" });
}

async function reload() {
  resetForNewQuery();
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
    // 失败就重刷（企业级：保证一致性）
  } finally {
    await loadPage();
  }
}

async function doUnlike(p) {
  try {
    await unlikePost(p.id);
  } catch (e) {
  } finally {
    await loadPage();
  }
}

onMounted(loadPage);
</script>

<style scoped>
.page {
  padding: 18px 0 40px 0;
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 0 12px 0;
}

h1 {
  margin: 0;
  font-size: 34px;
}

.ops {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.tabs {
  margin-top: 10px;
  padding: 8px;
  display: flex;
  gap: 8px;
}

.tab {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.90);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.10);
}

.tab.active {
  border-color: rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.12);
}

.sm-chip.small {
  font-size: 11px;
  padding: 2px 8px;
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

.left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
