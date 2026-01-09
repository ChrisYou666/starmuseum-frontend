<template>
  <div style="padding: 16px">
    <h2>StarMuseum Frontend</h2>
    <div>Ping result: <b>{{ pingText }}</b></div>
    <div v-if="err" style="margin-top: 8px">Error: {{ err }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ping } from "../api/system";

const pingText = ref("loading...");
const err = ref("");

onMounted(async () => {
  try {
    const data = await ping();
    pingText.value = data;
  } catch (e) {
    err.value = e?.message || String(e);
    pingText.value = "failed";
  }
});
</script>
