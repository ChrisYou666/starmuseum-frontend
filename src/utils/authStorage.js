const STORAGE_KEY = "starmuseum_auth";

export function readAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: "", refreshToken: "", currentUser: null };
    const obj = JSON.parse(raw);
    return {
      accessToken: obj.accessToken || "",
      refreshToken: obj.refreshToken || "",
      currentUser: obj.currentUser || null,
    };
  } catch (e) {
    return { accessToken: "", refreshToken: "", currentUser: null };
  }
}

export function writeAuth(patch) {
  const cur = readAuth();
  const next = { ...cur, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearAuth() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ accessToken: "", refreshToken: "", currentUser: null })
  );
}
