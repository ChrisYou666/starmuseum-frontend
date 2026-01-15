<template>
  <div class="container">
    <div class="head">
      <div>
        <h1>Profile</h1>
        <div class="help">个人资料 / 头像 / 隐私设置</div>
      </div>

      <!-- ✅ 这里改成按钮组：刷新 + 我的举报 + 我的拉黑 -->
      <div class="headOps">
        <button class="btn" :disabled="loading" @click="reload">
          {{ loading ? "加载中..." : "刷新" }}
        </button>
        <button class="btn" @click="goMyReports">我的举报</button>
        <button class="btn" @click="goMyBlocks">我的拉黑</button>
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="ok" class="alert ok">{{ ok }}</div>

    <div class="grid">
      <!-- 基本信息 -->
      <div class="card box">
        <div class="secTitle">基本信息</div>

        <div class="avatarRow">
          <div class="avatar">
            <img v-if="form.avatarUrl" :src="form.avatarUrl" />
            <div v-else class="ph">★</div>
          </div>

          <div class="avatarOps">
            <input type="file" accept="image/*" @change="onPickAvatar" />
            <button class="btn" :disabled="avatarSaving || !pickedAvatar" @click="saveAvatar">
              {{ avatarSaving ? "上传中..." : "上传头像" }}
            </button>
            <div class="help">
              头像上传流程：先上传 media（type=AVATAR）→ 再调用 /api/iam/me/avatar（JSON）
            </div>
          </div>
        </div>

        <div class="field">
          <div class="label">昵称</div>
          <input class="input" v-model.trim="form.nickname" placeholder="你的昵称" />
        </div>

        <div class="field">
          <div class="label">邮箱</div>
          <input class="input" v-model="form.email" disabled />
        </div>

        <div class="actions">
          <button class="btn primary" :disabled="saving" @click="saveProfile">
            {{ saving ? "保存中..." : "保存资料" }}
          </button>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div class="card box">
        <div class="secTitle">隐私设置</div>

        <div class="field">
          <div class="label">默认发帖可见性（后端字段：postVisibilityDefault）</div>
          <select class="input" v-model="privacy.postVisibilityDefault">
            <option value="PUBLIC">PUBLIC</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
        </div>

        <div class="field">
          <div class="label">允许他人查看我的主页</div>
          <select class="input" v-model="privacy.allowViewProfile">
            <option :value="true">允许</option>
            <option :value="false">不允许</option>
          </select>
        </div>

        <div class="actions">
          <button class="btn primary" :disabled="privacySaving" @click="savePrivacy">
            {{ privacySaving ? "保存中..." : "保存隐私设置" }}
          </button>
        </div>

        <div class="help">
          如果后端隐私 DTO 还有其他必填字段，Network 响应会提示；把响应贴我即可继续对齐。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router"; // ✅ 新增
import { useAuthStore } from "@/stores/auth";
import { getMe, updateAvatar, updatePrivacy, updateProfile } from "@/api/me";
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

const auth = useAuthStore();
const router = useRouter(); // ✅ 新增

const loading = ref(false);
const saving = ref(false);
const privacySaving = ref(false);
const avatarSaving = ref(false);

const error = ref("");
const ok = ref("");

const pickedAvatar = ref(null);

const form = reactive({
  id: null,
  email: "",
  nickname: "",
  avatarUrl: "",
});

const privacy = reactive({
  // ✅ 对齐后端：postVisibilityDefault 必填
  postVisibilityDefault: "PUBLIC",
  // 这个字段后端是否必填不确定，但一般会有
  allowViewProfile: true,
});

function setOk(msg) {
  ok.value = msg;
  setTimeout(() => (ok.value = ""), 1200);
}

function setError(msg) {
  error.value = msg;
  setTimeout(() => (error.value = ""), 2500);
}

function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
  return res;
}

/** ✅ 新增：入口跳转 */
function goMyReports() {
  router.push("/me/reports");
}
function goMyBlocks() {
  router.push("/me/blocks");
}

