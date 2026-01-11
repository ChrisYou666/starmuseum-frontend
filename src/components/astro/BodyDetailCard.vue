<template>
  <div class="box">
    <div class="head">
      <div class="title">Body Detail</div>
      <div class="sub" v-if="detail">
        id={{ detail.id }} · {{ detail.catalogCode }} · {{ detail.bodyType }}
      </div>
    </div>

    <div v-if="loading" class="hint">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="!detail" class="hint">
      请选择左侧列表中的一颗星（点击一行）
    </div>

    <div v-else class="grid">
      <div class="kv">
        <div class="k">名称</div>
        <div class="v">{{ detail.nameZh || detail.nameEn || detail.nameId || detail.name }}</div>
      </div>

      <div class="kv">
        <div class="k">mag</div>
        <div class="v">{{ fmt(detail.mag) }}</div>
      </div>

      <div class="kv">
        <div class="k">RA / Dec</div>
        <div class="v">{{ fmt(detail.raDeg) }} / {{ fmt(detail.decDeg) }}</div>
      </div>

      <div class="kv">
        <div class="k">alt / az</div>
        <div class="v">{{ fmt(detail.altitudeDeg) }} / {{ fmt(detail.azimuthDeg) }}</div>
      </div>

      <div class="kv">
        <div class="k">visible</div>
        <div class="v">
          <span :class="detail.visible ? 'tag ok' : 'tag off'">
            {{ detail.visible ? "YES" : "NO" }}
          </span>
        </div>
      </div>

      <div class="kv" v-if="detail.constellation">
        <div class="k">星座</div>
        <div class="v">{{ detail.constellation }}</div>
      </div>

      <div class="kv" v-if="detail.spectralType">
        <div class="k">光谱型</div>
        <div class="v">{{ detail.spectralType }}</div>
      </div>

      <div class="kv" v-if="detail.wikiUrl">
        <div class="k">Wiki</div>
        <div class="v">
          <a class="link" :href="detail.wikiUrl" target="_blank" rel="noreferrer">
            打开
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  detail: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

function fmt(v) {
  if (v === null || v === undefined) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(3);
}
</script>

<style scoped>
.box {
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 12px;
  padding: 12px;
  background: rgba(0,0,0,0.12);
}
.head {
  margin-bottom: 10px;
}
.title {
  font-weight: 800;
}
.sub {
  opacity: 0.7;
  font-size: 12px;
  margin-top: 4px;
}
.hint {
  opacity: 0.8;
  font-size: 12px;
  padding: 8px 0;
}
.error {
  color: #ffb4b4;
  font-size: 12px;
  padding: 8px 0;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.kv {
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 10px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
}
.k {
  font-size: 12px;
  opacity: 0.7;
}
.v {
  margin-top: 6px;
  font-weight: 700;
}
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgba(255,255,255,0.18);
}
.tag.ok { opacity: 0.95; }
.tag.off { opacity: 0.55; }
.link {
  color: #cbd5ff;
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
</style>
