<template>
  <AuthShell>
    <div class="head">
      <h2>登录</h2>
      <div class="help">使用你的账号进入星空博物馆</div>
    </div>

    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <div class="label">邮箱</div>
        <input class="input" v-model.trim="email" type="email" placeholder="you@example.com" />
      </div>

      <div class="field">
        <div class="label">密码</div>
        <input class="input" v-model="password" type="password" placeholder="请输入密码" />
      </div>

      <div class="row">
        <button class="btn primary" :disabled="loading">
          {{ loading ? "登录中..." : "登录" }}
        </button>
        <RouterLink class="help" to="/register">没有账号？去注册</RouterLink>
      </div>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="ok" class="alert ok">{{ ok }}</div>
    </form>
  </AuthShell>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router";
import AuthShell from "@/components/AuthShell.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const ok = ref("");

function validate() {
  if (!email.value) return "请填写邮箱";
  if (!password.value) return "请填写密码";
  return "";
}

async function onSubmit() {
  error.value = "";
  ok.value = "";

  const msg = validate();
  if (msg) {
    error.value = msg;
    return;
  }

  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    ok.value = "登录成功";

    const redirect = route.query.redirect || "/feed";
    router.replace(String(redirect));
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "登录失败（请检查后端返回字段/控制台 Network）";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.head { margin-bottom: 14px; }
h2 { margin: 0 0 6px 0; font-size: 20px; }
.form { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
</style>
