// Scroll reveals, button ripples, and the auto-scrolling feedback carousel.
import { el } from "./utils.js";

export function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((s) => observer.observe(s));
}

export function initRipple() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mousedown", function (e) {
      const rect = this.getBoundingClientRect();
      const circle = el("span", {
        class: "ripple",
        style: `left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;`
      });
      this.append(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });
}

export function initFeedbackCarousel(config) {
  const grid = document.querySelector(".feedback-grid");
  if (!grid) return;

  const speed = config.ui?.feedbackScrollSpeed ?? 1.5;
  let paused = false;
  let interval = null;

  // Wheel-to-horizontal scroll.
  grid.addEventListener(
    "wheel",
    (e) => {
      if (grid.scrollWidth > grid.clientWidth) {
        e.preventDefault();
        grid.scrollLeft += e.deltaY * 2.5;
      }
    },
    { passive: false }
  );

  // Duplicate the cards once so the loop is seamless. Feedback is rendered
  // synchronously from config, so no timing hack is needed.
  const originals = Array.from(grid.children);
  originals.forEach((card) => grid.append(card.cloneNode(true)));

  const start = () => {
    if (interval) return;
    interval = setInterval(() => {
      if (paused) return;
      if (grid.scrollLeft >= grid.scrollWidth / 2) grid.scrollLeft = 0;
      else grid.scrollLeft += speed;
    }, 20);
  };
  const stop = () => {
    clearInterval(interval);
    interval = null;
  };

  grid.addEventListener("mouseenter", () => (paused = true));
  grid.addEventListener("mouseleave", () => (paused = false));
  grid.addEventListener("touchstart", () => (paused = true), { passive: true });
  grid.addEventListener("touchend", () => setTimeout(() => (paused = false), 2000));

  new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
    { threshold: 0.1 }
  ).observe(grid);
}
