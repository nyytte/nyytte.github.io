// Light/dark theme toggle, persisted to localStorage.
const STORAGE_KEY = "portfolio-theme";

export function initTheme() {
  const toggle = document.getElementById("theme-toggle");
  if (localStorage.getItem(STORAGE_KEY) === "light") {
    document.body.classList.add("light-theme");
  }
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const apply = () => {
      const isLight = document.body.classList.toggle("light-theme");
      localStorage.setItem(STORAGE_KEY, isLight ? "light" : "dark");
    };
    // Crossfade the whole page between themes where supported; otherwise swap.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });
}
