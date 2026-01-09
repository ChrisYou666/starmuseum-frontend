<template>
  <div class="shell">
    <div class="container">
      <div class="brand">
        <div class="logo">★</div>
        <div class="title">
          <div class="name">StarMuseum</div>
          <div class="sub">Explore the sky, share your moments</div>
        </div>
      </div>

      <div class="panel card">
        <slot />
      </div>

      <div class="footer help">
        © {{ new Date().getFullYear() }} StarMuseum · Stage 1
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 28px 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(124,92,255,0.9), rgba(34,197,94,0.55));
  box-shadow: 0 16px 40px rgba(0,0,0,0.35);
}
.name { font-weight: 800; letter-spacing: 0.2px; }
.sub { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 2px; }

.panel {
  padding: 18px;
  border-radius: 18px;
}

.footer {
  margin-top: 14px;
  text-align: center;
  opacity: 0.85;
}
</style>
