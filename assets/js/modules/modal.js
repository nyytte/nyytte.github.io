// Project / commission detail modal, laid out as labeled sections:
//   Overview · Showcase · Code · Links
// Closes on backdrop click, the X, or the Escape key.
import { el } from "./utils.js";
import { highlightLuau } from "./highlight.js";

const STREAMABLE = /streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/;

// Inline icons for the VS Code-style explorer.
const ICON_MOON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#7da6ff"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_FOLDER = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
const ICON_CHEVRON = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
const ICON_PANEL = `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/></svg>`;

// Build a tabbed body: one tab per present part (Overview / Showcase / Code /
// Links). The tab bar stays pinned; only the active panel scrolls. With a
// single part, the bar is omitted and the panel shows on its own.
function buildTabs(tabs) {
  const panels = tabs.map((t, i) =>
    el("div", { class: "modal-panel" + (i === 0 ? " active" : "") }, [].concat(t.content))
  );
  const panelWrap = el("div", { class: "modal-panels" }, panels);

  if (tabs.length <= 1) return [panelWrap];

  const btns = tabs.map((t, i) => {
    const b = el("button", {
      class: "modal-tab" + (i === 0 ? " active" : ""),
      type: "button",
      text: t.label
    });
    if (t.count != null) b.appendChild(el("span", { class: "modal-tab-count", text: String(t.count) }));
    b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.remove("active"));
      panels.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      panels[i].classList.add("active");
      panelWrap.scrollTop = 0;
    });
    return b;
  });
  return [el("div", { class: "modal-tabs", role: "tablist" }, btns), panelWrap];
}

// Group flat file list into a nested tree using "/" in names.
function buildFileTree(files) {
  const root = { dirs: new Map(), files: [] };
  for (const file of files) {
    const parts = file.name.split("/");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node.dirs.has(parts[i])) node.dirs.set(parts[i], { dirs: new Map(), files: [] });
      node = node.dirs.get(parts[i]);
    }
    node.files.push({ file, base: parts[parts.length - 1] });
  }
  return root;
}

// A VS Code-style window: file-tree sidebar (collapsible folders + a
// hideable panel) on the left, highlighted code on the right.
function buildCodeBlock(files) {
  const codeEl = el("code", { html: '<span class="cm">-- loading…</span>' });
  const pre = el("pre", {}, [codeEl]);
  const pathLabel = el("span", { class: "code-path", text: files[0].name });

  const cache = new Map();
  let activeRow = null;
  let currentKey = null;

  // Load a file's source — from an inline `code` string or by fetching its
  // `path`. Cached after first load; guards against out-of-order responses.
  async function loadCode(file) {
    const key = file.path || file.name;
    currentKey = key;
    if (cache.has(key)) {
      codeEl.innerHTML = cache.get(key);
      return;
    }
    if (file.code != null) {
      const html = highlightLuau(file.code);
      cache.set(key, html);
      if (currentKey === key) codeEl.innerHTML = html;
      return;
    }
    codeEl.innerHTML = '<span class="cm">-- loading…</span>';
    try {
      const res = await fetch(file.path, { cache: "no-cache" });
      if (!res.ok) throw new Error(String(res.status));
      const html = highlightLuau(await res.text());
      cache.set(key, html);
      if (currentKey === key) codeEl.innerHTML = html;
    } catch {
      if (currentKey === key) codeEl.textContent = `-- could not load ${file.path || file.name}`;
    }
  }

  function openFile(file, row) {
    pathLabel.textContent = file.name;
    if (activeRow) activeRow.classList.remove("active");
    row.classList.add("active");
    activeRow = row;
    pre.scrollTop = 0;
    loadCode(file);
  }

  let defaultRow = null;
  function renderNode(node, depth) {
    const rows = [];
    for (const [dirName, child] of node.dirs) {
      const childWrap = el("div", { class: "tree-children" }, renderNode(child, depth + 1));
      const folderRow = el("div", {
        class: "tree-row tree-folder open",
        style: `padding-left:${depth * 14 + 8}px`
      }, [
        el("span", { class: "tree-chevron", html: ICON_CHEVRON }),
        el("span", { class: "tree-icon", html: ICON_FOLDER }),
        el("span", { class: "tree-name", text: dirName })
      ]);
      folderRow.addEventListener("click", () => {
        const collapsed = childWrap.classList.toggle("collapsed");
        folderRow.classList.toggle("open", !collapsed);
      });
      rows.push(folderRow, childWrap);
    }
    for (const { file, base } of node.files) {
      const row = el("div", {
        class: "tree-row tree-file",
        style: `padding-left:${depth * 14 + 24}px`
      }, [
        el("span", { class: "tree-icon", html: ICON_MOON }),
        el("span", { class: "tree-name", text: base })
      ]);
      row.addEventListener("click", () => openFile(file, row));
      if (file === files[0]) defaultRow = row;
      rows.push(row);
    }
    return rows;
  }

  const sidebar = el("div", { class: "code-sidebar" }, [
    el("div", { class: "code-sidebar-title", text: "Explorer" }),
    el("div", { class: "code-tree" }, renderNode(buildFileTree(files), 0))
  ]);

  const ide = el("div", { class: "code-ide" }, [sidebar, el("div", { class: "code-main" }, [pre])]);

  const collapseBtn = el("button", {
    class: "code-collapse",
    type: "button",
    "aria-label": "Toggle file tree",
    html: ICON_PANEL
  });
  collapseBtn.addEventListener("click", () => ide.classList.toggle("sidebar-hidden"));

  if (defaultRow) {
    openFile(files[0], defaultRow);
  }

  return el("div", { class: "code-showcase" }, [
    el("div", { class: "code-showcase-head" }, [
      collapseBtn,
      el("div", { class: "code-dots" }, [
        el("span", { class: "code-dot" }),
        el("span", { class: "code-dot" }),
        el("span", { class: "code-dot" })
      ]),
      pathLabel
    ]),
    ide
  ]);
}

