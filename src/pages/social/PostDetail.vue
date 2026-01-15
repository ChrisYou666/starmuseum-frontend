<!-- src/pages/social/PostDetail.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">帖子详情</div>
      <div class="rightOps">
        <button class="sm-btn mini" v-if="post" @click="openReportPost">举报</button>
        <BlockButton v-if="post && post.userId" :blockedUserId="post.userId" @changed="onBlockChanged" />
      </div>
    </div>

    <div v-if="loading" class="sm-muted sm-small">加载中...</div>

    <EmptyState v-else-if="notVisible" />

    <div v-else-if="error" class="sm-error">{{ error }}</div>

    <div v-else-if="post" class="card sm-card">
      <div class="meta">
        <div class="author">
          <img class="avatar" :src="post.avatarUrl || fallbackAvatar" />
          <div>
            <div class="name">{{ post.nickname || "Unknown" }}</div>
            <div class="sub sm-small sm-muted">
              <span>{{ formatTime(post.createdAt) }}</span>
              <span class="dot">·</span>
              <span>{{ post.visibility || "PUBLIC" }}</span>
              <template v-if="locationText">
                <span class="dot">·</span>
                <span class="loc">📍 {{ locationText }}</span>
              </template>
            </div>
          </div>
        </div>

        <div class="actions">
          <button class="sm-btn mini" v-if="!post.liked" @click="doLike">点赞</button>
          <button class="sm-btn mini" v-else @click="doUnlike">取消点赞</button>
        </div>
      </div>

      <div class="content">{{ post.content }}</div>

      <div v-if="post.mediaList && post.mediaList.length" class="media">
        <img
          v-for="m in post.mediaList"
          :key="m.id"
          class="img"
          :src="m.originUrl || m.mediumUrl || m.thumbUrl || m.url"
        />
      </div>

      <div class="counts">
        <span class="sm-chip">👍 {{ post.likeCount || 0 }}</span>
        <span class="sm-chip">💬 {{ post.commentCount || 0 }}</span>
      </div>
    </div>

    <div class="section" v-if="!notVisible">
      <div class="section-title">评论</div>

      <div class="comment-box sm-card">
        <input class="sm-input" v-model="newComment" placeholder="写点什么..." maxlength="500" />
        <button class="sm-btn primary" :disabled="commentLoading || !newComment.trim()" @click="onSubmitComment">
          {{ commentLoading ? "发送中..." : "发送" }}
        </button>
      </div>

      <div v-if="cError" class="sm-error" style="margin-top:10px;">{{ cError }}</div>

      <div class="comments">
        <CommentItem
          v-for="c in cList"
          :key="c.id"
          :comment="c"
          :me="auth.currentUser"
          @delete="onDeleteComment"
        />
      </div>

      <div class="pager sm-card">
        <div class="left sm-small sm-muted">
          <span>Total: {{ cTotal }}</span>
          <span> · Page: {{ cPage }}</span>
          <span> · Size: {{ cSize }}</span>
        </div>
        <div class="right">
          <button class="sm-btn mini" :disabled="commentLoading || cPage <= 1" @click="prevComments">上一页</button>
          <button
            class="sm-btn mini"
            :disabled="commentLoading || cPage >= Math.max(1, Math.ceil(cTotal / cSize))"
            @click="nextComments"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <ReportDialog v-model:open="reportOpen" targetType="POST" :targetId="postId" @success="onReportSuccess" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getPostDetail, likePost, unlikePost } from "@/api/social";
import { createComment, deleteComment, getCommentPage } from "@/api/comment";
import CommentItem from "@/components/CommentItem.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import ReportDialog from "@/components/report/ReportDialog.vue";
import BlockButton from "@/components/user/BlockButton.vue";
import { notify } from "@/utils/notify";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const postId = computed(() => route.params.id);

const post = ref(null);
const error = ref("");
const loading = ref(false);

const notVisible = ref(false);

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23555'/%3E%3Ctext x='32' y='38' text-anchor='middle' font-size='18' fill='%23ccc'%3EUser%3C/text%3E%3C/svg%3E";

const cList = ref([]);
const cTotal = ref(0);
const cPage = ref(1);
const cSize = ref(10);

const newComment = ref("");
const commentLoading = ref(false);
const cError = ref("");

const reportOpen = ref(false);

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return String(t);
  return d.toLocaleString();
}

function back() {
  router.push({ name: "Feed" });
}

