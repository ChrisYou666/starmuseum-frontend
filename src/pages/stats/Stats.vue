<!-- src/pages/stats/Stats.vue -->
<template>
  <div class="container page">
    <div class="head">
      <div>
        <h1>统计</h1>
        <div class="sm-muted sm-small">阶段5-F0 占位页：后续在 F5 对接我的统计与热门目标榜</div>
      </div>
    </div>

    <div class="sm-card box">
      <div class="sm-muted">本页将展示：月度统计、区间统计、TopTargets、热门目标榜。</div>
      <ul class="list sm-muted">
        <li>GET /api/stats/me/month</li>
        <li>POST /api/stats/me/range</li>
        <li>POST /api/stats/hot/targets</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
// F0 占位
</script>

<style scoped>
.page { padding: 18px 0 40px 0; }
.head { padding: 18px 0 12px 0; }
h1 { margin: 0; font-size: 28px; }
.box { padding: 14px; }
.list { margin: 10px 0 0 18px; }
</style>
