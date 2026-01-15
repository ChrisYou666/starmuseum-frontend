<!-- src/pages/me/Blocks.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">我的拉黑</div>
      <button class="sm-btn" :disabled="loading" @click="reload">
        {{ loading ? "加载中..." : "刷新" }}
      </button>
    </div>

    <div v-if="error" class="sm-error">{{ error }}</div>

    <div class="list">
      <div class="row sm-card" v-for="b in records" :key="b.id || b.blockedUserId">
        <div class="info">
          <div class="name">
            {{ b.blockedNickname || b.nickname || ("User#" + (b.blockedUserId || b.userId || "")) }}
          </div>
          <div class="sm-muted sm-small">
            blockedUserId: {{ b.blockedUserId || b.userId }}
            <span v-if="b.createdAt"> · {{ formatTime(b.createdAt) }}</span>
          </div>
        </div>
        <div class="ops">
          <button class="sm-btn mini" :disabled="loading" @click="doUnblock(b.blockedUserId || b.userId)">取消拉黑</button>
        </div>
      </div>
    </div>

    <div v-if="records.length === 0 && !loading" class="empty sm-card sm-muted sm-small">
      暂无拉黑记录
    </div>

    <div class="pager sm-card">
      <div class="sm-muted sm-small">Total: {{ total }} · Page: {{ page }} · Size: {{ size }}</div>
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
import { getMyBlocks, unblockUser } from "@/api/blocks";
import { notify } from "@/utils/notify";

const router = useRouter();

const records = ref([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);

const loading = ref(false);
const error = ref("");

const maxPage = computed(() => Math.max(1, Math.ceil((total.value || 0) / size.value)));

function back() {
  router.push({ name: "Profile" });
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
    const res = await getMyBlocks({ page: page.value, size: size.value });
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

async function doUnblock(userId) {
  if (!userId) return;
  try {
    await unblockUser(userId);
    notify("已取消拉黑", "success");
    await load();
  } catch (e) {
    notify(e?.message || "操作失败");
  }
}

function prev() {
  page.value = Math.max(1, page.value - 1);
  load();
}
function next() {
  page.value = Math.min(maxPage.value, page.value + 1);
  load();
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
}

.name {
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
