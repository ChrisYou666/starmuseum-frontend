<!-- src/components/admin/ReportFilters.vue -->
<template>
  <div class="filters sm-card">
    <div class="row">
      <div class="field">
        <div class="k sm-muted sm-small">状态</div>
        <select class="sm-select" v-model="local.status" @change="emitOut">
          <option value="">全部</option>
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="field">
        <div class="k sm-muted sm-small">目标类型</div>
        <select class="sm-select" v-model="local.targetType" @change="emitOut">
          <option value="">全部</option>
          <option v-for="t in targetTypeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div class="field">
        <div class="k sm-muted sm-small">原因</div>
        <select class="sm-select" v-model="local.reasonCode" @change="emitOut">
          <option value="">全部</option>
          <option v-for="r in reasonOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>

    <div class="row2">
      <div class="field grow">
        <div class="k sm-muted sm-small">关键词（ID/描述/备注等）</div>
        <input class="sm-input" v-model="local.q" placeholder="例如：spam / 123 / 用户名..." @keydown.enter="emitOut" />
      </div>

      <div class="ops">
        <button class="sm-btn" @click="emitOut">查询</button>
        <button class="sm-btn" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ status: "", targetType: "", reasonCode: "", q: "" }),
  },
  statusOptions: {
    type: Array,
    default: () => ["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED", "WITHDRAWN"],
  },
  targetTypeOptions: {
    type: Array,
    default: () => ["POST", "COMMENT", "USER", "MEDIA"],
  },
  reasonOptions: {
    type: Array,
    default: () => ["SPAM", "ABUSE", "NUDITY", "VIOLENCE", "OTHERS"],
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const local = reactive({
  status: "",
  targetType: "",
  reasonCode: "",
  q: "",
});

watch(
  () => props.modelValue,
  (v) => {
    local.status = v?.status ?? "";
    local.targetType = v?.targetType ?? "";
    local.reasonCode = v?.reasonCode ?? "";
    local.q = v?.q ?? "";
  },
  { immediate: true, deep: true }
);

function emitOut() {
  const payload = {
    status: local.status || "",
    targetType: local.targetType || "",
    reasonCode: local.reasonCode || "",
    q: (local.q || "").trim(),
  };
  emit("update:modelValue", payload);
  emit("change", payload);
}

function reset() {
  local.status = "";
  local.targetType = "";
  local.reasonCode = "";
  local.q = "";
  emitOut();
}
</script>

<style scoped>
.filters {
  padding: 12px;
  display: grid;
  gap: 10px;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
@media (max-width: 900px) {
  .row {
    grid-template-columns: 1fr;
  }
}
.row2 {
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
}
.field .k {
  margin-bottom: 6px;
}
.grow {
  flex: 1;
  min-width: 240px;
}
.ops {
  display: flex;
  gap: 10px;
}
</style>
