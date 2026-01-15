// src/api/reports.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/**
 * 创建举报
 * POST /api/reports
 * payload:
 * - targetType: POST|COMMENT|USER|MEDIA
 * - targetId
 * - reasonCode
 * - description?
 * - evidenceMediaIds?: number[]
 */
export async function createReport(payload = {}) {
  const resp = await api.post(ENDPOINTS.REPORT_CREATE, payload);
  return resp.data;
}

/**
 * 我的举报列表（分页 + 可选 status 过滤）
 * GET /api/reports/my?page=&size=&status=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getMyReports(params = {}) {
  const { status, ...rest } = params || {};
  const p = buildPageParams(rest);
  const query = { ...p };
  if (status) query.status = status;

  const resp = await api.get(ENDPOINTS.REPORT_MY_PAGE, { params: query });
  const page = normalizePageData(resp.data);

  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}

/** 我的举报详情 */
export async function getMyReportDetail(id) {
  const resp = await api.get(ENDPOINTS.REPORT_MY_DETAIL(id));
  return resp.data;
}

/** 撤回我的举报（仅 OPEN 可撤回） */
export async function withdrawMyReport(id) {
  const resp = await api.delete(ENDPOINTS.REPORT_MY_WITHDRAW(id));
  return resp.data;
}
