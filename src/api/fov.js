// src/api/fov.js
import api from "@/api/request";

/**
 * FOV 计算
 * POST /api/astro/fov/calc
 * body: { profileId }
 *
 * 返回（示例字段）：
 * - type: PHOTO | VISUAL
 * - horizontalDeg / verticalDeg / diagonalDeg / tfovDeg
 * - frameWidthDeg / frameHeightDeg
 * - magnification (VISUAL)
 */
export async function calcFovByProfileId(profileId) {
  if (!profileId) throw new Error("profileId 不能为空");

  const resp = await api.post("/api/astro/fov/calc", { profileId });

  // 兼容你项目“可能双层 data”的历史情况：
  // - unwrap 后可能是 { data: {...} }
  // - 也可能直接就是 {...}
  return resp?.data ?? resp;
}
