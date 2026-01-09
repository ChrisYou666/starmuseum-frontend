<template>
  <div v-if="urls.length" class="grid" :class="'c' + cols">
    <div
      v-for="(u, idx) in urls"
      :key="idx"
      class="cell"
      @click.stop="emit('preview', idx)"
      title="点击预览"
    >
      <img :src="u" alt="" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  urls: { type: Array, default: () => [] },
});

const emit = defineEmits(["preview"]);

const cols = computed(() => {
  const n = props.urls.length;
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 3;
});
</script>

<style scoped>
.grid {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}
.grid.c1 { grid-template-columns: 1fr; }
.grid.c2 { grid-template-columns: 1fr 1fr; }
.grid.c3 { grid-template-columns: 1fr 1fr 1fr; }

.cell {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(0,0,0,0.25);
  cursor: pointer;
}
.cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 1 / 1;
}
.grid.c1 .cell img { aspect-ratio: 16 / 9; }
</style>
