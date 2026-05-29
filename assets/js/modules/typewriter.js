// Cycling type/erase effect for the hero specialty line.
// Words come from config.personal.heroTyped.
export function initTypewriter(config) {
  const target = document.getElementById("hero-typed");
  const words = config.personal?.heroTyped;
  if (!target || !Array.isArray(words) || words.length === 0) return;

  const randomIndex = () => Math.floor(Math.random() * words.length);

  // Respect reduced-motion: show one random word, no animation.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    target.textContent = words[randomIndex()];
    return;
  }

  let w = randomIndex();
  let chars = 0;
  let deleting = false;

  function tick() {
    const word = words[w];
    chars += deleting ? -1 : 1;
    target.textContent = word.slice(0, chars);

    let delay = deleting ? 45 : 80;
    if (!deleting && chars === word.length) {
      deleting = true;
      delay = 1500; // hold the full word
    } else if (deleting && chars === 0) {
      deleting = false;
      // pick a random next word, avoiding an immediate repeat
      if (words.length > 1) {
        let next = randomIndex();
        while (next === w) next = randomIndex();
        w = next;
      }
      delay = 350; // pause before next word
    }
    setTimeout(tick, delay);
  }
  tick();
}
