// src/api/post.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapDeep } from "@/api/unwrap";

export async function createPost(payload) {
  const res = await api.post(ENDPOINTS.POST_CREATE, payload).then((r) => r.data);
  return unwrapDeep(res);
}
