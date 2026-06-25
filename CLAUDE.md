# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Bilgi Arenasi" (Knowledge Arena) — a Turkish-language trivia/quiz mobile app built with Expo + React Native. Users authenticate, then play timed quiz games with sound feedback. Backend is Appwrite (self-hosted or cloud).

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

Exports: `client`, `account`, `databases` — but these must ONLY be imported inside services/ modules, never directly in screens/components (see Constraints).

Database: `"expoAppNew"` with collection `"questions"` schema: `{ question, options[], correctAnswer, category, difficulty, explanation }`.

Collection `userStats` (active): per-user stats `{userId, userName, totalScore, gamesPlayed, bestScore, totalCorrect, totalQuestions, lastPlayedAt}`; create permission users/verified, row security ON, per-doc owner permissions. Collection `tasks` is dead/unused.

### Questions — `services/questionService.js`

- `getQuestions(limit)` — fetches a pool ~8–12x larger than `limit`, then shuffles and slices. This gives better randomization than fetching exactly `limit` rows.
- `getQuestionsByCategory(category, limit)` — same pattern with a category filter.

### Game Screen — `app/game/quick-game.jsx`

- 10 questions, 15-second timer per question
- Sound effects via `utils/sound.js` (correct, wrong, completed, tick, game-over in `assets/sounds/`)
- Score persisted to Appwrite via services/scoreService.js (submitScore upserts userStats; verified-users only, guests not persisted).

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

## Orchestration (human-in-the-loop)
- Pipeline: researcher → planner → plan-reviewer → coder → code-reviewer → tester; human drives every transition (STOP and wait).
- Coder: ONE phase per turn, ends with PHASE_COMPLETE, never commits/pushes — and NEVER runs other agents. Every coder prompt must include a hard STOP instruction ("do NOT run code-reviewer/tester/any agent, do NOT commit, wait for me"), because the main agent has auto-chained agents when this is missing.
- code-reviewer: verdict only (APPROVED / NEEDS_REVISION with file:line), never edits files, never runs commands. The code-reviewer has NO Bash tool.
- tester: verdict only (READY_TO_PUSH / NEEDS_FIXES with file:line), runs lint+tsc, but NEVER edits or writes files — not via Edit/Write nor via Bash shell redirection. If it finds issues it reports them for the coder to fix.
- Never skip code-reviewer or tester; "looks correct" is not a substitute for a verdict. If an agent exceeds its role, verify independently.
- Verdicts are terminal for the turn. When plan-reviewer / code-reviewer / tester returns a verdict, the main agent MUST NOT edit or create any file (including plan/research/docs files) and MUST NOT spawn any agent in response. NEEDS_REVISION → the human routes it to planner; NEEDS_FIXES → the human routes it to coder. The main agent applying the "Required Changes" itself is a defect — the same failure mode as coder auto-chaining.
- Commits use the /commit skill (manual /commit): it splits feat(code)/docs(plans)/chore(.claude) and ALWAYS pushes.
- Built-in Animated API for animations, NOT react-native-reanimated (reanimated pulled in a worklets native-version mismatch that broke app launch).
- Plans live in thoughts/shared/plans/YYYY-MM-DD_[topic].md.
- Execute only what the current human message asks for — one delegated step per turn.

## Context Management

- /compact at ~55-60% context, especially before running an agent.
- Delegate research tasks to a subagent to keep the main context clean
- On compaction, preserve: list of changed files, active plan path, running commands
- For manual testing: if context > 60%, save debug snapshot to thoughts/shared/debug/YYYY-MM-DD_feature.md with: one-line status, repro steps, expected vs actual, current hypothesis, relevant file paths. Then /clear and reload only: plan phase + debug note + 1-2 relevant files
- Keep phases small — each phase should validate one behavior
- If manual testing requires more than 3 files or 2 failed hypotheses, split into a micro-phase

## Constraints

- Do not fix the same error more than twice — run /clear and write a better prompt
- Do not touch node_modules or .expo directories
- Never write to .env files
- All file names, folder names, variable names, function names, and code comments must be in English. No Turkish characters in identifiers or comments. User-facing string literals (UI text, toast messages, labels) must use correct Turkish with proper characters (ş, ğ, ı, ö, ü, ç etc.).
- Theme tokens only: all colors via Colors.*, spacing via Spacing.*, font sizes via Typography.size.* — NO hardcoded hex or raw numbers outside the theme file.
- Appwrite access goes through a service module in services/ (questionService.js, authService.js, scoreService.js — match their mapDoc + named-export pattern) — never import the SDK (account/databases) directly into screens/components.

## Compaction Instructions

When compacting, always preserve:
- Full list of modified files with paths
- Active plan file path (thoughts/shared/plans/)
- Failed approaches and why they failed
- Working test and lint commands

When compacting, drop:
- Contents of files that were read but not modified
- Intermediate error messages
- Exploration output

## Common Failure Patterns — Never Do These

- Kitchen sink session: starting one task, asking something unrelated, returning to first task. Fix: /clear between unrelated tasks.
- Correcting over and over: if Claude is wrong twice in a row, /clear and write a better prompt.
- Over-specified CLAUDE.md: if CLAUDE.md grows too long, Claude ignores rules. Keep it under 200 lines.
- Trust-then-verify gap: never ship code without verification. Always run lint or tests.
- Infinite exploration: never investigate without scope. Use subagents so exploration doesn't consume main context.

## Session Management

- Use /clear between unrelated tasks
- Use /compact with instructions: /compact Focus on API changes
- Use /btw for quick questions that don't need to stay in context
- Use /rewind to restore previous state if something goes wrong
- Name sessions with /rename for multi-session work
- Resume with: claude --continue or claude --resume
