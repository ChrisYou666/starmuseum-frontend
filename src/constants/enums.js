// src/constants/enums.js
// 阶段3前端统一枚举/常量（避免到处写字符串）

export const LOCATION_VISIBILITY = Object.freeze({
  HIDDEN: "HIDDEN",
  CITY: "CITY",
  FUZZY: "FUZZY",
  EXACT: "EXACT",
});

export const REPORT_TARGET_TYPE = Object.freeze({
  POST: "POST",
  COMMENT: "COMMENT",
  USER: "USER",
  MEDIA: "MEDIA",
});

export const REPORT_REASON_CODE = Object.freeze({
  SPAM: "SPAM",
  ABUSE: "ABUSE",
  NUDITY: "NUDITY",
  VIOLENCE: "VIOLENCE",
  OTHERS: "OTHERS",
});

export const REPORT_STATUS = Object.freeze({
  OPEN: "OPEN",
  IN_REVIEW: "IN_REVIEW",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
});

export const MEDIA_BIZ_TYPE = Object.freeze({
  POST: "POST",
  AVATAR: "AVATAR",
  REPORT_EVIDENCE: "REPORT_EVIDENCE",
});

export const ADMIN_DECISION = Object.freeze({
  REJECT: "REJECT",
  RESOLVE: "RESOLVE",
});
