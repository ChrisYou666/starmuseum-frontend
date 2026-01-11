// src/api/social.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapDeep } from "@/api/unwrap";

// 分页获取 Feed
export async function getFeedPage(params) {
  const res = await api.get(ENDPOINTS.POST_PAGE, { params }).then((r) => r.data);
  return unwrapDeep(res);
}

// 帖子详情
export async function getPostDetail(id) {
  const res = await api.get(ENDPOINTS.POST_DETAIL(id)).then((r) => r.data);
  return unwrapDeep(res);
}

// 点赞 / 取消点赞
export async function likePost(postId) {
  const res = await api.post(ENDPOINTS.POST_LIKE(postId)).then((r) => r.data);
  return unwrapDeep(res);
}

export async function unlikePost(postId) {
  const res = await api.delete(ENDPOINTS.POST_UNLIKE(postId)).then((r) => r.data);
  return unwrapDeep(res);
}
