// src/api/system.js
import request from "./request";
import { unwrapDeep } from "@/api/unwrap";

export async function ping() {
  const res = await request.get("/api/ping").then((r) => r.data);
  return unwrapDeep(res);
}
