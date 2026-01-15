<!-- src/components/PostCard.vue -->
<template>
  <div class="card sm-card" @click="goDetail">
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

      <div class="ops" @click.stop>
        <button class="sm-btn mini" v-if="!post.liked" @click="$emit('like', post)">点赞</button>
        <button class="sm-btn mini" v-else @click="$emit('unlike', post)">取消</button>
      </div>
    </div>

    <div class="content">{{ post.content }}</div>

    <div v-if="mediaUrls.length" class="media">
      <img v-for="(u, idx) in mediaUrls" :key="idx" class="img" :src="u" />
    </div>

    <div class="counts">
      <span class="sm-chip">👍 {{ post.likeCount || 0 }}</span>
      <span class="sm-chip">💬 {{ post.commentCount || 0 }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  post: { type: Object, required: true },
});

defineEmits(["like", "unlike"]);

const router = useRouter();

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23555'/%3E%3Ctext x='32' y='38' text-anchor='middle' font-size='18' fill='%23ccc'%3EUser%3C/text%3E%3C/svg%3E";

function formatTime(t) {
  if (!t) return "";
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return String(t);
  return d.toLocaleString();
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
  const loc = normalizeLocation(props.post.location);
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

const mediaUrls = computed(() => {
  const list = props.post.mediaList || props.post.media || [];
  if (!Array.isArray(list)) return [];
  return list
    .map((m) => m.mediumUrl || m.thumbUrl || m.originUrl || m.url)
    .filter(Boolean)
    .slice(0, 9);
});

function goDetail() {
  router.push({ name: "PostDetail", params: { id: props.post.id } });
}
</script>

<style scoped>
.card {
  padding: 14px;
  cursor: pointer;
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
  font-weight: 800;
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

.ops {
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
  height: 150px;
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
</style>
