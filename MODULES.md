# StudyDrop Modular Architecture

The application is split into small feature-oriented files. `index.html` contains markup only; CSS lives in `css/`; behavior lives in `js/`.

## Runtime order
1. `js/core/firebase.js` initializes Firebase Auth/Realtime Database.
2. `js/main.js` loads classic feature modules in dependency order.
3. `js/core/public-api.js` exposes only the functions required by existing inline HTML handlers.
4. `ui/sidebar.js` adds responsive sidebar behavior.

## Feature groups
- `core/`: state, storage helpers, authentication, Firebase sync, bootstrap.
- `rooms/`: onboarding, room creation/joining, room switching.
- `features/`: goals, comments, chat, leaderboard, Pomodoro, tracker, planner, missions, report, pet, Spotify, study status.
- `gamification/`: coins, XP, badges, shop.
- `ui/`: theme, profile, navigation, lightbox, sidebar.

## AI
AI services and AI API routes are intentionally absent from this build.
