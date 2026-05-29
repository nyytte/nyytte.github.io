// Reads the config and builds every dynamic section into its container.
import { el } from "./utils.js";
import { highlightLuau } from "./highlight.js";

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

// ---- Hero / nav / personal text ----------------------------------------
export function renderPersonal(config) {
  const p = config.personal;
  const setText = (sel, value) => document.querySelectorAll(sel).forEach((node) => (node.textContent = value));
  const setHtml = (sel, value) => document.querySelectorAll(sel).forEach((node) => (node.innerHTML = value));

  setText(".nav-logo span.name", p.name.toLowerCase());
  setText(".hero h1 .name", p.name);
  setHtml(".hero h1 .role", p.roleAccent + "&nbsp;");
  setText(".hero h1 .accent", p.roleHighlight);
  setHtml(".hero-desc", p.description);

  setHtml(".hstat-num.years", p.yearsScripting.replace("+", "<span>+</span>"));
  setHtml(".hstat-num.projects", p.gamesDeveloped.replace("+", "<span>+</span>"));
  setText(".hstat-num.bugs", p.bugsFixed);

  setText("span.discord-handle", p.discordUsername);
  setText(".discord-name.discord-handle", p.discordUsername);
  setText(".roblox-handle", p.robloxName);
  setText(".x-handle", p.xUsername);
  document.querySelectorAll("a.roblox-link").forEach((a) => (a.href = p.robloxLink));
  document.querySelectorAll("a.x-link").forEach((a) => (a.href = p.xLink));

  const badge = document.querySelector(".nav-badge");
  if (badge) {
    badge.style.display = p.isOpenToWork ? "inline-block" : "none";
    if (p.isOpenToWork) badge.textContent = "Open to work";
  }

  // Hero profile card
  setText(".profile-name", p.name);
  setText(".info-val-country", p.country);
  setText(".info-val-exp", p.experience);
  setText(".info-val-stack", p.stack);
  setText(".info-val-specialty", p.specialty);

  const pBadgeText = document.querySelector(".profile-badge-text");
  if (pBadgeText) pBadgeText.textContent = p.isOpenToWork ? "Open to work" : "Busy";
  const pBadgeDot = document.querySelector(".profile-badge .status-dot");
  if (pBadgeDot) pBadgeDot.style.background = p.isOpenToWork ? "#9bd6a8" : "#f4a6a6";
}

function buildIcon(icon) {
  if (typeof icon === "string" && icon.trim().startsWith("<svg")) {
    return el("span", { html: icon.replace("<svg", '<svg class="skill-icon-svg"') });
  }
  if (typeof icon === "string" && icon.includes("/")) {
    return el("img", { src: icon, class: "skill-icon-img", alt: "" });
  }
  return document.createTextNode(icon || "");
}

// ---- Skills (no fake mastery bars) --------------------------------------
export function renderSkills(config) {
  const container = document.getElementById("skills-container");
  if (!container || !config.skills) return;
  container.replaceChildren(
    ...config.skills.map((skill) =>
      el("div", { class: "skill-cell" }, [
        el("div", { class: "skill-icon" }, [buildIcon(skill.icon)]),
        el("div", { class: "skill-name", text: skill.name }),
        el("div", { class: "skill-desc", text: skill.description })
      ])
    )
  );
}

function statusTag(status) {
  if (status === "wip") {
    return el("span", { class: "tag tag-wip" }, [
      el("span", { class: "tag-dot" }),
      "Working on"
    ]);
  }
  if (status === "finished") return el("span", { class: "tag tag-finished", text: "✓ Finished" });
  return null;
}

// Content indicators shown in a card footer: videos, code files, links.
const STREAMABLE = /streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/;

function workChips(item) {
  const links = item.links || [];
  const videos = links.filter((l) => STREAMABLE.test(l.url)).length;
  const others = links.filter((l) => !STREAMABLE.test(l.url)).length;
  const codeCount = Array.isArray(item.files) ? item.files.length : item.code ? 1 : 0;

  const chips = [];
  if (videos) chips.push(el("span", { class: "work-chip", text: `🎬 ${videos}` }));
  if (codeCount) chips.push(el("span", { class: "work-chip", text: `{ } ${codeCount}` }));
  if (others) chips.push(el("span", { class: "work-chip", text: `🔗 ${others}` }));
  return chips;
}

