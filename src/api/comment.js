import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
  return res;
}

export async function getCommentPage(postId, params) {
  const res = await api.get(ENDPOINTS.COMMENT_PAGE(postId), { params }).then((r) => r.data);
  return unwrap(res);
}

export async function createComment(postId, payload) {
  const res = await api.post(ENDPOINTS.COMMENT_CREATE(postId), payload).then((r) => r.data);
  return unwrap(res);
}

export async function deleteComment(commentId) {
  const res = await api.delete(ENDPOINTS.COMMENT_DELETE(commentId)).then((r) => r.data);
  return unwrap(res);
}
