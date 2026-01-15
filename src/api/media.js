// src/api/media.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { MEDIA_BIZ_TYPE } from "@/constants/enums";

/**
 * 单文件上传（阶段3推荐）
 * POST /api/media/upload
 * multipart/form-data:
 *   - file: File
 *   - bizType: POST / REPORT_EVIDENCE / AVATAR ...
 *
 * 返回：MediaUploadResponse（已在 axios 层 unwrapDeep 过）
 */
export async function uploadMedia(file, options = {}) {
  if (!file) throw new Error("uploadMedia: file is required");

  const bizType = options.bizType || MEDIA_BIZ_TYPE.POST;

  const form = new FormData();
  form.append("file", file);
  // 后端如果 bizType 是可选，这里仍传，确保阶段3证据图链路能跑
  form.append("bizType", bizType);

  const resp = await api.post(ENDPOINTS.MEDIA_UPLOAD, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

/**
 * 批量上传（兼容旧实现）
 * POST /api/media/upload/batch
 * multipart/form-data:
 *   - files: File[]
 *   - bizType: POST / REPORT_EVIDENCE / AVATAR ...
 *
 * 返回：数组（或包含 list 的对象，取决于后端）
 */
export async function uploadBatchMedia(files = [], options = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("uploadBatchMedia: files is empty");
  }
  const bizType = options.bizType || MEDIA_BIZ_TYPE.POST;

  const form = new FormData();
  // 后端常见字段名：files / fileList；这里用 files
  files.forEach((f) => form.append("files", f));
  form.append("bizType", bizType);

  const resp = await api.post(ENDPOINTS.MEDIA_UPLOAD_BATCH, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // 兼容后端可能返回 {records:[]} / {list:[]} / [] 等
  const data = resp.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.list)) return data.list;
  if (Array.isArray(data.items)) return data.items;
  return data;
}

/** 头像上传（内部约定 bizType=AVATAR） */
export async function uploadAvatar(file) {
  return uploadMedia(file, { bizType: MEDIA_BIZ_TYPE.AVATAR });
}

/** 举报证据图上传（内部约定 bizType=REPORT_EVIDENCE） */
export async function uploadReportEvidence(file) {
  return uploadMedia(file, { bizType: MEDIA_BIZ_TYPE.REPORT_EVIDENCE });
}
