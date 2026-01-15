<!-- src/pages/user/Profile.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">用户主页</div>
      <BlockButton v-if="userId" :blockedUserId="userId" />
    </div>

    <div class="card sm-card">
      <div class="sm-muted sm-small">用户ID：{{ userId }}</div>
      <div class="hint sm-muted">
        说明：阶段3最小前端不强制做完整“用户资料查询”，这里先提供拉黑入口用于验收。
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import BlockButton from "@/components/user/BlockButton.vue";

const route = useRoute();
const router = useRouter();

const userId = computed(() => route.params.id);

function back() {
  router.push({ name: "Feed" });
}
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

.card {
  padding: 14px;
}

.hint {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.5;
}
</style>
