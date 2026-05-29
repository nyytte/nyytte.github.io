// Small shared helpers used across modules.

/**
 * Create an element with attributes and children in one call.
 * Keeps rendering code readable and avoids hand-built innerHTML strings.
 *
 *   el("div", { class: "card" }, [el("span", {}, ["hi"])])
 *
 * - `html: "..."` sets innerHTML when you intentionally need markup
 *   (e.g. trusted inline SVG icons from config).
 * - children may be strings (-> text nodes) or nodes.
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Escape the five HTML-significant characters for safe text display. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Toast singleton bound to #toast. Returns a show(message) function. */
export function createToast() {
  const toastEl = document.getElementById("toast");
  let timeoutId = null;
  return function showToast(message) {
    if (!toastEl) return;
    toastEl.replaceChildren(el("span", { text: "✓" }), document.createTextNode(" " + message));
    toastEl.classList.add("show");
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => toastEl.classList.remove("show"), 3000);
  };
}

/** Copy text to clipboard, then toast. Used by the Discord buttons. */
export function copyToClipboard(text, showToast) {
  navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard!"));
}
