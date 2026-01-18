<!-- src/App.vue -->
<template>
  <div class="app">
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-inner container">
        <div class="brand" @click="goHome">StarMuseum</div>

        <div class="nav">
          <RouterLink class="nav-link" to="/feed">Feed</RouterLink>
          <RouterLink class="nav-link" to="/astro/sky">Astro</RouterLink>

          <!-- setting 下拉 -->
          <div class="dropdown" @keydown.esc="closeStage5">
            <button
              class="nav-link"
              type="button"
              @click="toggleStage5"
              :aria-expanded="stage5Open ? 'true' : 'false'"
            >
              setting
              <span class="caret">▼</span>
            </button>

            <!-- ✅ 关键：这里不再 @click="closeStage5"，避免打断 RouterLink -->
            <div v-if="stage5Open" class="menu">
              <RouterLink class="menu-item" to="/profile" @click="closeStage5">
                Profile
              </RouterLink>
              <RouterLink class="menu-item" to="/astro/device-profiles" @click="closeStage5">
                设备配置
              </RouterLink>
              <RouterLink class="menu-item" to="/astro/fov" @click="closeStage5">
                FOV 视场
              </RouterLink>
              <RouterLink class="menu-item" to="/observation/logs" @click="closeStage5">
                观测日志
              </RouterLink>
              <RouterLink class="menu-item" to="/stats" @click="closeStage5">
                统计
              </RouterLink>
            </div>
          </div>

          <button class="nav-link" type="button" @click="logout">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const stage5Open = ref(false);
const isLoggedIn = computed(() => !!auth?.isLoggedIn);

function goHome() {
  router.push({ path: isLoggedIn.value ? "/feed" : "/login" });
}

function toggleStage5() {
  stage5Open.value = !stage5Open.value;
}

function closeStage5() {
  stage5Open.value = false;
}

function onDocClick(e) {
  // 点击 dropdown 外部 → 关闭下拉
  const el = e.target;
  const dropdown = document.querySelector(".dropdown");
  if (!dropdown) return;
  if (dropdown.contains(el)) return;
  stage5Open.value = false;
}

async function logout() {
  try {
    if (typeof auth.logout === "function") await auth.logout();
    else if (typeof auth.clearAuth === "function") auth.clearAuth();
  } finally {
    stage5Open.value = false;
    router.push({ name: "Login" });
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});
</script>

<style scoped>
.app {
  min-height: 100vh;
}

.container {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  backdrop-filter: blur(10px);
  background: rgba(10, 12, 18, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 58px;
}

.brand {
  font-weight: 900;
  letter-spacing: 0.3px;
  user-select: none;
  cursor: pointer;
}

.nav {
  display: inline-flex;
  align-items: center;
  gap: 14px;
}

.nav-link {
  appearance: none;
  -webkit-appearance: none;

  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  padding: 6px 2px !important;
  margin: 0 !important;

  color: rgba(255, 255, 255, 0.88);
  font: inherit;
  line-height: 1;
  cursor: pointer;
  text-decoration: none;

  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.98);
  text-decoration: underline;
}

.nav-link:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.28);
  outline-offset: 4px;
  border-radius: 10px;
}

.dropdown {
  position: relative;
}

.caret {
  font-size: 12px;
  opacity: 0.85;
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 180px;
  padding: 10px;
  border-radius: 14px;

  background: rgba(18, 22, 32, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.menu-item {
  display: block;
  padding: 10px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.88);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.98);
}

.main {
  padding-top: 6px;
}
</style>
