<!-- src/components/common/EmptyState.vue -->
<template>
  <div class="wrap">
    <div class="card sm-card">
      <div class="icon">{{ icon }}</div>
      <div class="title">{{ title }}</div>
      <div class="desc sm-muted">{{ description }}</div>
      <div class="ops" v-if="$slots.default">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: "🛰️" },
  title: { type: String, default: "内容不可见或已删除" },
  description: {
    type: String,
    default: "可能是作者设置了隐私、你已拉黑/被拉黑、或内容已被删除/屏蔽。",
  },
});
</script>

<style scoped>
.wrap {
  margin: 14px 0;
  display: flex;
  justify-content: center;
}
.card {
  width: 100%;
  max-width: 720px;
  padding: 18px;
  text-align: center;
}
.icon {
  font-size: 34px;
}
.title {
  margin-top: 8px;
  font-weight: 900;
  font-size: 16px;
}
.desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.5;
}
.ops {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
