<template>
  <div class="container">
    <div class="head">
      <div>
        <h1>Post</h1>
        <div class="help">详情 / 评论</div>
      </div>
      <button class="btn" @click="goBack">返回</button>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <div v-if="post" class="card box">
      <div class="top">
        <div class="avatar">
          <img v-if="post.avatarUrl" :src="post.avatarUrl" />
          <div v-else class="ph">★</div>
        </div>
        <div class="meta">
          <div class="name">{{ post.nickname || ("User#" + post.userId) }}</div>
          <div class="time">{{ timeText(post.createdAt) }}</div>
        </div>
        <span class="badge">{{ post.visibility || "PUBLIC" }}</span>
      </div>

      <div class="content" v-if="post.content">{{ post.content }}</div>

      <div v-if="mediaUrls.length" class="media">
        <img v-for="(u, idx) in mediaUrls" :key="idx" :src="u" />
      </div>

      <div class="actions">
        <button class="btn" :disabled="likeLoading" @click="toggleLike">
          {{ liked ? "❤️ 已赞" : "🤍 点赞" }} · {{ likeCount }}
        </button>
        <div class="help">评论：{{ post.commentCount ?? 0 }}</div>
      </div>
    </div>

    <div class="card box">
      <div class="cHead">
        <div class="cTitle">评论</div>
        <div class="help">/api/post/{postId}/comment/page</div>
      </div>

      <form class="compose" @submit.prevent="submitComment">
        <input class="input" v-model.trim="newComment" placeholder="写下你的评论..." />
        <button class="btn primary" :disabled="commentLoading || !newComment">
          {{ commentLoading ? "发送中..." : "发送" }}
        </button>
      </form>

      <div v-if="cError" class="alert error">{{ cError }}</div>

      <div class="cList">
        <CommentItem
          v-for="c in comments"
          :key="c.id"
          :c="c"
          :myUserId="myUserId"
          @delete="onDeleteComment(c)"
        />
      </div>

      <div class="pager">
        <button class="btn" :disabled="commentLoading || cPageNo <= 1" @click="prevCPage">上一页</button>
        <div class="help">第 {{ cPageNo }} 页 · 共 {{ cTotal }} 条</div>
        <button class="btn" :disabled="commentLoading || comments.length === 0" @click="nextCPage">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getPostDetail, likePost, unlikePost } from "@/api/social";
import { createComment, deleteComment, getCommentPage } from "@/api/comment";
import CommentItem from "@/components/CommentItem.vue";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const postId = computed(() => route.params.id);

const post = ref(null);
const error = ref("");
const loading = ref(false);

const liked = ref(false);
const likeCount = ref(0);
const likeLoading = ref(false);

const myUserId = computed(() => auth.currentUser?.id || auth.currentUser?.userId || null);

// 评论分页
const comments = ref([]);
const cTotal = ref(0);
const cPageNo = ref(1);
const cPageSize = ref(10);
const cError = ref("");
const commentLoading = ref(false);

const newComment = ref("");

function timeText(t) {
  if (!t) return "";
  return String(t).replace("T", " ").slice(0, 19);
}

const mediaUrls = computed(() => {
  const list = post.value?.mediaList || [];
  return (list || []).map((m) => m.url || m.mediumUrl || m.thumbUrl).filter(Boolean);
});

function normalizePageResp(resp) {
  const records = resp?.records || resp?.list || resp?.items || [];
  const total = resp?.total ?? records.length;
  return { records, total };
}

async function loadPost() {
  loading.value = true;
  error.value = "";
  try {
    const resp = await getPostDetail(postId.value);
    post.value = resp;

    liked.value = !!resp.liked;
    likeCount.value = resp.likeCount ?? 0;
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "加载帖子详情失败";
  } finally {
    loading.value = false;
  }
}

async function loadComments() {
  commentLoading.value = true;
  cError.value = "";
  try {
    const resp = await getCommentPage(postId.value, { pageNo: cPageNo.value, pageSize: cPageSize.value });
    const { records, total } = normalizePageResp(resp);
    comments.value = records || [];
    cTotal.value = total ?? 0;
  } catch (e) {
    cError.value = e?.response?.data?.message || e?.message || "加载评论失败";
  } finally {
    commentLoading.value = false;
  }
}

async function toggleLike() {
  if (!post.value) return;
  likeLoading.value = true;
  try {
    if (liked.value) {
      await unlikePost(post.value.id);
      liked.value = false;
      likeCount.value = Math.max(0, likeCount.value - 1);
    } else {
      await likePost(post.value.id);
      liked.value = true;
      likeCount.value += 1;
    }
  } catch (e) {
    // 失败则重新拉取详情对齐
    await loadPost();
  } finally {
    likeLoading.value = false;
  }
}

async function submitComment() {
  if (!newComment.value) return;
  commentLoading.value = true;
  cError.value = "";
  try {
    // 后端评论 DTO 字段名如果不是 content，这里会失败，到时候我帮你对齐
    await createComment(postId.value, { content: newComment.value });
    newComment.value = "";
    cPageNo.value = 1;
    await loadPost();     // 更新 commentCount
    await loadComments(); // 刷新评论列表
  } catch (e) {
    cError.value = e?.response?.data?.message || e?.message || "发表评论失败（请检查后端字段名）";
  } finally {
    commentLoading.value = false;
  }
}

async function onDeleteComment(c) {
  if (!c?.id) return;
  commentLoading.value = true;
  cError.value = "";
  try {
    await deleteComment(c.id);
    await loadPost();
    await loadComments();
  } catch (e) {
    cError.value = e?.response?.data?.message || e?.message || "删除评论失败";
  } finally {
    commentLoading.value = false;
  }
}

function prevCPage() {
  cPageNo.value = Math.max(1, cPageNo.value - 1);
  loadComments();
}
function nextCPage() {
  cPageNo.value = cPageNo.value + 1;
  loadComments();
}

function goBack() {
  router.back();
}

onMounted(async () => {
  await loadPost();
  await loadComments();
});
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

.box {
  padding: 14px;
  border-radius: 18px;
  margin-bottom: 12px;
}

.top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.20);
  display: grid;
  place-items: center;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph { font-weight: 800; opacity: 0.9; }

.meta { flex: 1; }
.name { font-weight: 800; }
.time { font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 2px; }
.badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
}

.content { margin-top: 10px; line-height: 1.6; white-space: pre-wrap; }

.media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}
.media img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.10);
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.cHead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 10px;
}
.cTitle { font-weight: 900; }

.compose {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.compose .input { flex: 1; }

.cList {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
</style>
