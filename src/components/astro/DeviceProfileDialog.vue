<template>
  <div v-if="open" class="mask" @click.self="close">
    <div class="dialog sm-card">
      <div class="d-head">
        <div class="title">{{ isEdit ? "编辑配置" : "新增配置" }}</div>
        <button class="sm-btn" @click="close">关闭</button>
      </div>

      <div class="d-body">
        <div class="sm-muted sm-small" style="margin-bottom: 10px">
          类型：<b>{{ type }}</b>（后端要求：PHOTO 必填 sensorWidthMm/sensorHeightMm/focalLengthMm；VISUAL 必填 telescopeFocalMm/eyepieceFocalMm/eyepieceAfovDeg）
        </div>

        <div class="form">
          <div class="field">
            <label>名称</label>
            <input class="sm-input" v-model.trim="form.name" placeholder="例如：Canon APS-C 200mm" />
          </div>

          <template v-if="type === DEVICE_PROFILE_TYPE.PHOTO">
            <div class="grid">
              <div class="field">
                <label>传感器宽 (mm)</label>
                <input class="sm-input" type="number" step="0.01" v-model.number="form.sensorWidthMm" placeholder="22.3" />
              </div>
              <div class="field">
                <label>传感器高 (mm)</label>
                <input class="sm-input" type="number" step="0.01" v-model.number="form.sensorHeightMm" placeholder="14.9" />
              </div>
              <div class="field">
                <label>焦距 (mm)</label>
                <input class="sm-input" type="number" step="0.1" v-model.number="form.focalLengthMm" placeholder="200" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="grid">
              <div class="field">
                <label>望远镜焦距 (mm)</label>
                <input class="sm-input" type="number" step="1" v-model.number="form.telescopeFocalMm" placeholder="1200" />
              </div>
              <div class="field">
                <label>目镜焦距 (mm)</label>
                <input class="sm-input" type="number" step="0.1" v-model.number="form.eyepieceFocalMm" placeholder="25" />
              </div>
              <div class="field">
                <label>目镜视场 AFOV (°)</label>
                <input class="sm-input" type="number" step="0.1" v-model.number="form.eyepieceAfovDeg" placeholder="60" />
              </div>
            </div>
          </template>

          <div class="field inline">
            <input id="setDefault" type="checkbox" v-model="form.setAsDefault" />
            <label for="setDefault" style="margin: 0">设为默认</label>
          </div>

          <div v-if="err" class="sm-error" style="margin-top: 10px">{{ err }}</div>
        </div>
      </div>

      <div class="d-foot">
        <button class="sm-btn" @click="close">取消</button>
        <button class="sm-btn primary" @click="submit">
          {{ isEdit ? "保存修改" : "创建" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";
import { DEVICE_PROFILE_TYPE } from "@/constants/enums";

const props = defineProps({
  open: { type: Boolean, default: false },
  type: { type: String, required: true },
  editing: { type: Object, default: null },
});

const emit = defineEmits(["update:open", "submit"]);

const err = ref("");

const isEdit = computed(() => !!props.editing?.id);

const form = reactive({
  name: "",
  // PHOTO
  sensorWidthMm: null,
  sensorHeightMm: null,
  focalLengthMm: null,
  // VISUAL
  telescopeFocalMm: null,
  eyepieceFocalMm: null,
  eyepieceAfovDeg: null,
  // common
  setAsDefault: false,
});

function reset() {
  err.value = "";
  form.name = "";
  form.sensorWidthMm = null;
  form.sensorHeightMm = null;
  form.focalLengthMm = null;
  form.telescopeFocalMm = null;
  form.eyepieceFocalMm = null;
  form.eyepieceAfovDeg = null;
  form.setAsDefault = false;
}

function fillFromEditing() {
  reset();
  const e = props.editing;
  if (!e) return;
  form.name = e.name ?? "";
  form.setAsDefault = !!(e.setAsDefault || e.isDefault === 1 || e.isDefault === true);

  // 兼容历史字段
  form.sensorWidthMm = e.sensorWidthMm ?? e.sensorWidth ?? null;
  form.sensorHeightMm = e.sensorHeightMm ?? e.sensorHeight ?? null;
  form.focalLengthMm = e.focalLengthMm ?? e.focalLength ?? null;

  form.telescopeFocalMm = e.telescopeFocalMm ?? null;
  form.eyepieceFocalMm = e.eyepieceFocalMm ?? null;
  form.eyepieceAfovDeg = e.eyepieceAfovDeg ?? null;
}

watch(
  () => props.open,
  (v) => {
    if (v) fillFromEditing();
    else reset();
  }
);

watch(
  () => props.editing,
  () => {
    if (props.open) fillFromEditing();
  }
);

function close() {
  emit("update:open", false);
}

function validate() {
  const name = (form.name || "").trim();
  if (!name) return "请填写配置名称";

  if (props.type === DEVICE_PROFILE_TYPE.PHOTO) {
    if (!(form.sensorWidthMm > 0)) return "PHOTO：sensorWidthMm 必须 > 0";
    if (!(form.sensorHeightMm > 0)) return "PHOTO：sensorHeightMm 必须 > 0";
    if (!(form.focalLengthMm > 0)) return "PHOTO：focalLengthMm 必须 > 0";
  } else {
    if (!(form.telescopeFocalMm > 0)) return "VISUAL：telescopeFocalMm 必须 > 0";
    if (!(form.eyepieceFocalMm > 0)) return "VISUAL：eyepieceFocalMm 必须 > 0";
    if (!(form.eyepieceAfovDeg > 0)) return "VISUAL：eyepieceAfovDeg 必须 > 0";
    if (form.eyepieceAfovDeg > 180) return "VISUAL：eyepieceAfovDeg 最大 180";
  }
  return "";
}

function submit() {
  err.value = "";
  const m = validate();
  if (m) {
    err.value = m;
    return;
  }

  // ✅ 按后端 DTO 字段名输出 payload
  const payload = {
    name: form.name.trim(),
    type: props.type,
    setAsDefault: !!form.setAsDefault,
    sensorWidthMm: props.type === DEVICE_PROFILE_TYPE.PHOTO ? Number(form.sensorWidthMm) : null,
    sensorHeightMm: props.type === DEVICE_PROFILE_TYPE.PHOTO ? Number(form.sensorHeightMm) : null,
    focalLengthMm: props.type === DEVICE_PROFILE_TYPE.PHOTO ? Number(form.focalLengthMm) : null,
    telescopeFocalMm: props.type === DEVICE_PROFILE_TYPE.VISUAL ? Number(form.telescopeFocalMm) : null,
    eyepieceFocalMm: props.type === DEVICE_PROFILE_TYPE.VISUAL ? Number(form.eyepieceFocalMm) : null,
    eyepieceAfovDeg: props.type === DEVICE_PROFILE_TYPE.VISUAL ? Number(form.eyepieceAfovDeg) : null,
  };

  emit("submit", { editing: props.editing, payload });
}
</script>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 999;
}

.dialog {
  width: min(720px, 96vw);
  padding: 14px;
  border-radius: 18px;
}

.d-head,
.d-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.d-head .title {
  font-weight: 900;
  font-size: 18px;
}

.d-body {
  margin-top: 12px;
}

.form {
  display: grid;
  gap: 12px;
}

.field label {
  display: block;
  font-size: 12px;
  opacity: 0.85;
  margin-bottom: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
