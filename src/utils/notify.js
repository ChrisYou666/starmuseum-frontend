// src/utils/notify.js
export function notify(message, type = "error") {
  const msg = String(message || "").trim();
  if (!msg) return;

  const id = "__starmuseum_notify_container__";
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement("div");
    container.id = id;
    container.style.position = "fixed";
    container.style.top = "12px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  const item = document.createElement("div");
  item.style.pointerEvents = "auto";
  item.style.maxWidth = "760px";
  item.style.padding = "10px 12px";
  item.style.borderRadius = "12px";
  item.style.boxShadow = "0 10px 30px rgba(0,0,0,.22)";
  item.style.fontSize = "14px";
  item.style.lineHeight = "1.4";
  item.style.border = "1px solid rgba(255,255,255,.14)";
  item.style.background = "rgba(255,255,255,.10)";
  item.style.color = "rgba(255,255,255,.92)";
  item.style.backdropFilter = "blur(10px)";
  item.style.webkitBackdropFilter = "blur(10px)";

  const prefix = type === "success" ? "✅ " : type === "warn" ? "⚠️ " : "❌ ";
  item.textContent = prefix + msg;

  container.appendChild(item);

  window.setTimeout(() => {
    try {
      container.removeChild(item);
    } catch (_) {}
  }, 3200);
}