// Accept either files: [{name, code}] or the legacy code/codeFile pair.
function codeFiles(item) {
  if (Array.isArray(item.files) && item.files.length) return item.files;
  if (item.code) return [{ name: item.codeFile || "snippet.luau", code: item.code }];
  return null;
}

function buildEmbed(videoId, link) {
  return el("div", { class: "modal-embed-wrapper" }, [
    el("div", { class: "modal-embed-label", text: `${link.icon || "🎬"} ${link.text}` }),
    el("div", { class: "modal-embed-container" }, [
      el("iframe", {
        src: `https://streamable.com/e/${videoId}?`,
        title: link.text,
        allow: "fullscreen",
        allowfullscreen: "",
        frameborder: "0"
      })
    ])
  ]);
}

function buildLinkButton(link) {
  return el("a", {
    href: link.url,
    target: "_blank",
    rel: "noopener",
    class: "modal-link-btn ripple-btn",
    text: `${link.icon || ""} ${link.text}`.trim()
  });
}

export function createModal() {
  const backdrop = document.getElementById("project-modal");
  const closeBtn = document.getElementById("modal-close");
  if (!backdrop) return { open() {} };

  const sections = document.getElementById("modal-sections");
  let lastFocused = null;

  function close() {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
    sections.replaceChildren(); // clears embeds -> stops video/audio
    if (lastFocused) lastFocused.focus();
  }

  function open(item) {
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-desc").textContent = item.description || "";

    document.getElementById("modal-tags").replaceChildren(
      ...(item.tags || []).map((t) => el("span", { class: `tag ${t.class}`, text: t.name }))
    );

    // Split links into video showcases and plain link buttons. Keep raw embed
    // data so we can render the first clip both as an Overview teaser and in
    // the full Showcase tab (separate iframe instances).
    const embedData = [];
    const buttons = [];
    for (const link of item.links || []) {
      const match = link.url.match(STREAMABLE);
      if (match) embedData.push({ id: match[1], link });
      else buttons.push(buildLinkButton(link));
    }

    const files = codeFiles(item);
    const tabs = [];
    if (item.details) {
      const overview = item.details.split("\n").map((line) => el("p", { text: line }));
      // Featured teaser: the first clip sits under the description.
      if (embedData.length) {
        overview.push(
          el("div", { class: "modal-featured-video" }, [
            buildEmbed(embedData[0].id, embedData[0].link)
          ])
        );
      }
      tabs.push({ id: "overview", label: "Overview", content: overview });
    }
    if (embedData.length) {
      tabs.push({
        id: "showcase",
        label: "Showcase",
        count: embedData.length,
        content: el("div", { class: "modal-embeds" }, embedData.map((d) => buildEmbed(d.id, d.link)))
      });
    }
    if (files) {
      tabs.push({
        id: "code",
        label: "Code",
        count: files.length,
        content: buildCodeBlock(files)
      });
    }
    if (buttons.length) {
      tabs.push({
        id: "links",
        label: "Links",
        content: el("div", { class: "modal-links" }, buttons)
      });
    }
    sections.replaceChildren(...buildTabs(tabs));

    lastFocused = document.activeElement;
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  closeBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop.classList.contains("open")) close();
  });

  return { open };
}