function normalizeLocation(loc) {
  if (!loc) return null;
  const visibility = loc.visibility || loc.locationVisibility || loc.level || null;
  const cityName = loc.cityName || loc.city || "";
  const lat = loc.lat ?? loc.latitude ?? null;
  const lon = loc.lon ?? loc.lng ?? loc.longitude ?? null;
  return { visibility, cityName, lat, lon };
}

const locationText = computed(() => {
  const loc = normalizeLocation(post.value?.location);
  if (!loc || !loc.visibility) return "";
  if (loc.visibility === "HIDDEN") return "";
  if (loc.visibility === "CITY") return loc.cityName ? loc.cityName : "城市";
  if (loc.visibility === "FUZZY") return loc.cityName ? `${loc.cityName} 附近` : "某区域附近";
  if (loc.visibility === "EXACT") {
    if (loc.lat != null && loc.lon != null) return `${Number(loc.lat).toFixed(4)}, ${Number(loc.lon).toFixed(4)}`;
    return loc.cityName ? loc.cityName : "精确位置";
  }
  return "";
});

function isNotVisibleMessage(msg) {
  const m = String(msg || "").toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("不可见") ||
    (m.includes("无权限") && m.includes("查看")) ||
    m.includes("blocked") ||
    m.includes("forbidden") ||
    m.includes("已删除") ||
    m.includes("deleted")
  );
}

async function loadPost() {
  loading.value = true;
  error.value = "";
  notVisible.value = false;
  try {
    post.value = await getPostDetail(postId.value);
  } catch (e) {
    const msg = e?.message || "加载帖子失败";
    if (isNotVisibleMessage(msg)) {
      notVisible.value = true;
    } else {
      error.value = msg;
    }
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  commentLoading.value = true;
  cError.value = "";
  try {
    const res = await getCommentPage(postId.value, { page: cPage.value, size: cSize.value });
    cList.value = res.records || [];
    cTotal.value = res.total || 0;
  } catch (e) {
    const msg = e?.message || "加载评论失败";
    if (isNotVisibleMessage(msg)) {
      notVisible.value = true;
    } else {
      cError.value = msg;
    }
  } finally {
    commentLoading.value = false;
  }
}

async function doLike() {
  try {
    await likePost(postId.value);
    await loadPost();
  } catch (_) {}
}

async function doUnlike() {
  try {
    await unlikePost(postId.value);
    await loadPost();
  } catch (_) {}
}

async function onSubmitComment() {
  commentLoading.value = true;
  cError.value = "";
  try {
    await createComment(postId.value, { content: newComment.value });
    newComment.value = "";
    cPage.value = 1;
    await loadPost();
    await loadComments();
  } catch (e) {
    const msg = e?.message || "发表评论失败";
    if (isNotVisibleMessage(msg)) notVisible.value = true;
    else cError.value = msg;
  } finally {
    commentLoading.value = false;
  }
}

async function onDeleteComment(c) {
  try {
    await deleteComment(c.id);
    await loadPost();
    await loadComments();
  } catch (_) {}
}

function prevComments() {
  cPage.value = Math.max(1, cPage.value - 1);
  loadComments();
}
function nextComments() {
  cPage.value = cPage.value + 1;
  loadComments();
}

function openReportPost() {
  reportOpen.value = true;
}

function onReportSuccess() {
  notify("已提交举报", "success");
}

function onBlockChanged() {
  notify("已更新拉黑状态，已返回列表", "success");
  router.push({ name: "Feed" });
}

onMounted(async () => {
  await loadPost();
  if (!notVisible.value) {
    await loadComments();
  }
});
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
  gap: 12px;
  margin: 18px 0 12px 0;
}

.title {
  font-size: 16px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
}

.rightOps {
  display: flex;
  gap: 10px;
  align-items: center;
}

.card {
  padding: 14px;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.author {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.name {
  font-weight: 900;
}

.sub {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dot {
  color: rgba(255, 255, 255, 0.35);
}
.loc {
  color: rgba(255, 255, 255, 0.92);
}

.actions {
  display: flex;
  gap: 8px;
}

.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}

.content {
  margin-top: 12px;
  white-space: pre-wrap;
  line-height: 1.5;
}

.media {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.counts {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section {
  margin-top: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 900;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.92);
}

.comment-box {
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.comments {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.pager {
  margin-top: 12px;
  padding: 10px 12px;
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
}
</style>
