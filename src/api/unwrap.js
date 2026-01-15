// src/api/unwrap.js
// 作用：统一递归解包后端响应（外层 ApiResponseAdvice + 内层 Result）
//      并识别 Spring 默认错误体（如 {status:403,error:"Forbidden",message:"...",path:"..."}）。
//
// 约定：
// - 成功：{ code: 0, message: "success", data: ... }
// - 失败：{ code: 非0, message: "原因", data: null/{} }
// - 有些接口可能出现“双层包装”（外层 advice + 内层 Result），这里会递归解包。

export class ApiError extends Error {
  constructor(message, { status = null, data = null } = {}) {
    super(message || "ApiError");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

// 识别“统一包装对象”：必须同时具备 code + data，并且通常还有 message/timestamp
function isWrapper(obj) {
  if (!isPlainObject(obj)) return false;
  if (!("code" in obj) || !("data" in obj)) return false;

  // 避免误伤业务对象：业务对象不太可能同时具备 message/timestamp
  const hasMessage = "message" in obj || "msg" in obj;
  const hasTimestamp = "timestamp" in obj;
  return hasMessage || hasTimestamp;
}

// 识别 Spring 默认错误体（可能被 advice 包装进 data 里）
function isSpringErrorBody(obj) {
  if (!isPlainObject(obj)) return false;
  return typeof obj.status === "number" && obj.status >= 400 && ("error" in obj || "path" in obj);
}

function isCodeOk(code) {
  return code === 0 || code === "0" || code === true || code === "success";
}

/**
 * 提取可展示的错误消息（用于 axios 拦截器/页面 toast）
 * 注意：这里不抛错，只负责“尽可能拿到 message”。
 */
export function extractErrorMessage(input) {
  if (!input) return "";
  if (typeof input === "string") return input;

  if (isPlainObject(input)) {
    // Result / Advice wrapper
    if (typeof input.message === "string" && input.message.trim()) return input.message.trim();
    if (typeof input.msg === "string" && input.msg.trim()) return input.msg.trim();

    // Spring 默认错误体
    if (typeof input.error === "string" && input.error.trim()) {
      const status = typeof input.status === "number" ? input.status : "";
      const path = typeof input.path === "string" ? ` @ ${input.path}` : "";
      const base = status ? `HTTP ${status} ${input.error}` : input.error;
      const m = typeof input.message === "string" && input.message.trim() ? ` - ${input.message.trim()}` : "";
      return `${base}${m}${path}`.trim();
    }

    if (typeof input.status === "number") return `HTTP ${input.status}`;
  }

  return "";
}

/**
 * 递归解包：
 * - 输入通常是后端响应体（axios resp.data）
 * - 如果是 {code,message,data}，则：
 *   - code==0 → 取 data
 *   - code!=0 → 抛 ApiError(message)
 * - 若 data 里还是 {code,message,data}，继续处理
 * - 最终返回真正业务对象
 */
export function unwrapDeep(input) {
  let obj = input;
  let guard = 0;

  while (isWrapper(obj) && guard < 10) {
    const code = obj.code;
    if (!isCodeOk(code)) {
      const msg =
        (typeof obj.message === "string" && obj.message) ||
        (typeof obj.msg === "string" && obj.msg) ||
        `Request failed (code=${String(code)})`;
      throw new ApiError(msg, { status: obj.status ?? null, data: obj });
    }

    obj = obj.data;
    guard += 1;
  }

  if (isSpringErrorBody(obj)) {
    const msg =
      (typeof obj.message === "string" && obj.message.trim()) ||
      `SpringError(status=${obj.status}, error=${obj.error || ""}, path=${obj.path || ""})`;
    throw new ApiError(msg, { status: obj.status, data: obj });
  }

  return obj;
}
