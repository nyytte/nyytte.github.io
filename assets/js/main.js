document.addEventListener('DOMContentLoaded', () => {
  const config = window.portfolioConfig;
  if (!config) {
    console.error("Configuration file (config.js) not found or not loaded.");
    return;
  }

  // --- 1. Top Navigation & Hero ---
  document.querySelectorAll('.nav-logo span.name').forEach(el => el.textContent = config.personal.name.toLowerCase());

  const badgeEl = document.querySelector('.nav-badge');
  if (badgeEl) {
    if (config.personal.isOpenToWork) {
      badgeEl.textContent = "Open to work";
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }



  document.querySelectorAll('.hero h1 .name').forEach(el => el.textContent = config.personal.name);
  document.querySelectorAll('.hero h1 .role').forEach(el => el.innerHTML = config.personal.roleAccent + '&nbsp;');
  document.querySelectorAll('.hero h1 .accent').forEach(el => el.textContent = config.personal.roleHighlight);

  document.querySelectorAll('.hero-desc').forEach(el => el.innerHTML = config.personal.description);

  // Stats
  document.querySelectorAll('.hstat-num.years').forEach(el => el.innerHTML = config.personal.yearsScripting.replace('+', '<span>+</span>'));
  document.querySelectorAll('.hstat-num.projects').forEach(el => el.innerHTML = config.personal.gamesDeveloped.replace('+', '<span>+</span>'));
  document.querySelectorAll('.hstat-num.bugs').forEach(el => el.textContent = config.personal.bugsFixed);

  // Global Discord handle replacement
  document.querySelectorAll('span.discord-handle').forEach(span => span.textContent = config.personal.discordUsername);
  document.querySelectorAll('.discord-name.discord-handle').forEach(span => span.textContent = config.personal.discordUsername);
  document.querySelectorAll('a.roblox-link').forEach(a => a.href = config.personal.robloxLink);
  document.querySelectorAll('.roblox-handle').forEach(el => el.textContent = config.personal.robloxName);
  document.querySelectorAll('a.x-link').forEach(a => a.href = config.personal.xLink);
  document.querySelectorAll('.x-handle').forEach(el => el.textContent = config.personal.xUsername);

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') document.body.classList.add('light-theme');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
    });
  }

  // --- Toast Notification Helper ---
  const toastEl = document.getElementById('toast');
  function showToast(message) {
    if (!toastEl) return;
    toastEl.innerHTML = `<span>✓</span> ${message}`;
    toastEl.classList.add('show');
    // Clear previous timeout if exists
    if (toastEl.timeoutId) clearTimeout(toastEl.timeoutId);
    toastEl.timeoutId = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  // --- Discord Avatar via Lanyard API ---
  const discordAvatar = document.getElementById('discord-avatar');
  const discordMsgBtn = document.getElementById('discord-message-btn');
  const userId = config.personal.discordUserId;

  if (userId) {
    if (discordMsgBtn) {
      // User requested copy to clipboard instead of opening Discord DMs
      discordMsgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(config.personal.discordUsername).then(() => {
          showToast('Copied to clipboard!');
        });
      });
    }

    // Update discord status UI
    function updateDiscordStatus(data) {
      if (!data || !data.discord_user) return;
      const user = data.discord_user;
      const status = data.discord_status || 'offline';

      // Set avatar
      if (discordAvatar && user.avatar) {
        const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
        discordAvatar.src = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${ext}?size=128`;
      }

      // Set Status
      const statusDot = document.getElementById('discord-status-dot');
      const statusText = document.getElementById('discord-status-text');

      if (statusDot) {
        statusDot.className = `discord-status-dot ${status}`;
        statusDot.style.display = 'block';
      }

      if (statusText) {
        let displayText = status.charAt(0).toUpperCase() + status.slice(1);
        if (status === 'dnd') displayText = 'Do Not Disturb';
        statusText.textContent = `Currently ${displayText}`;
      }

      // Set Spotify
      const spotifyEl = document.getElementById('spotify-status-container');
      const spotifySong = document.getElementById('spotify-song');
      const spotifyArtist = document.getElementById('spotify-artist');
      const spotifyArt = document.getElementById('spotify-album-art');
      const spotifyLink = document.getElementById('spotify-link');
      const spotifyTimeCurrent = document.getElementById('spotify-time-current');
      const spotifyTimeTotal = document.getElementById('spotify-time-total');
      const spotifyProgressFill = document.getElementById('spotify-progress-fill');
      const spotifyBgBlur = document.getElementById('spotify-bg-blur');
      
      if (window.spotifyInterval) clearInterval(window.spotifyInterval);

      if (spotifyEl && data.spotify) {
        const spotify = data.spotify;
        spotifySong.textContent = spotify.song;
        spotifyArtist.textContent = spotify.artist;
        if (spotifyArt) spotifyArt.src = spotify.album_art_url;
        if (spotifyBgBlur) spotifyBgBlur.style.backgroundImage = `url(${spotify.album_art_url})`;
        if (spotifyLink && spotify.track_id) spotifyLink.href = `https://open.spotify.com/track/${spotify.track_id}`;
        spotifyEl.style.display = 'flex';

        if (spotify.timestamps) {
          const start = spotify.timestamps.start;
          const end = spotify.timestamps.end;
          const totalMs = end - start;
          
          const formatTime = (ms) => {
            const totalSeconds = Math.floor(ms / 1000);
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            return `${m}:${s.toString().padStart(2, '0')}`;
          };

          if (spotifyTimeTotal) spotifyTimeTotal.textContent = formatTime(totalMs);

          function updateProgress() {
            const now = Date.now();
            let currentMs = now - start;
            if (currentMs > totalMs) currentMs = totalMs;
            if (currentMs < 0) currentMs = 0;

            if (spotifyTimeCurrent) spotifyTimeCurrent.textContent = formatTime(currentMs);
            const percent = (currentMs / totalMs) * 100;
            if (spotifyProgressFill) spotifyProgressFill.style.width = `${percent}%`;

            if (currentMs >= totalMs) {
              clearInterval(window.spotifyInterval);
            }
          }

          updateProgress();
          window.spotifyInterval = setInterval(updateProgress, 1000);
        }

      } else if (spotifyEl) {
        spotifyEl.style.display = 'none';
      }
    }

    // Connect to Lanyard WebSocket for real-time updates
    function connectLanyard() {
      const ws = new WebSocket('wss://api.lanyard.rest/socket');
      let heartbeatInterval;

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.op === 1) { // Hello
          ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: userId }
          }));

          heartbeatInterval = setInterval(() => {
            ws.send(JSON.stringify({ op: 3 }));
          }, msg.d.heartbeat_interval);
        } else if (msg.op === 0) { // Event
          if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
            updateDiscordStatus(msg.d);
          }
        }
      };

      ws.onclose = () => {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        setTimeout(connectLanyard, 5000); // Reconnect after 5s
      };
    }

    connectLanyard();
  }

  // --- 2. Skills Section ---
  const skillsContainer = document.getElementById('skills-container');
  if (skillsContainer && config.skills) {
    config.skills.forEach(skill => {
      const cell = document.createElement('div');
      cell.className = 'skill-cell';
      // Support both image paths and emoji fallback
      const iconHTML = skill.icon.includes('/')
        ? `<img src="${skill.icon}" alt="${skill.name}" class="skill-icon-img">`
        : skill.icon;
      cell.innerHTML = `
        <div class="skill-icon">${iconHTML}</div>
        <div class="skill-name">${skill.name}</div>
        <div class="skill-desc">${skill.description}</div>
        <div class="skill-bar"><div class="skill-bar-fill" data-width="${skill.mastery}"></div></div>
      `;
      skillsContainer.appendChild(cell);
    });
  }

  // --- 3. Commissions Section ---
  const commissionsContainer = document.getElementById('commissions-container');
  if (commissionsContainer && config.commissions) {
    config.commissions.forEach((comm, index) => {
      let statusHTML = '';
      if (comm.status === 'wip') {
        statusHTML = '<span class="commission-status tag-wip">Working on</span>';
      } else if (comm.status === 'finished') {
        statusHTML = '<span class="commission-status tag-finished">✓ Finished</span>';
      }

      // Ensure max 5 delay classes for stagger effect
      const delayNum = (index % 5) + 1;
      
      const card = document.createElement('a');
      card.href = comm.link && comm.link !== '#' ? comm.link : '#';
      if (comm.link && comm.link !== '#') card.target = '_blank';
      card.className = `commission-card fade-in-up delay-${delayNum}`;
      card.innerHTML = `
        <div class="commission-header">
          <div class="commission-title">${comm.title}</div>
          ${statusHTML}
        </div>
        <div class="commission-desc">${comm.description}</div>
      `;

      // Modal logic for commissions
      if (comm.details || (comm.links && comm.links.length > 0)) {
        card.addEventListener('click', (e) => {
          e.preventDefault();
          openProjectModal(comm);
        });
      }

      commissionsContainer.appendChild(card);
    });
  }

  // --- 4. Projects Section ---
  const projectsContainer = document.getElementById('projects-container');
  if (projectsContainer && config.projects) {
    config.projects.forEach((proj, index) => {
      const numStr = String(index + 1).padStart(2, '0');

      let tagsHTML = '';
      if (proj.tags) {
        tagsHTML = proj.tags.map(tag => `<span class="tag ${tag.class}">${tag.name}</span>`).join('');
      }

      // Status tag (WIP / Finished)
      let statusHTML = '';
      if (proj.status === 'wip') {
        statusHTML = '<span class="tag tag-wip" style="display:inline-flex; align-items:center; gap:4px;"><span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#fbbf24;"></span>Working on</span>';
      } else if (proj.status === 'finished') {
        statusHTML = '<span class="tag tag-finished">✓ Finished</span>';
      }

      const row = document.createElement('a');
      row.href = proj.link && proj.link !== '#' ? proj.link : '#';
      if (proj.link && proj.link !== '#') row.target = '_blank';
      row.className = 'project-row';
      row.innerHTML = `
        <span class="project-num">${numStr}</span>
        <div>
          <div class="project-tags">${tagsHTML}${statusHTML}</div>
          <div class="project-title">${proj.title}</div>
          <div class="project-desc">${proj.description}</div>
        </div>
        <span class="project-arrow">→</span>
      `;

      // Modal logic
      if (proj.details || (proj.links && proj.links.length > 0)) {
        row.addEventListener('click', (e) => {
          e.preventDefault();
          openProjectModal(proj);
        });
      }

      projectsContainer.appendChild(row);
    });
  }

  // --- Project Modal Functions ---
  const modalBackdrop = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');

  function openProjectModal(proj) {
    if (!modalBackdrop) return;

    // Populate Data
    document.getElementById('modal-title').textContent = proj.title;
    document.getElementById('modal-desc').textContent = proj.description;

    const detailsEl = document.getElementById('modal-details');
    detailsEl.innerHTML = proj.details ? proj.details.replace(/\n/g, '<br><br>') : '';

    // Tags
    const tagsEl = document.getElementById('modal-tags');
    if (proj.tags) {
      tagsEl.innerHTML = proj.tags.map(tag => `<span class="tag ${tag.class}">${tag.name}</span>`).join('');
    } else {
      tagsEl.innerHTML = '';
    }

    // Links & Embeds
    const footerEl = document.getElementById('modal-footer');
    const embedsEl = document.getElementById('modal-embeds');
    footerEl.innerHTML = '';
    embedsEl.innerHTML = '';

    if (proj.links) {
      proj.links.forEach(link => {
        // Check if this is a Streamable link
        const streamableMatch = link.url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
        if (streamableMatch) {
          const videoId = streamableMatch[1];
          const wrapper = document.createElement('div');
          wrapper.className = 'modal-embed-wrapper';
          wrapper.innerHTML = `
            <div class="modal-embed-label">${link.icon || '🎬'} ${link.text}</div>
            <div class="modal-embed-container">
              <iframe src="https://streamable.com/e/${videoId}?" allow="fullscreen" allowfullscreen frameborder="0" style="border:none; width:100%; height:100%; position:absolute; left:0; top:0;"></iframe>
            </div>
          `;
          embedsEl.appendChild(wrapper);
        } else {
          const a = document.createElement('a');
          a.href = link.url;
          a.target = '_blank';
          a.className = 'modal-link-btn ripple-btn';
          a.innerHTML = `${link.icon || ''} ${link.text}`;
          footerEl.appendChild(a);
        }
      });
    }

    // Show Modal
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeProjectModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    
    // Clear embeds to stop audio/video
    const embedsEl = document.getElementById('modal-embeds');
    if (embedsEl) embedsEl.innerHTML = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeProjectModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeProjectModal();
    });
  }

  // --- 4. About Section ---
  document.querySelectorAll('h2.about-title').forEach(el => el.textContent = `Who is ${config.personal.name}?`);

  const aboutTextContainer = document.getElementById('about-text-container');
  if (aboutTextContainer && config.aboutParagraphs) {
    const existingParagraphs = aboutTextContainer.querySelectorAll('p');
    existingParagraphs.forEach(p => p.remove());

    config.aboutParagraphs.forEach(para => {
      const p = document.createElement('p');
      p.textContent = para;
      aboutTextContainer.appendChild(p);
    });
  }

  // About quick info card
  document.querySelectorAll('.info-val-handle').forEach(el => el.textContent = config.personal.name);
  document.querySelectorAll('.info-val-stack').forEach(el => el.textContent = config.personal.stack);
  document.querySelectorAll('.info-val-specialty').forEach(el => el.textContent = config.personal.specialty);

  // Status dot: green if available, red if not
  const statusVal = document.querySelector('.info-val-status');
  if (statusVal) {
    const dotColor = config.personal.isOpenToWork ? '#22c55e' : '#ef4444';
    statusVal.innerHTML = `<span class="status-dot" style="background:${dotColor}"></span>${config.personal.statusText}`;
  }

  // --- 5. Feedback Section ---
  const feedbackContainer = document.getElementById('feedback-container');
  const feedbackEmpty = document.getElementById('feedback-empty');
  if (feedbackContainer && config.feedback) {
    if (config.feedback.length === 0) {
      // Show placeholder
      if (feedbackEmpty) feedbackEmpty.style.display = 'block';
    } else {
      if (feedbackEmpty) feedbackEmpty.style.display = 'none';
      config.feedback.forEach(fb => {
        const card = document.createElement('div');
        card.className = 'feedback-card';

        // Star rating (SVG)
        const starFilled = '<svg viewBox="0 0 24 24" fill="#fde047" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        const starHalf = '<svg viewBox="0 0 24 24"><defs><linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0"><stop offset="50%" stop-color="#fde047"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#halfGrad)" stroke="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path fill="none" stroke="#3f3f46" stroke-width="2" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        const starEmpty = '<svg viewBox="0 0 24 24" fill="none" stroke="#3f3f46" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          if (fb.rating >= i) {
            stars += starFilled;
          } else if (fb.rating >= i - 0.5) {
            stars += starHalf;
          } else {
            stars += starEmpty;
          }
        }

        // Avatar display
        const displayName = fb.name || "Unknown";
        const hasValidAvatar = fb.avatarUrl && fb.avatarUrl.startsWith('http');
        const avatarHTML = hasValidAvatar
          ? `<img src="${fb.avatarUrl}" alt="${displayName}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; margin-right:12px;">`
          : `<div style="width:36px; height:36px; border-radius:50%; background:var(--border); margin-right:12px; display:flex; align-items:center; justify-content:center; font-size:14px; color:var(--text); font-weight:600;">${displayName.charAt(0).toUpperCase()}</div>`;

        card.innerHTML = `
          <div class="feedback-stars">${stars}</div>
          <p class="feedback-text">"${fb.text}"</p>
          <div class="feedback-author" style="display:flex; align-items:center;">
            <div class="feedback-avatar-container">${avatarHTML}</div>
            <div>
              <div class="feedback-name">${displayName}</div>
              <div class="feedback-role">${fb.role || ''}</div>
            </div>
          </div>
        `;
        feedbackContainer.appendChild(card);
      });
    }
  }

  // --- 6. Observers & Interactions ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) el.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(s => revealObserver.observe(s));

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.skills-grid').forEach(g => barObserver.observe(g));

  // Button Ripple Effect
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const circle = document.createElement('span');
      circle.classList.add('ripple');
      circle.style.left = `${x}px`;
      circle.style.top = `${y}px`;

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Horizontal wheel scrolling for feedback section
  const feedbackGrid = document.querySelector('.feedback-grid');
  if (feedbackGrid) {
    feedbackGrid.addEventListener('wheel', (e) => {
      if (feedbackGrid.scrollWidth > feedbackGrid.clientWidth) {
        e.preventDefault();
        feedbackGrid.scrollLeft += e.deltaY * 2.5;
      }
    }, { passive: false });

    // Auto-scroll feedback carousel
    let autoScrollInterval = null;
    let isPaused = false;
    let scrollSpeed = (config.ui && config.ui.feedbackScrollSpeed) ? config.ui.feedbackScrollSpeed : 1.5;

    // Clone nodes for infinite scroll effect (run once after fetching)
    setTimeout(() => {
      const cards = Array.from(feedbackGrid.children);
      // Only clone if not already cloned
      if (cards.length > 0 && cards[0].classList.contains('feedback-card') && feedbackGrid.children.length === cards.length) {
        cards.forEach(card => {
          const clone = card.cloneNode(true);
          // ensure cloned elements also load their avatars correctly if they have lazy load
          feedbackGrid.appendChild(clone);
        });
      }
    }, 1000); // Give it a second to render the API avatars before cloning

    function startAutoScroll() {
      if (autoScrollInterval) return;
      autoScrollInterval = setInterval(() => {
        if (isPaused) return;

        // The grid contains 2 sets of identical cards.
        // We want to reset when we reach the end of the FIRST set.
        // ScrollWidth is the total width (2 sets). ScrollWidth / 2 is the exact boundary.
        if (feedbackGrid.scrollLeft >= feedbackGrid.scrollWidth / 2) {
           feedbackGrid.scrollLeft = 0;
           // If we just reset, we don't add scrollSpeed immediately to avoid a double-jump
        } else {
           feedbackGrid.scrollLeft += scrollSpeed;
        }
      }, 20);
    }

    // Smoother stopping/starting based on pointer
    feedbackGrid.addEventListener('mouseenter', () => isPaused = true);
    feedbackGrid.addEventListener('mouseleave', () => isPaused = false);
    feedbackGrid.addEventListener('touchstart', () => isPaused = true, { passive: true });
    feedbackGrid.addEventListener('touchend', () => {
      setTimeout(() => isPaused = false, 2000);
    });

    // Start auto-scroll when feedback section is visible
    const feedbackObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAutoScroll();
        } else {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
      });
    }, { threshold: 0.1 });
    feedbackObserver.observe(feedbackGrid);
  }

  // Discord social card copy-to-clipboard
  const discordSocialBtn = document.getElementById('discord-message-btn-social');
  if (discordSocialBtn) {
    discordSocialBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(config.personal.discordUsername).then(() => {
        showToast('Copied to clipboard!');
      });
    });
  }
});

// Exposed globally for the inline form onsubmit
window.handleSubmit = function (e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const originalText = btn.textContent;

  btn.textContent = 'Sent ✓';
  btn.style.background = 'var(--green)';
  btn.style.color = 'var(--bg)';

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.style.color = '';
    e.target.reset();
  }, 3000);
};
