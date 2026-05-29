// Entry point. Loaded as an ES module (see index.html). Wires config -> DOM.
import { config } from "./config.js?v=8";
import { createToast } from "./modules/utils.js";
import { initTheme } from "./modules/theme.js?v=2";
import { initLanyard } from "./modules/lanyard.js";
import { createModal } from "./modules/modal.js?v=4";
import {
  renderPersonal,
  renderSkills,
  renderCommissions,
  renderProjects,
  renderAbout,
  renderFeedback
} from "./modules/render.js";
import { initReveal, initRipple, initFeedbackCarousel } from "./modules/interactions.js";
import { initTypewriter } from "./modules/typewriter.js?v=2";

document.addEventListener("DOMContentLoaded", () => {
  const showToast = createToast();
  const modal = createModal();

  // Content
  renderPersonal(config);
  renderSkills(config);
  renderCommissions(config, modal);
  renderProjects(config, modal);
  renderAbout(config);
  renderFeedback(config);

  // Behavior
  initTypewriter(config);
  initTheme();
  initLanyard(config, showToast);
  initReveal();
  initRipple();
  initFeedbackCarousel(config);
});
