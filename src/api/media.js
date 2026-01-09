import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
  return res;
}

// 原有：多图上传（发帖用）
export async function uploadBatchMedia(files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));

  const res = await api
    .post(ENDPOINTS.MEDIA_UPLOAD_BATCH, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

  return unwrap(res);
}

/**
 * 新增：头像上传（必须让后端把 media.type 识别为 AVATAR）
 * 兼容两种写法：
 * 1) query: ?type=AVATAR
 * 2) form field: type=AVATAR
 */
export async function uploadAvatarMedia(file) {
  const fd = new FormData();
  fd.append("files", file);      // 兼容 batch 上传字段
  fd.append("file", file);       // 兼容 single 上传字段
  fd.append("type", "AVATAR");   // ✅ 关键：告诉后端这是头像

  const url = `${ENDPOINTS.MEDIA_UPLOAD_BATCH}?type=AVATAR`;

  const res = await api
    .post(url, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

  return unwrap(res);
}
