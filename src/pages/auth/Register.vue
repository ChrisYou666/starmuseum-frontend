<template>
  <AuthShell>
    <div class="head">
      <h2>注册</h2>
      <div class="help">创建账号，开始记录你的观测</div>
    </div>

    <form class="form" @submit.prevent="onSubmit">
      <div class="field">
        <div class="label">邮箱</div>
        <input class="input" v-model.trim="email" type="email" placeholder="you@example.com" />
      </div>

      <div class="field">
        <div class="label">昵称</div>
        <input class="input" v-model.trim="nickname" type="text" placeholder="给自己起个名字" />
      </div>

      <div class="field">
        <div class="label">密码</div>
        <input class="input" v-model="password" type="password" placeholder="8~64 位" />
        <div class="help">密码长度必须在 8~64 位之间</div>
      </div>

      <div class="field">
        <div class="label">确认密码</div>
        <input class="input" v-model="confirmPassword" type="password" placeholder="再次输入密码" />
      </div>

      <div class="row">
        <button class="btn primary" :disabled="loading">
          {{ loading ? "提交中..." : "注册" }}
        </button>
        <RouterLink class="help" to="/login">已有账号？去登录</RouterLink>
      </div>

      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="ok" class="alert ok">{{ ok }}</div>
    </form>
  </AuthShell>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import AuthShell from "@/components/AuthShell.vue";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const nickname = ref("");
const password = ref("");
const confirmPassword = ref("");

const loading = ref(false);
const error = ref("");
const ok = ref("");

function validate() {
  if (!email.value) return "请填写邮箱";
  if (!nickname.value) return "请填写昵称";
  if (!password.value) return "请填写密码";
  if (password.value.length < 8 || password.value.length > 64) return "密码长度必须在 8~64 位之间";
  if (password.value !== confirmPassword.value) return "两次密码不一致";
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
    await auth.register({
      email: email.value,
      nickname: nickname.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    });
    ok.value = "注册成功，请登录";
    setTimeout(() => router.replace({ name: "Login" }), 500);
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || "注册失败（请看控制台 Network 响应）";
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
