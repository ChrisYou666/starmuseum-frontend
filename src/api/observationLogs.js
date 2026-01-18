// src/api/observationLogs.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

// 观测日志 API（request.js 已统一 unwrap，这里直接返回 data）

export function listObservationLogs(params = {}) {
  return api.get(ENDPOINTS.OBS_LOG_PAGE, { params });
}

export function getObservationLogDetail(id) {
  return api.get(ENDPOINTS.OBS_LOG_DETAIL(id));
}

export function createObservationLog(payload) {
  return api.post(ENDPOINTS.OBS_LOG_CREATE, payload);
}

export function updateObservationLog(id, payload) {
  return api.put(ENDPOINTS.OBS_LOG_UPDATE(id), payload);
}

export function deleteObservationLog(id) {
  return api.delete(ENDPOINTS.OBS_LOG_DELETE(id));
}

export function publishObservationLog(id) {
  return api.post(ENDPOINTS.OBS_LOG_PUBLISH(id));
}
