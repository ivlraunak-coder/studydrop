import { initNotes } from "./features/notes/notes.js";
// StudyDrop modular bootstrap.
// Firebase is initialized first; feature scripts then load in dependency order.
async function loadScript(src) {
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "/js/" + src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

const MODULES = [
  "core/state.js",
  "core/helpers.js",
  "ui/theme.js",
  "gamification/coins.js",
  "gamification/xp.js",
  "gamification/shop.js",
  "core/init.js",
  "rooms/onboarding.js",
  "rooms/rooms.js",
  "rooms/room-switcher.js",
  "ui/profile.js",
  "ui/navigation.js",
  "core/presence.js",
  "core/firebase-sync.js",
  "gamification/badges.js",
  "features/goals.js",
  "features/comments.js",
  "features/chat.js",
  "features/leaderboard.js",
  "ui/lightbox.js",
  "features/spotify.js",
  "features/pomodoro.js",
  "features/tracker.js",
  "features/study-status.js",
  "features/missions.js",
  "features/planner.js",
  "features/report.js",
  "features/pet.js",
  "features/flashcards.js",
  "core/public-api.js",
  "ui/sidebar.js"
];

async function bootStudyDrop() {
  if (window.__sdBooted) return;
  window.__sdBooted = true;
  try {
    await import("./core/firebase.js");
    for (const modulePath of MODULES) await loadScript(modulePath);
    if (typeof window.init === "function") await window.init();
  } catch (error) {
    console.error("StudyDrop boot failed:", error);
    const toast = document.getElementById("toast");
    if (toast) { toast.textContent = "StudyDrop could not start. Refresh the page."; toast.classList.add("show"); }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootStudyDrop, { once:true });
} else {
  bootStudyDrop();
}


// StudyDrop Notes
initNotes();
