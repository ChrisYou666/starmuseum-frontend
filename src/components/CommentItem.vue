<template>
  <div class="item">
    <div class="avatar">
      <img v-if="c.avatarUrl" :src="c.avatarUrl" />
      <div v-else class="ph">{{ initials }}</div>
    </div>

    <div class="main">
      <div class="row">
        <div class="name">{{ c.nickname || ("User#" + c.userId) }}</div>
        <div class="time">{{ timeText }}</div>

        <button
          v-if="canDelete"
          class="btn danger"
          @click.stop="emit('delete')"
          title="删除评论"
        >
          删除
        </button>
      </div>

      <div class="content">{{ c.content }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  c: { type: Object, required: true },
  myUserId: { type: [Number, String], default: null },
});

const emit = defineEmits(["delete"]);

const canDelete = computed(() => {
  if (!props.myUserId) return false;
  return String(props.c.userId) === String(props.myUserId);
});

const initials = computed(() => {
  const n = props.c.nickname || "";
  return n ? n.slice(0, 1).toUpperCase() : "★";
});

const timeText = computed(() => {
  const t = props.c.createdAt || props.c.created_at;
  if (!t) return "";
  return String(t).replace("T", " ").slice(0, 19);
});
</script>

<style scoped>
.item {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(0,0,0,0.16);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.20);
  display: grid;
  place-items: center;
  flex: 0 0 auto;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph { font-weight: 800; opacity: 0.9; }

.main { flex: 1; min-width: 0; }
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.name { font-weight: 800; }
.time { font-size: 12px; color: rgba(255,255,255,0.6); }
.content {
  margin-top: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
}

.btn.danger {
  margin-left: auto;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgba(255,77,109,0.12);
  border-color: rgba(255,77,109,0.35);
}
</style>
