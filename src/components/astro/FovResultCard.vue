<template>
  <div class="sm-card card">
    <div class="head">
      <div>
        <div class="title">FOV 计算结果</div>
        <div class="sm-muted sm-small">
          type: <b>{{ result?.type || "-" }}</b>
        </div>
      </div>

      <div class="ops">
        <button class="sm-btn" :disabled="!result" @click="copyJson">复制 JSON</button>
        <button class="sm-btn" :disabled="!result" @click="copySummary">复制摘要</button>
      </div>
    </div>

    <div v-if="!result" class="sm-muted" style="padding: 12px 0">暂无结果</div>

    <div v-else class="grid">
      <!-- PHOTO -->
      <template v-if="isPhoto">
        <div class="item">
          <div class="k">horizontalDeg</div>
          <div class="v">{{ fmt(result.horizontalDeg) }}°</div>
        </div>
        <div class="item">
          <div class="k">verticalDeg</div>
          <div class="v">{{ fmt(result.verticalDeg) }}°</div>
        </div>
        <div class="item">
          <div class="k">diagonalDeg</div>
          <div class="v">{{ fmt(result.diagonalDeg) }}°</div>
        </div>
        <div class="item">
          <div class="k">tfovDeg</div>
          <div class="v">{{ fmt(result.tfovDeg) }}°</div>
        </div>

        <div class="item">
          <div class="k">frameWidthDeg</div>
          <div class="v">{{ fmt(result.frameWidthDeg) }}°</div>
        </div>
        <div class="item">
          <div class="k">frameHeightDeg</div>
          <div class="v">{{ fmt(result.frameHeightDeg) }}°</div>
        </div>
      </template>

      <!-- VISUAL -->
      <template v-else>
        <div class="item">
          <div class="k">magnification</div>
          <div class="v">{{ fmt(result.magnification) }}</div>
        </div>
        <div class="item">
          <div class="k">tfovDeg</div>
          <div class="v">{{ fmt(result.tfovDeg) }}°</div>
        </div>
      </template>
    </div>

    <div v-if="result" class="hint sm-muted sm-small">
      提示：你可以把 horizontal/vertical/diagonal/tfov 当作“角度结果”，frameWidth/Height 当作“画框角宽高”。
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { notify } from "@/utils/notify";

const props = defineProps({
  result: { type: Object, default: null },
});

const isPhoto = computed(() => String(props.result?.type || "").toUpperCase() === "PHOTO");

function fmt(v) {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  // 显示 4 位小数，方便你对比在线计算器 <1% 误差
  return n.toFixed(4);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify("已复制到剪贴板", "success");
  } catch (e) {
    // 兼容某些浏览器安全策略
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      notify("已复制到剪贴板", "success");
    } catch (_) {
      notify("复制失败，请手动复制");
    }
  }
}

function copyJson() {
  if (!props.result) return;
  copyText(JSON.stringify(props.result, null, 2));
}

function copySummary() {
  if (!props.result) return;

  const r = props.result;
  const type = String(r.type || "-").toUpperCase();

  if (type === "PHOTO") {
    const s = `PHOTO FOV: H=${fmt(r.horizontalDeg)}° V=${fmt(r.verticalDeg)}° D=${fmt(r.diagonalDeg)}° TFOV=${fmt(r.tfovDeg)}° | Frame=${fmt(r.frameWidthDeg)}°×${fmt(r.frameHeightDeg)}°`;
    copyText(s);
    return;
  }

  const s2 = `VISUAL FOV: Mag=${fmt(r.magnification)} TFOV=${fmt(r.tfovDeg)}°`;
  copyText(s2);
}
</script>

<style scoped>
.card {
  padding: 14px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 900;
}

.ops {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.item {
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
}

.k {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.v {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.hint {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.10);
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
