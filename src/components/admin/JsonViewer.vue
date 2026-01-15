<!-- src/components/admin/JsonViewer.vue -->
<template>
  <div class="wrap sm-card">
    <div class="head">
      <div class="title">{{ title }}</div>
      <div class="ops">
        <button class="sm-btn mini" @click="toggle">
          {{ open ? "收起" : "展开" }}
        </button>
        <button class="sm-btn mini" @click="copy" :disabled="!text">
          复制
        </button>
      </div>
    </div>

    <div v-if="!text" class="sm-muted sm-small" style="margin-top:8px;">
      无内容
    </div>

    <pre v-else-if="open" class="json">{{ pretty }}</pre>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { notify } from "@/utils/notify";

const props = defineProps({
  title: { type: String, default: "detail_json" },
  value: { type: [Object, Array, String, Number, Boolean, null], default: null },
  defaultOpen: { type: Boolean, default: false },
});

const open = ref(!!props.defaultOpen);

const text = computed(() => {
  if (props.value === null || props.value === undefined) return "";
  if (typeof props.value === "string") return props.value;
  try {
    return JSON.stringify(props.value);
  } catch (_) {
    return String(props.value);
  }
});

const pretty = computed(() => {
  if (!text.value) return "";
  if (typeof props.value === "string") {
    // 尝试把 string 当成 JSON 美化
    const s = text.value.trim();
    try {
      const obj = JSON.parse(s);
      return JSON.stringify(obj, null, 2);
    } catch (_) {
      return s;
    }
  }
  try {
    return JSON.stringify(props.value, null, 2);
  } catch (_) {
    return String(props.value);
  }
});

function toggle() {
  open.value = !open.value;
}

async function copy() {
  try {
    await navigator.clipboard.writeText(pretty.value || "");
    notify("已复制", "success");
  } catch (_) {
    notify("复制失败");
  }
}
</script>

<style scoped>
.wrap {
  padding: 12px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.title {
  font-weight: 900;
  font-size: 14px;
}
.ops {
  display: flex;
  gap: 8px;
}
.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}
.json {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
  overflow: auto;
  max-height: 420px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
