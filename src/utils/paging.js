// src/utils/paging.js
// 统一分页参数与分页返回解析
//
// 约定：
// - 请求入参统一：page / size（1-based page）
// - 后端返回常见为 MyBatis-Plus Page：{ records, total, current, size, pages }
// - 也兼容常见变体：{ list, total } / { items, total }

export function buildPageParams(input = {}) {
  const page =
    Number(input.page ?? input.current ?? input.pageNo ?? input.page_num ?? 1) || 1;
  const size =
    Number(input.size ?? input.pageSize ?? input.limit ?? input.page_size ?? 10) || 10;

  return {
    page: page < 1 ? 1 : page,
    size: size < 1 ? 10 : size,
  };
}

export function normalizePageData(raw = {}) {
  const records = raw?.records ?? raw?.list ?? raw?.items ?? raw?.rows ?? [];
  const total =
    typeof raw?.total === "number"
      ? raw.total
      : typeof raw?.count === "number"
        ? raw.count
        : Array.isArray(records)
          ? records.length
          : 0;

  const current =
    typeof raw?.current === "number"
      ? raw.current
      : typeof raw?.page === "number"
        ? raw.page
        : undefined;

  const size =
    typeof raw?.size === "number"
      ? raw.size
      : typeof raw?.pageSize === "number"
        ? raw.pageSize
        : undefined;

  return {
    records: Array.isArray(records) ? records : [],
    total: Number.isFinite(total) ? total : 0,
    current,
    size,
    raw,
  };
}
