// src/api/deviceProfiles.js
import api from "@/api/request";

const BASE = "/api/astro/device-profiles";

export async function getMyDeviceProfiles(params = {}) {
  const resp = await api.get(BASE, { params });
  return resp.data;
}

export async function getDeviceProfileDetail(id) {
  const resp = await api.get(`${BASE}/${id}`);
  return resp.data;
}

export async function createDeviceProfile(payload) {
  const resp = await api.post(BASE, payload);
  return resp.data;
}

export async function updateDeviceProfile(id, payload) {
  const resp = await api.put(`${BASE}/${id}`, payload);
  return resp.data;
}

export async function deleteDeviceProfile(id) {
  const resp = await api.delete(`${BASE}/${id}`);
  return resp.data;
}

export async function getDefaultDeviceProfile(type) {
  const resp = await api.get(`${BASE}/default`, { params: { type } });
  return resp.data;
}

export async function setDefaultDeviceProfile(id) {
  const resp = await api.post(`${BASE}/${id}/default`);
  return resp.data;
}
