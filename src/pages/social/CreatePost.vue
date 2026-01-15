<!-- src/pages/social/CreatePost.vue -->
<template>
  <div class="container">
    <div class="topbar">
      <button class="sm-btn" @click="back">返回</button>
      <div class="title">发帖</div>
      <div style="width: 64px;"></div>
    </div>

    <div class="card sm-card">
      <div class="field">
        <div class="k sm-muted sm-small">可见性</div>
        <select class="sm-select" v-model="visibility">
          <option value="PUBLIC">PUBLIC</option>
          <option value="PRIVATE">PRIVATE</option>
          <option value="FOLLOWERS" disabled>FOLLOWERS（预留）</option>
        </select>
      </div>

      <div class="field">
        <div class="k sm-muted sm-small">内容</div>
        <textarea
          class="sm-textarea"
          v-model="content"
          placeholder="写点什么..."
          maxlength="2000"
        ></textarea>
        <div class="sm-muted sm-small" style="margin-top:6px;">{{ content.length }}/2000</div>
      </div>

      <LocationSelector v-model="locationForm" />

      <MediaUploader
        v-model="mediaList"
        :max="9"
        title="图片（最多 9 张）"
        :bizType="MEDIA_BIZ_TYPE.POST"
      />

      <div v-if="error" class="sm-error">{{ error }}</div>

      <div class="ops">
        <button class="sm-btn primary" :disabled="submitting" @click="submit">
          {{ submitting ? "提交中..." : "发布" }}
        </button>
        <button class="sm-btn" :disabled="submitting" @click="resetForm">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { createPost } from "@/api/post";
import MediaUploader from "@/components/media/MediaUploader.vue";
import LocationSelector from "@/components/post/LocationSelector.vue";
import { MEDIA_BIZ_TYPE, LOCATION_VISIBILITY } from "@/constants/enums";
import { notify } from "@/utils/notify";

const router = useRouter();

const visibility = ref("PUBLIC");
const content = ref("");
const submitting = ref(false);
const error = ref("");

const mediaList = ref([]);
const mediaIds = computed(() => mediaList.value.map((m) => m.id).filter(Boolean));

const locationForm = reactive({
  locationVisibility: LOCATION_VISIBILITY.HIDDEN,
  cityName: "",
  lat: "",
  lon: "",
});

function back() {
  router.push({ name: "Feed" });
}

function resetForm() {
  visibility.value = "PUBLIC";
  content.value = "";
  mediaList.value = [];
  locationForm.locationVisibility = LOCATION_VISIBILITY.HIDDEN;
  locationForm.cityName = "";
  locationForm.lat = "";
  locationForm.lon = "";
  error.value = "";
}

function parseNum(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function validateLocation() {
  const vis = locationForm.locationVisibility;

  const lat = parseNum(locationForm.lat);
  const lon = parseNum(locationForm.lon);

  const hasLat = lat !== null;
  const hasLon = lon !== null;

  if (hasLat !== hasLon) {
    return { ok: false, msg: "lat/lon 必须成对填写" };
  }

  if ((vis === "FUZZY" || vis === "EXACT") && (!hasLat || !hasLon)) {
    return { ok: false, msg: "FUZZY/EXACT 必须填写 lat/lon" };
  }

  if (hasLat && (lat < -90 || lat > 90)) return { ok: false, msg: "纬度 lat 必须在 [-90, 90]" };
  if (hasLon && (lon < -180 || lon > 180)) return { ok: false, msg: "经度 lon 必须在 [-180, 180]" };

  return { ok: true, lat, lon };
}

async function submit() {
  error.value = "";

  if (!content.value.trim() && mediaIds.value.length === 0) {
    error.value = "内容或图片至少填写一项";
    return;
  }

  const locCheck = validateLocation();
  if (!locCheck.ok) {
    error.value = locCheck.msg;
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      content: content.value,
      visibility: visibility.value,
      mediaIds: mediaIds.value,

      locationVisibility: locationForm.locationVisibility,
      cityName: locationForm.cityName ? String(locationForm.cityName).trim() : undefined,
      lat: locCheck.lat ?? undefined,
      lon: locCheck.lon ?? undefined,
    };

    await createPost(payload);
    notify("发布成功", "success");
    router.push({ name: "Feed" });
  } catch (e) {
    error.value = e?.message || "发布失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 880px;
  margin: 0 auto;
  padding: 18px 14px 40px 14px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 12px 0;
}

.title {
  font-size: 16px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.92);
}

.card {
  padding: 14px;
  display: grid;
  gap: 14px;
}

.ops {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
