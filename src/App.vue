<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">StarMuseum</div>
      <nav class="nav">
        <RouterLink to="/feed">Feed</RouterLink>
        <RouterLink to="/profile">Profile</RouterLink>
        <RouterLink to="/login" v-if="!isLoggedIn">Login</RouterLink>
        <button v-if="isLoggedIn" class="btn" @click="logout">Logout</button>
      </nav>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const isLoggedIn = computed(() => auth.isLoggedIn);

function logout() {
  auth.clear();
  router.replace({ name: "Login" });
}
</script>

<style>
.app {
  font-family: Arial, Helvetica, sans-serif;
}
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}
.brand {
  font-weight: 700;
}
.nav {
  display: flex;
  gap: 12px;
  align-items: center;
}
.btn {
  padding: 6px 10px;
  cursor: pointer;
}
.main {
  padding: 16px;
}
</style>
