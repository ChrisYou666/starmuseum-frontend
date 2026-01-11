<!-- src/components/astro/SkySummaryTable.vue -->
<template>
  <div class="wrap">
    <div class="meta">当前显示：{{ items?.length || 0 }} 条（点击一行查看详情）</div>

    <table class="tbl">
      <thead>
      <tr>
        <th style="width: 60px;">#</th>
        <th>名称</th>
        <th style="width: 90px;">mag</th>
        <th style="width: 110px;">alt(°)</th>
        <th style="width: 110px;">az(°)</th>
        <th style="width: 90px;">visible</th>
      </tr>
      </thead>

      <tbody>
      <tr
        v-for="(row, idx) in items"
        :key="row.id ?? idx"
        :class="{ selected: String(row.id) === String(selectedId) }"
        @click="onRowClick(row)"
      >
        <td>{{ idx + 1 }}</td>

        <td>
          <div class="name">{{ row.name }}</div>
          <div class="code">{{ row.catalogCode || "-" }}</div>
        </td>

        <td>{{ fmt(row.mag) }}</td>
        <td>{{ fmt(row.altitudeDeg) }}</td>
        <td>{{ fmt(row.azimuthDeg) }}</td>

        <td>
            <span class="pill" :class="row.visible ? 'yes' : 'no'">
              {{ row.visible ? "YES" : "NO" }}
            </span>
        </td>
      </tr>

      <tr v-if="!items || items.length === 0">
        <td colspan="6" class="empty">暂无数据</td>
      </tr>
      </tbody>
    </table>

    <div class="meta">当前显示：{{ items?.length || 0 }} 条（点击一行查看详情）</div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  selectedId: { type: [Number, String, null], default: null },
});

const emit = defineEmits(["select"]);

function onRowClick(row) {
  // ✅企业级底线：永远发 row.id（后端 summary 返回的是 id）
  const id = row?.id;
  console.log("[SkySummaryTable] click row=", row, "emit id=", id);
  emit("select", id);
}

function fmt(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(3);
}
</script>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta {
  opacity: 0.75;
  font-size: 12px;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.10);
}

.tbl th,
.tbl td {
  padding: 10px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  text-align: left;
  vertical-align: middle;
}

.tbl thead th {
  font-size: 12px;
  opacity: 0.8;
}

.tbl tbody tr {
  cursor: pointer;
}

.tbl tbody tr:hover {
  background: rgba(255,255,255,0.04);
}

.selected {
  outline: 2px solid rgba(120, 200, 255, 0.35);
  background: rgba(120, 200, 255, 0.06);
}

.name {
  font-weight: 700;
}

.code {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 3px;
}

.pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 12px;
}
.yes { opacity: 0.95; }
.no { opacity: 0.95; }

.empty {
  text-align: center;
  opacity: 0.7;
  padding: 18px 0;
}
</style>
