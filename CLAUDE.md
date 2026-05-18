# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Bilgi Arenası" (Knowledge Arena) — a Turkish-language trivia/quiz mobile app built with Expo + React Native. Users authenticate, then play timed quiz games with sound feedback. Backend is Appwrite (self-hosted or cloud).

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run in browser
npm run lint           # ESLint (expo preset)
npm run reset-project  # Move starter code to app-example/, create blank app/
```

No test runner is configured.

## Architecture

### Routing (Expo Router v6 — file-based)

- `app/_layout.tsx` — Root layout; wraps everything in `<AuthProvider>` and `<Toast>`
- `app/(app)/_layout.tsx` — Auth guard; reads `useAuth().session` and redirects to `/signin` if missing
- `app/(app)/` — All protected screens live here (home, game, etc.)
- `app/signin.jsx`, `signup.jsx`, etc. — Public auth screens at root level

Route groups like `(app)` don't appear in URLs but let a single layout wrap multiple protected screens.

### Authentication — `context/AuthContext.js`

React Context that exposes `{ session, user, loading, signin, signup, signout, createPasswordRecovery }`. Auth state is initialized by calling `account.getSession('current')` on mount.

**Signup flow**: create account → create session → send verification email → delete session. The user must verify email before signing in, so the session is immediately destroyed after signup.

**Email verification** links to an external Vercel app (`reset-expo.vercel.app`) — not handled inside this repo.

### Backend — Appwrite (`lib/appwrite.js`)

Initialized from env vars:
```
EXPO_PUBLIC_APPWRITE_ENDPOINT
EXPO_PUBLIC_APPWRITE_PROJECT_ID
EXPO_PUBLIC_APPWRITE_BUNDLE_ID     # iOS
EXPO_PUBLIC_APPWRITE_PACKAGE_NAME  # Android
EXPO_PUBLIC_VERIFICATION_URL       # defaults to reset-expo.vercel.app/verify-email
```

Exports: `client`, `account`, `databases` — imported wherever Appwrite is needed.

Database: `"expoAppNew"` with collection `"questions"` schema: `{ question, options[], correctAnswer, category, difficulty, explanation }`.

### Questions — `services/questionService.js`

- `getQuestions(limit)` — fetches a pool ~8–12x larger than `limit`, then shuffles and slices. This gives better randomization than fetching exactly `limit` rows.
- `getQuestionsByCategory(category, limit)` — same pattern with a category filter.

### Game Screen — `app/game/quick-game.jsx`

- 10 questions, 15-second timer per question
- Sound effects via `utils/sound.js` (correct, wrong, completed, tick, game-over in `assets/sounds/`)
- Score tracked locally; no backend persistence yet

### Styling

Styles live in `assets/styles/` as `StyleSheet` objects (`homeStyle.js`, `quickGameStyle.js`, `signinStyle.js`) and are imported into their respective screens. Use `TextCustom` (`app/components/TextCustom.tsx`) for consistent typography.

### Toasts — `utils/toast.ts`

Wrapper around `react-native-toast-message`:
```ts
showToast.success("Title", "Description")
showToast.error("Title", "Description")
showToast.info("Title", "Description")
```

Styled in `utils/toastConfig.js`.

## Key Patterns

- **New protected screen**: add file under `app/(app)/`, call `useAuth()` for user data, `useRouter()` for navigation.
- **New public screen**: add file at `app/` root level (no auth guard).
- **Path alias**: `@/` maps to the repo root (configured in `tsconfig.json` and Expo's `tsconfigPaths` experiment).
- **Mixed JS/TS**: newer files use TypeScript; older screens (signin, game) are plain `.jsx`. Follow the existing convention for the file you're editing.
- **New Architecture** is enabled (`newArchEnabled: true` in `app.json`). Avoid libraries that haven't been migrated.

## Context Yönetimi

- Context %60'ı geçmeden /compact veya /clear çalıştır
- Her büyük görev için sırayı takip et: Research → Plan → Implement → Validate
- Araştırma görevlerini subagent'e devret, ana context'i kirletme
- Compaction sırasında şunları koru: değiştirilen dosya listesi, aktif plan yolu, çalışan komutlar

## Kısıtlamalar

- Aynı hatayı 2 kereden fazla düzeltme — /clear yap, daha iyi prompt yaz
- node_modules, .expo klasörlerine dokunma
- .env dosyasına asla yazma
- Büyük değişiklikten önce git commit al