// Shared card used by both projects and commissions.
function buildWorkCard(item, i, modal) {
  const opensModal = item.details || (item.links && item.links.length) || item.files || item.code;

  const foot = el("div", { class: "work-card-foot" }, [
    el("div", { class: "work-meta" }, workChips(item)),
    opensModal ? el("span", { class: "work-view", text: "View details →" }) : null
  ]);

  const card = el("a", { href: "#", class: `work-card fade-in-up delay-${(i % 5) + 1}` }, [
    el("div", { class: "work-card-tags" }, [
      ...(item.tags || []).map((t) => el("span", { class: `tag ${t.class}`, text: t.name })),
      statusTag(item.status)
    ]),
    el("h3", { class: "work-card-title", text: item.title }),
    el("p", { class: "work-card-desc", text: item.description }),
    foot
  ]);

  if (opensModal) {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      modal.open(item);
    });
  }
  return card;
}

function renderWorkGrid(containerId, items, modal) {
  const container = document.getElementById(containerId);
  if (!container || !items) return;
  container.className = "work-grid";
  container.replaceChildren(...items.map((item, i) => buildWorkCard(item, i, modal)));
}

// ---- Commissions ---------------------------------------------------------
export function renderCommissions(config, modal) {
  renderWorkGrid("commissions-container", config.commissions, modal);
}

// ---- Projects ------------------------------------------------------------
export function renderProjects(config, modal) {
  renderWorkGrid("projects-container", config.projects, modal);
}

// ---- About ---------------------------------------------------------------
export function renderAbout(config) {
  const p = config.personal;
  document.querySelectorAll("h2.about-title").forEach((node) => (node.textContent = `Who is ${p.name}?`));

  const textContainer = document.getElementById("about-text-container");
  if (textContainer && config.aboutParagraphs) {
    textContainer.replaceChildren(...config.aboutParagraphs.map((para) => el("p", { text: para })));
  }

  const aboutCode = document.getElementById("about-code-body");
  if (aboutCode && p.aboutCode) aboutCode.innerHTML = highlightLuau(p.aboutCode);
}

// ---- Feedback ------------------------------------------------------------
function starRating(rating) {
  const stars = el("div", { class: "feedback-stars" });
  for (let i = 1; i <= 5; i++) {
    const filled = rating >= i;
    stars.append(
      el("span", {
        html: `<svg viewBox="0 0 24 24" width="16" height="16" fill="${filled ? "#f1d49b" : "none"}" stroke="${filled ? "none" : "#4B5694"}" stroke-width="2"><path d="${STAR_PATH}"/></svg>`
      })
    );
  }
  return stars;
}

export function renderFeedback(config) {
  const container = document.getElementById("feedback-container");
  const empty = document.getElementById("feedback-empty");
  if (!container || !config.feedback) return;

  if (config.feedback.length === 0) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  container.replaceChildren(
    ...config.feedback.map((fb) => {
      const name = fb.name || "Unknown";
      const avatar =
        fb.avatarUrl && fb.avatarUrl.startsWith("http")
          ? el("img", { src: fb.avatarUrl, alt: name, class: "feedback-avatar-img" })
          : el("div", { class: "feedback-avatar-fallback", text: name.charAt(0).toUpperCase() });

      return el("div", { class: "feedback-card" }, [
        starRating(fb.rating),
        el("p", { class: "feedback-text", text: fb.text }),
        el("div", { class: "feedback-author" }, [
          el("div", { class: "feedback-avatar-container" }, [avatar]),
          el("div", {}, [
            el("div", { class: "feedback-name", text: name }),
            el("div", { class: "feedback-role", text: fb.role || "" })
          ])
        ])
      ]);
    })
  );
}
