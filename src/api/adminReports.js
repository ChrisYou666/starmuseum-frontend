// src/api/adminReports.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/**
 * 管理员：举报列表（分页 + 筛选）
 * GET /api/admin/reports?page=&size=&status=&targetType=&reasonCode=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getAdminReports(params = {}) {
  const { status, targetType, reasonCode, ...rest } = params || {};
  const p = buildPageParams(rest);

  const query = { ...p };
  if (status) query.status = status;
  if (targetType) query.targetType = targetType;
  if (reasonCode) query.reasonCode = reasonCode;

  const resp = await api.get(ENDPOINTS.ADMIN_REPORT_PAGE, { params: query });
  const page = normalizePageData(resp.data);

  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}

/** 管理员：举报详情 */
export async function getAdminReportDetail(id) {
  const resp = await api.get(ENDPOINTS.ADMIN_REPORT_DETAIL(id));
  return resp.data;
}

/** 管理员：开始处理（可选接口） */
export async function startAdminReport(id) {
  const resp = await api.post(ENDPOINTS.ADMIN_REPORT_START(id));
  return resp.data;
}

/**
 * 管理员：提交审核结论
 * POST /api/admin/reports/{id}/review
 * payload:
 * - decision: REJECT | RESOLVE
 * - notes?
 * - actions?（若后端实现了处罚联动）
 */
export async function reviewAdminReport(id, payload = {}) {
  const resp = await api.post(ENDPOINTS.ADMIN_REPORT_REVIEW(id), payload);
  return resp.data;
}
