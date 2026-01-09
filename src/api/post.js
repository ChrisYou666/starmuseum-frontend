import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
  return res;
}

export async function createPost(payload) {
  const res = await api.post(ENDPOINTS.POST_CREATE, payload).then((r) => r.data);
  return unwrap(res);
}
