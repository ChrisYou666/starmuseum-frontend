<template>
  <div class="box">
    <div class="row">
      <div class="field">
        <div class="label">time (ISO)</div>
        <input class="input" v-model="localTime" placeholder="2026-01-10T12:00:00Z" />
        <div class="hint">必须是 ISO 格式（推荐结尾带 Z）</div>
      </div>

      <div class="field small">
        <div class="label">lat</div>
        <input class="input" v-model="localLat" placeholder="31.2304" />
        <div class="hint" v-if="latError">{{ latError }}</div>
      </div>

      <div class="field small">
        <div class="label">lon</div>
        <input class="input" v-model="localLon" placeholder="121.4737" />
        <div class="hint" v-if="lonError">{{ lonError }}</div>
      </div>
    </div>

    <div class="row">
      <label class="switch">
        <input type="checkbox" v-model="localVisibleOnly" />
        <span>visibleOnly</span>
      </label>

      <div class="field tiny">
        <div class="label">sort</div>
        <select class="input" v-model="localSort">
          <option value="alt">alt</option>
          <option value="mag">mag</option>
        </select>
      </div>

      <div class="field tiny">
        <div class="label">limit</div>
        <input class="input" v-model="localLimit" placeholder="50" />
      </div>

      <button class="btn" :disabled="hasError || loading" @click="onSubmit">
        {{ loading ? "加载中..." : "刷新" }}
      </button>

      <button class="btn secondary" :disabled="loading" @click="setNow">
        time=now
      </button>

      <div class="error" v-if="submitError">{{ submitError }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  time: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  visibleOnly: { type: Boolean, default: true },
  sort: { type: String, default: "alt" },
  limit: { type: Number, default: 50 },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "update:time", "update:lat", "update:lon", "update:visibleOnly", "update:sort", "update:limit"]);

const localTime = ref(props.time);
const localLat = ref(String(props.lat));
const localLon = ref(String(props.lon));
const localVisibleOnly = ref(props.visibleOnly);
const localSort = ref(props.sort);
const localLimit = ref(String(props.limit));

watch(
  () => props.time,
  (v) => (localTime.value = v)
);
watch(
  () => props.lat,
  (v) => (localLat.value = String(v))
);
watch(
  () => props.lon,
  (v) => (localLon.value = String(v))
);

const submitError = ref("");

const latNum = computed(() => Number(localLat.value));
const lonNum = computed(() => Number(localLon.value));
const limitNum = computed(() => Number(localLimit.value));

const latError = computed(() => {
  if (Number.isNaN(latNum.value)) return "lat 必须是数字";
  if (latNum.value < -90 || latNum.value > 90) return "lat 范围 -90 ~ 90";
  return "";
});
const lonError = computed(() => {
  if (Number.isNaN(lonNum.value)) return "lon 必须是数字";
  if (lonNum.value < -180 || lonNum.value > 180) return "lon 范围 -180 ~ 180";
  return "";
});
const limitError = computed(() => {
  if (Number.isNaN(limitNum.value)) return "limit 必须是数字";
  if (limitNum.value < 1 || limitNum.value > 100) return "limit 范围 1 ~ 100";
  return "";
});

const hasError = computed(() => !!latError.value || !!lonError.value || !!limitError.value);

function setNow() {
  localTime.value = new Date().toISOString();
}

function onSubmit() {
  submitError.value = "";
  if (hasError.value) {
    submitError.value = "参数有误，请修正后再刷新";
    return;
  }

  // 更新父组件绑定值
  emit("update:time", localTime.value);
  emit("update:lat", latNum.value);
  emit("update:lon", lonNum.value);
  emit("update:visibleOnly", localVisibleOnly.value);
  emit("update:sort", localSort.value);
  emit("update:limit", limitNum.value);

  // 通知父组件执行加载
  emit("submit");
}
</script>

<style scoped>
.box {
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 14px;
  background: rgba(0,0,0,0.15);
}
.row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.field {
  flex: 1;
  min-width: 260px;
}
.field.small { min-width: 160px; flex: 0 0 160px; }
.field.tiny { min-width: 120px; flex: 0 0 120px; }

.label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.06);
  color: #fff;
  outline: none;
}
.hint {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 6px;
}
.btn {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  color: #fff;
  cursor: pointer;
}
.btn.secondary {
  background: rgba(255,255,255,0.03);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.switch {
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.18);
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255,255,255,0.03);
}
.error {
  color: #ffb4b4;
  font-size: 12px;
  padding-bottom: 4px;
}
</style>
