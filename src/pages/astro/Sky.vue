<!-- src/pages/astro/Sky.vue -->
<template>
  <div class="page">
    <header class="header">
      <div class="title">Sky</div>

      <div class="controls">
        <div class="field">
          <div class="label">time (ISO)</div>
          <input v-model="astro.time" class="input" placeholder="2026-01-10T12:00:00Z" />
        </div>

        <div class="field">
          <div class="label">lat</div>
          <input v-model="astro.lat" class="input" placeholder="31.2304" />
        </div>

        <div class="field">
          <div class="label">lon</div>
          <input v-model="astro.lon" class="input" placeholder="121.4737" />
        </div>

        <button class="btn" @click="onSetNow">Now</button>
        <button class="btn" @click="onReload">Reload</button>
      </div>
    </header>

    <section class="card">
      <div class="cardTitle">
        <div>Sky Summary</div>
        <div class="status" :class="summaryStatusClass">{{ summaryStatusText }}</div>
      </div>

      <div v-if="astro.errorSummary" class="err">
        {{ astro.errorSummary }}
      </div>

      <div v-if="astro.loadingSummary" class="hint">Loading summary...</div>

      <SkySummaryTable
        v-else
        :items="astro.summaryItems"
        :selected-id="astro.selectedBodyId"
        @select="onSelectId"
      />
    </section>

    <section class="card">
      <div class="cardTitle">
        <div>Body Detail</div>
        <div class="status" :class="detailStatusClass">{{ detailStatusText }}</div>
      </div>

      <div v-if="astro.loadingDetail" class="hint">Loading detail...</div>

      <div v-else-if="astro.errorDetail" class="err">
        {{ astro.errorDetail }}
      </div>

      <div v-else-if="!astro.selectedBodyId" class="hint">
        未选择天体：点击上面的 Summary 表格任意一行查看详情
      </div>

      <div v-else-if="!astro.selectedBodyDetail" class="hint">
        已选择 id={{ astro.selectedBodyId }}，但暂无详情（请点击 Reload 或检查网络）
      </div>

      <div v-else class="detailGrid">
        <div class="kv">
          <div class="k">id</div>
          <div class="v">{{ d.id }}</div>
        </div>

        <div class="kv">
          <div class="k">name</div>
          <div class="v">{{ d.name }}</div>
        </div>

        <div class="kv">
          <div class="k">mag</div>
          <div class="v">{{ fmt(d.mag) }}</div>
        </div>

        <div class="kv">
          <div class="k">RA / Dec</div>
          <div class="v">{{ fmt(d.raDeg) }} / {{ fmt(d.decDeg) }}</div>
        </div>

        <div class="kv">
          <div class="k">alt / az</div>
          <div class="v">{{ fmt(d.altitudeDeg) }} / {{ fmt(d.azimuthDeg) }}</div>
        </div>

        <div class="kv">
          <div class="k">visible</div>
          <div class="v">
            <span v-if="d.visible === true" class="ok">YES</span>
            <span v-else class="no">NO</span>
          </div>
        </div>

        <div class="kv">
          <div class="k">type</div>
          <div class="v">{{ d.bodyType || "-" }}</div>
        </div>

        <div class="kv">
          <div class="k">catalogCode</div>
          <div class="v">{{ d.catalogCode || "-" }}</div>
        </div>

        <div class="kv">
          <div class="k">constellation</div>
          <div class="v">{{ d.constellation || "-" }}</div>
        </div>

        <div class="kv">
          <div class="k">spectralType</div>
          <div class="v">{{ d.spectralType || "-" }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useAstroStore } from "@/stores/astro";
import SkySummaryTable from "@/components/astro/SkySummaryTable.vue";

const astro = useAstroStore();

onMounted(async () => {
  astro.initDefaults();
  await astro.loadSummary();
});

async function onSetNow() {
  astro.setNow();
  await astro.reloadAll();
}

async function onReload() {
  await astro.reloadAll();
}

async function onSelectId(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) {
    astro.clearDetail();
    astro.errorDetail = `invalid selected id: ${id}`;
    return;
  }
  await astro.loadBodyDetail(n);
}

function fmt(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(3);
}

const d = computed(() => astro.selectedBodyDetail || {});

const summaryStatusText = computed(() => {
  if (astro.loadingSummary) return "LOADING";
  if (astro.errorSummary) return "ERR";
  return "OK";
});
const summaryStatusClass = computed(() => {
  if (astro.loadingSummary) return "stLoading";
  if (astro.errorSummary) return "stErr";
  return "stOk";
});

const detailStatusText = computed(() => {
  if (astro.loadingDetail) return "LOADING";
  if (astro.errorDetail) return "ERR";
  if (!astro.selectedBodyId) return "IDLE";
  return "OK";
});
const detailStatusClass = computed(() => {
  if (astro.loadingDetail) return "stLoading";
  if (astro.errorDetail) return "stErr";
  if (!astro.selectedBodyId) return "stIdle";
  return "stOk";
});
</script>

<style scoped>
.page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 18px;
  font-weight: 700;
}

.controls {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 12px;
  opacity: 0.8;
}

.input {
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.2);
  color: inherit;
  min-width: 220px;
}
.field:nth-child(2) .input,
.field:nth-child(3) .input {
  min-width: 120px;
}

.btn {
  height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(0,0,0,0.25);
  color: inherit;
  cursor: pointer;
}

.card {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 14px;
  background: rgba(0,0,0,0.20);
}

.cardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 700;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.15);
}

.stOk { opacity: 0.95; }
.stErr { opacity: 0.95; }
.stLoading { opacity: 0.95; }
.stIdle { opacity: 0.75; }

.hint {
  opacity: 0.75;
  padding: 8px 0;
}

.err {
  padding: 10px;
  border-radius: 12px;
  background: rgba(255, 0, 0, 0.10);
  border: 1px solid rgba(255, 0, 0, 0.25);
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.detailGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 10px;
}

.kv {
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 12px;
  padding: 10px;
  background: rgba(0,0,0,0.15);
}

.k {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.v {
  font-size: 14px;
  font-weight: 600;
}

.ok { opacity: 0.95; }
.no { opacity: 0.95; }
</style>