async function reload() {
  loading.value = true;
  try {
    const me = await getMe();

    form.id = me.id ?? me.userId ?? null;
    form.email = me.email ?? "";
    form.nickname = me.nickname ?? "";
    form.avatarUrl = me.avatarUrl ?? "";

    if (me.privacy) {
      privacy.postVisibilityDefault =
        me.privacy.postVisibilityDefault ?? me.privacy.defaultVisibility ?? privacy.postVisibilityDefault;

      privacy.allowViewProfile =
        me.privacy.allowViewProfile ?? me.privacy.profileVisible ?? privacy.allowViewProfile;
    }

    auth.setCurrentUser(me);
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "加载 Profile 失败");
  } finally {
    loading.value = false;
  }
}

function onPickAvatar(e) {
  const f = (e.target.files || [])[0];
  if (!f) return;
  pickedAvatar.value = f;
  e.target.value = "";
}

function parseUploadResp(resp) {
  if (Array.isArray(resp)) {
    const first = resp[0];
    if (typeof first === "object") {
      return { id: first.id, url: first.originUrl || first.url || first.mediumUrl || first.thumbUrl || "" };
    }
    return { id: first, url: "" };
  }
  if (resp?.ids && Array.isArray(resp.ids) && resp.ids.length) {
    return { id: resp.ids[0], url: "" };
  }
  if (resp?.records && Array.isArray(resp.records) && resp.records.length) {
    const first = resp.records[0];
    return { id: first?.id, url: first?.originUrl || first?.url || "" };
  }
  return { id: null, url: "" };
}

async function uploadAvatarMedia(file) {
  const fd = new FormData();
  fd.append("files", file);
  fd.append("file", file);
  fd.append("type", "AVATAR");

  const url = `${ENDPOINTS.MEDIA_UPLOAD_BATCH}?type=AVATAR`;

  const res = await api
    .post(url, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

  return unwrap(res);
}

async function saveAvatar() {
  if (!pickedAvatar.value) return;

  avatarSaving.value = true;
  try {
    const uploadResp = await uploadAvatarMedia(pickedAvatar.value);
    const { id: mediaId, url } = parseUploadResp(uploadResp);

    if (!mediaId) throw new Error("媒体上传成功但没有返回 mediaId");

    await updateAvatar({
      avatarMediaId: mediaId,
      mediaId: mediaId,
      avatarUrl: url,
      url: url,
    });

    pickedAvatar.value = null;
    await reload();
    setOk("头像已更新");
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "上传头像失败");
  } finally {
    avatarSaving.value = false;
  }
}

async function saveProfile() {
  saving.value = true;
  try {
    await updateProfile({ nickname: form.nickname });
    await reload();
    setOk("资料已保存");
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "保存资料失败");
  } finally {
    saving.value = false;
  }
}

async function savePrivacy() {
  privacySaving.value = true;
  try {
    await updatePrivacy({
      postVisibilityDefault: privacy.postVisibilityDefault,
      defaultVisibility: privacy.postVisibilityDefault,

      allowViewProfile: privacy.allowViewProfile,
      profileVisible: privacy.allowViewProfile,
      allowProfileView: privacy.allowViewProfile,
    });

    setOk("隐私设置已保存");
  } catch (e) {
    setError(e?.response?.data?.message || e?.message || "保存隐私设置失败");
  } finally {
    privacySaving.value = false;
  }
}

onMounted(reload);
</script>

<style scoped>
.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 12px 0;
}

h1 {
  margin: 0;
  font-size: 34px;
}

/* ✅ 新增：按钮组样式 */
.headOps {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.box {
  padding: 14px;
  border-radius: 18px;
}

.secTitle {
  font-weight: 900;
  margin-bottom: 12px;
}

.field {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.avatarRow {
  display: flex;
  gap: 12px;
  align-items: center;
}

.avatar {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.2);
  display: grid;
  place-items: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ph {
  font-weight: 900;
  font-size: 22px;
  opacity: 0.9;
}

.avatarOps {
  display: grid;
  gap: 8px;
}
</style>
