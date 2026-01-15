// src/api/admin.js
// 管理员端 API（阶段D 极简）

import request from "@/api/request";

/**
 * 管理员 - 举报列表（分页 + 筛选）
 * params: { page, size, status, targetType, reasonCode, q }
 */
export function adminGetReports(params = {}) {
  return request.get("/api/admin/reports", { params });
}

/**
 * 管理员 - 举报详情
 */
export function adminGetReportDetail(id) {
  return request.get(`/api/admin/reports/${id}`);
}

/**
 * 管理员 - 开始处理（start/review）
 */
export function adminStartReview(id) {
  return request.post(`/api/admin/reports/${id}/start`);
}

/**
 * 管理员 - 认定（resolved）
 * payload: { action?: "RESOLVE"|"REJECT", notes?: string }
 */
export function adminResolveReport(id, payload = {}) {
  return request.post(`/api/admin/reports/${id}/resolve`, payload);
}

/**
 * 管理员 - 驳回（rejected）
 * payload: { notes?: string }
 */
export function adminRejectReport(id, payload = {}) {
  return request.post(`/api/admin/reports/${id}/reject`, payload);
}

/**
 * 管理员 - 更新 notes（可选：如果后端支持）
 */
export function adminUpdateReportNotes(id, payload = {}) {
  return request.put(`/api/admin/reports/${id}/notes`, payload);
}

/**
 * 管理员 - 审计日志查询（分页）
 * params: { page, size, action, actorId, q, from, to }
 */
export function adminGetAuditLogs(params = {}) {
  return request.get("/api/admin/audit-logs", { params });
}
