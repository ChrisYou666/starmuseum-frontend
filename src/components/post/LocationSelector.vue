<!-- src/components/post/LocationSelector.vue -->
<template>
  <div class="box sm-card">
    <div class="head">
      <div class="title">
        <div class="label">位置隐私</div>
        <div class="hint sm-muted sm-small">
          后端会按作者策略 + 观看者规则裁剪展示；前端以 visibility 为准渲染。
        </div>
      </div>
    </div>

    <div class="form">
      <div class="field">
        <div class="k sm-muted sm-small">可见级别</div>
        <select class="sm-select" v-model="local.locationVisibility" @change="emitOut">
          <option value="HIDDEN">HIDDEN（不显示）</option>
          <option value="CITY">CITY（城市）</option>
          <option value="FUZZY">FUZZY（模糊）</option>
          <option value="EXACT">EXACT（精确）</option>
        </select>
      </div>

      <div
        class="field"
        v-if="local.locationVisibility === 'CITY' || local.locationVisibility === 'FUZZY' || local.locationVisibility === 'EXACT'"
      >
        <div class="k sm-muted sm-small">城市名（可选）</div>
        <input class="sm-input" v-model="local.cityName" placeholder="例如：上海 / Jakarta" @input="emitOut" />
      </div>

      <div class="row" v-if="local.locationVisibility === 'FUZZY' || local.locationVisibility === 'EXACT'">
        <div class="field">
          <div class="k sm-muted sm-small">纬度 lat</div>
          <input class="sm-input" v-model="local.lat" placeholder="例如：31.2304" @input="emitOut" />
        </div>
        <div class="field">
          <div class="k sm-muted sm-small">经度 lon</div>
          <input class="sm-input" v-model="local.lon" placeholder="例如：121.4737" @input="emitOut" />
        </div>
      </div>

      <div class="tips" v-if="local.locationVisibility === 'EXACT'">
        <div class="tip sm-muted sm-small">提示：EXACT 可能默认仅自己可见（取决于后端策略）。</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";
import { LOCATION_VISIBILITY } from "@/constants/enums";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      locationVisibility: LOCATION_VISIBILITY.HIDDEN,
      cityName: "",
      lat: "",
      lon: "",
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const local = reactive({
  locationVisibility: LOCATION_VISIBILITY.HIDDEN,
  cityName: "",
  lat: "",
  lon: "",
});

watch(
  () => props.modelValue,
  (v) => {
    local.locationVisibility = v?.locationVisibility || LOCATION_VISIBILITY.HIDDEN;
    local.cityName = v?.cityName ?? "";
    local.lat = v?.lat ?? "";
    local.lon = v?.lon ?? "";
  },
  { immediate: true, deep: true }
);

function emitOut() {
  emit("update:modelValue", {
    locationVisibility: local.locationVisibility,
    cityName: local.cityName,
    lat: local.lat,
    lon: local.lon,
  });
}
</script>

<style scoped>
.box {
  padding: 12px;
}

.title .label {
  font-weight: 800;
  font-size: 14px;
}

.form {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
}

.tip {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
}
</style>
