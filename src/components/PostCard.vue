<template>
  <div class="cardWrap card" @click="emit('open')">
    <div class="top">
      <div class="avatar">
        <img v-if="post.avatarUrl" :src="post.avatarUrl" />
        <div v-else class="ph">{{ initials }}</div>
      </div>

      <div class="meta">
        <div class="name">{{ post.nickname || ("User#" + post.userId) }}</div>
        <div class="time">{{ timeText }}</div>
      </div>

      <div class="right">
        <span class="badge">{{ post.visibility || "PUBLIC" }}</span>
      </div>
    </div>

    <div class="content" v-if="post.content">{{ post.content }}</div>

    <ImageGrid :urls="mediaUrls" />

    <div class="actions" @click.stop>
      <button class="btn" @click="onToggleLike">
        {{ liked ? "❤️ 已赞" : "🤍 点赞" }} · {{ likeCount }}
      </button>

      <button class="btn ghost" @click="emit('open')">
        💬 评论 · {{ post.commentCount ?? 0 }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import ImageGrid from "@/components/ImageGrid.vue";

const props = defineProps({
  post: { type: Object, required: true },
});

const emit = defineEmits(["open", "like", "unlike"]);

const liked = ref(!!props.post.liked);
const likeCount = ref(props.post.likeCount ?? 0);

watch(
  () => props.post,
  (p) => {
    liked.value = !!p.liked;
    likeCount.value = p.likeCount ?? 0;
  },
  { deep: true }
);

const initials = computed(() => {
  const n = props.post.nickname || "";
  return n ? n.slice(0, 1).toUpperCase() : "★";
});

const timeText = computed(() => {
  const t = props.post.createdAt || props.post.created_at;
  if (!t) return "";
  return String(t).replace("T", " ").slice(0, 19);
});

const mediaUrls = computed(() => {
  const list = props.post.mediaList || props.post.media || [];
  // 兼容：后端可能返回 thumbUrl/mediumUrl/url
  return (list || [])
    .map((m) => m.thumbUrl || m.url || m.mediumUrl)
    .filter(Boolean)
    .slice(0, 9);
});

async function onToggleLike() {
  if (liked.value) {
    liked.value = false;
    likeCount.value = Math.max(0, likeCount.value - 1);
    emit("unlike");
  } else {
    liked.value = true;
    likeCount.value += 1;
    emit("like");
  }
}
</script>

<style scoped>
.cardWrap {
  padding: 14px;
  border-radius: 18px;
}
.top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.20);
  display: grid;
  place-items: center;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph { font-weight: 800; opacity: 0.9; }

.meta { flex: 1; min-width: 0; }
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

.content {
  margin-top: 10px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.btn.ghost {
  background: rgba(255,255,255,0.04);
}
</style>
