// src/api/audit.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { buildPageParams, normalizePageData } from "@/utils/paging";

/**
 * 管理员：审计日志查询（分页 + 筛选）
 * GET /api/admin/audit?page=&size=&operatorUserId=&action=&from=&to=
 *
 * 返回统一形态：
 * { records, total, current, size, raw }
 */
export async function getAdminAudit(params = {}) {
  const { operatorUserId, action, from, to, ...rest } = params || {};
  const p = buildPageParams(rest);

  const query = { ...p };
  if (operatorUserId) query.operatorUserId = operatorUserId;
  if (action) query.action = action;
  if (from) query.from = from;
  if (to) query.to = to;

  const resp = await api.get(ENDPOINTS.ADMIN_AUDIT_PAGE, { params: query });
  const page = normalizePageData(resp.data);

  return {
    records: page.records,
    total: page.total,
    current: page.current ?? p.page,
    size: page.size ?? p.size,
    raw: page.raw,
  };
}
