<!-- src/components/user/BlockButton.vue -->
<template>
  <button class="sm-btn mini" :disabled="loading" @click="toggle">
    {{ loading ? "处理中..." : (blocked ? "取消拉黑" : "拉黑") }}
  </button>
</template>

<script setup>
import { ref, watch } from "vue";
import { blockUser, unblockUser } from "@/api/blocks";
import { notify } from "@/utils/notify";

const props = defineProps({
  blockedUserId: { type: [Number, String], required: true },
  initialBlocked: { type: Boolean, default: false },
});

const emit = defineEmits(["update:blocked", "changed"]);

const blocked = ref(!!props.initialBlocked);
const loading = ref(false);

watch(
  () => props.initialBlocked,
  (v) => (blocked.value = !!v)
);

async function toggle() {
  if (!props.blockedUserId) return;

  loading.value = true;
  try {
    if (!blocked.value) {
      await blockUser(props.blockedUserId);
      blocked.value = true;
      notify("已拉黑该用户", "success");
    } else {
      await unblockUser(props.blockedUserId);
      blocked.value = false;
      notify("已取消拉黑", "success");
    }
    emit("update:blocked", blocked.value);
    emit("changed", blocked.value);
  } catch (e) {
    notify(e?.message || "操作失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.sm-btn.mini {
  padding: 6px 10px;
  font-size: 12px;
}
</style>
