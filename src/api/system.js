import request from "./request";

export function ping() {
  return request.get("/api/ping");
}
