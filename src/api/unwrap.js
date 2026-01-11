// src/api/unwrap.js
// 作用：统一递归解包后端响应（外层 ApiResponseAdvice + 内层 Result）
//      并识别 Spring 默认错误体（如 {status:403,error:"Forbidden"...}）。

export class ApiError extends Error {
  constructor(message, { status = null, data = null } = {}) {
    super(message);
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

  // 关键：避免误伤业务对象（业务对象也可能有 code 字段，但不会同时有 data/message/timestamp 这种结构）
  const hasMessage = "message" in obj;
  const hasTimestamp = "timestamp" in obj;
  return hasMessage || hasTimestamp;
}

// 识别 Spring 默认错误体（可能被 advice 包装进 data 里）
function isSpringErrorBody(obj) {
  if (!isPlainObject(obj)) return false;
  return typeof obj.status === "number" && obj.status >= 400 && ("error" in obj || "path" in obj);
}

/**
 * 递归解包：
 * - 输入通常是后端响应体（r.data）
 * - 如果是 {code,message,data}，则取 data
 * - 若 data 里还是 {code,message,data}，继续取
 * - 最终返回真正业务对象
 */
export function unwrapDeep(input) {
  let obj = input;
  let guard = 0;

  while (isWrapper(obj) && guard < 10) {
    obj = obj.data;
    guard += 1;
  }

  if (isSpringErrorBody(obj)) {
    const msg = `SpringError(status=${obj.status}, error=${obj.error || ""}, path=${obj.path || ""})`;
    throw new ApiError(msg, { status: obj.status, data: obj });
  }

  return obj;
}
