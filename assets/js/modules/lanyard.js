// Live Discord presence + Spotify activity via the Lanyard API.
// Requires the user to be in the Lanyard Discord server. Auto-reconnects.
import { copyToClipboard } from "./utils.js";

const SOCKET_URL = "wss://api.lanyard.rest/socket";

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function initLanyard(config, showToast) {
  const userId = config.personal.discordUserId;
  if (!userId) return;

  // "Message me" buttons copy the handle instead of opening DMs.
  for (const id of ["discord-message-btn", "discord-message-btn-social"]) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        copyToClipboard(config.personal.discordUsername, showToast);
      });
    }
  }

  let spotifyInterval = null;

  function updateStatus(data) {
    if (!data || !data.discord_user) return;
    const user = data.discord_user;
    const status = data.discord_status || "offline";

    if (user.avatar) {
      const ext = user.avatar.startsWith("a_") ? "gif" : "png";
      const url = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${ext}?size=128`;
      const avatar = document.getElementById("discord-avatar");
      if (avatar) avatar.src = url;
      const profileAvatar = document.getElementById("profile-avatar-img");
      if (profileAvatar) {
        profileAvatar.src = url;
        profileAvatar.style.display = "block";
      }
    }

    const statusDot = document.getElementById("discord-status-dot");
    if (statusDot) {
      statusDot.className = `discord-status-dot ${status}`;
      statusDot.style.display = "block";
    }

    const statusText = document.getElementById("discord-status-text");
    if (statusText) {
      const label = status === "dnd"
        ? "Do Not Disturb"
        : status.charAt(0).toUpperCase() + status.slice(1);
      statusText.textContent = `Currently ${label}`;
    }

    updateSpotify(data.spotify);
  }

  function updateSpotify(spotify) {
    const container = document.getElementById("spotify-status-container");
    if (!container) return;
    if (spotifyInterval) clearInterval(spotifyInterval);

    if (!spotify) {
      container.style.display = "none";
      return;
    }

    document.getElementById("spotify-song").textContent = spotify.song;
    document.getElementById("spotify-artist").textContent = spotify.artist;

    const art = document.getElementById("spotify-album-art");
    if (art) art.src = spotify.album_art_url;
    const blur = document.getElementById("spotify-bg-blur");
    if (blur) blur.style.backgroundImage = `url(${spotify.album_art_url})`;
    const link = document.getElementById("spotify-link");
    if (link && spotify.track_id) link.href = `https://open.spotify.com/track/${spotify.track_id}`;

    container.style.display = "flex";

    if (!spotify.timestamps) return;
    const { start, end } = spotify.timestamps;
    const totalMs = end - start;
    const totalEl = document.getElementById("spotify-time-total");
    const currentEl = document.getElementById("spotify-time-current");
    const fillEl = document.getElementById("spotify-progress-fill");
    if (totalEl) totalEl.textContent = formatTime(totalMs);

    const tick = () => {
      const currentMs = Math.min(Math.max(Date.now() - start, 0), totalMs);
      if (currentEl) currentEl.textContent = formatTime(currentMs);
      if (fillEl) fillEl.style.width = `${(currentMs / totalMs) * 100}%`;
      if (currentMs >= totalMs) clearInterval(spotifyInterval);
    };
    tick();
    spotifyInterval = setInterval(tick, 1000);
  }

  function connect() {
    const ws = new WebSocket(SOCKET_URL);
    let heartbeat = null;

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 1) {
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        heartbeat = setInterval(() => ws.send(JSON.stringify({ op: 3 })), msg.d.heartbeat_interval);
      } else if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
        updateStatus(msg.d);
      }
    };

    ws.onclose = () => {
      if (heartbeat) clearInterval(heartbeat);
      setTimeout(connect, 5000);
    };
  }

  connect();
}
