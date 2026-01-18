// src/api/follow.js
import api from "@/api/request";
import { ENDPOINTS } from "@/api/endpoints";

function cleanUndefined(obj) {
  const o = { ...(obj || {}) };
  Object.keys(o).forEach((k) => {
    if (o[k] === undefined) delete o[k];
  });
  return o;
}

export async function followUser(userId) {
  const resp = await api.post(ENDPOINTS.FOLLOW(userId));
  return resp.data;
}

export async function unfollowUser(userId) {
  const resp = await api.delete(ENDPOINTS.FOLLOW(userId));
  return resp.data;
}

export async function isFollowing(userId) {
  const resp = await api.get(ENDPOINTS.FOLLOW_IS_FOLLOWING(userId));
  return resp.data;
}

export async function getMyFollowing(params = {}) {
  const resp = await api.get(ENDPOINTS.FOLLOW_MY_FOLLOWING, { params: cleanUndefined(params) });
  return resp.data;
}

export async function getMyFollowers(params = {}) {
  const resp = await api.get(ENDPOINTS.FOLLOW_MY_FOLLOWERS, { params: cleanUndefined(params) });
  return resp.data;
}
