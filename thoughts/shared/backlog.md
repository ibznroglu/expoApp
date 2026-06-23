# Backlog

---

## Email verification — deferred until a verified-restricted data model exists

**Problem:** In this Appwrite setup, email accounts are born with emailVerification: true (confirmed via MCP: account "Jjjj" had accessedAt == createdAt, empty prefs, no link click, yet emailVerification: true; anonymous MS-* accounts correctly born false). This is project/Cloud behavior — there is NO "email verification required" toggle in the Console (the docs confirm no such project setting exists; Auth → Security only has Email policies + Session security). SDK react-native-appwrite 0.10.1 uses positional signatures and the code uses them correctly (createVerification(url), updateVerification(userId, secret)) — not a code bug.

**Current state:** The signIn gate (if !user.emailVerification throw EMAIL_NOT_VERIFIED) in services/authService.js is correct code but never fires because the flag is born true. The verify-email.jsx flow works when the user clicks the link (updateVerification needs no session). We are LEAVING the signIn gate in place (harmless; useful later).

**Why deferred:** Appwrite's official model (docs: Verify user) is "users can log in unverified; restrict RESOURCE ACCESS to verified users via the users('verified') permission" — NOT login-blocking. But there is currently NO user-writable collection to protect (only read-only `questions`; scores/leaderboard don't exist; quick-game score is local React state only). Restricting `questions` to verified would break guest (MS-*) play, since guests can never be email-verified.

**Correct fix (do when the score/leaderboard data model is built):**
1. When creating the user-writable collections (scores/stats/leaderboard), set permissions so writes require the users("verified") role (server-enforced — real security, bypasses the unreliable client flag).
2. Design these so GUEST play is not broken — guest scores handled separately (e.g. guests can play but not appear on the global leaderboard / not persist cross-device until they convert to a verified account via Layer 2).
3. Add UX: unverified logged-in users can browse but see a "verify your email" banner + a resend button when they hit a protected feature.
4. Consider migrating verify-email.jsx to an authService.verifyEmail() export (already noted in the auth-service extraction backlog).

**Also:** the `tasks` collection in lib/appwrite.js config is dead (defined, never referenced) — consider removing when convenient.

---

## Score / leaderboard / stats data model (NEXT — foundational)

The app has no user-writable persistence yet: quick-game score lives only in local React state; only collection is read-only `questions`. Need to design the Appwrite data model for: per-user score/stats (games played, accuracy, total score, streak), and a leaderboard. Many things depend on this: the verified-role permission layer (email verification fix), guest→account conversion (Layer 2), and the profile "Skor"/"Doğruluk" chips + a statistics screen (currently "Yakında" placeholders, no fake data). Design must account for guests (MS-*) — how guest scores are handled vs verified users. This is the next major task.

---

## Profile Layer 2 — guest → account conversion

The profile "Hesabını Kaydet" button is currently disabled/"Yakında" (it was bouncing to /signup because of the signup if(session) redirect). The real fix: let a guest (anonymous session) convert to a full account via Appwrite updateEmail + updatePassword on the existing session, preserving their rank/data. Depends on the score data model existing first.

---

## Profile Layer 3 — account deletion + statistics screen

Account deletion is an App Store / Play Store REQUIREMENT for publish. Also: wire real data into the profile "Skor"/"Doğruluk" chips and build a statistics screen (both currently "Yakında"). Depends on the data model.

---

## Appwrite service layer — userService / stats service

authService is done. A userService (profile/stats reads-writes) and any leaderboard service are deferred until the score data model exists. Match questionService/authService patterns.

---

## Sound issues (deferred to dev build + Jest/RNTL)

Reported: woosh sound ~5% drop rate, overlapping sounds, and various sound-play issues across the project. Deferred until a dev build + test infrastructure exists.

---

## Jest / RNTL test infrastructure

No test infra yet. authService is now testable (pure stateless functions) — good first target. Deferred until the Appwrite service layer matures.

---

## Publish prep — app.json identifiers

app.json needs android.package and ios.bundleIdentifier set before publishing. Plus account deletion (Layer 3) is a store requirement.

---

## Misc / smaller

- signup.jsx: password-hint styling İsa dislikes — address in a future auth/signup redesign.
- When adding new questions, check the uploadQuestions skippedReview report for false positives.
- Small-screen (iPhone SE / 640dp) device test pending — İsa has no small device and declined simulators; verify when possible.
- "commit" always means commit + PUSH (recurring reminder).

---

## Leaderboard V2 — full per-category system (deferred; see leaderboard-spec.md)

The existing thoughts/shared/plans/leaderboard-spec.md describes a full per-category leaderboard with a categories collection, a category-specific game screen, game_results + leaderboard_stats collections, and a scheduled recompute-ranks Appwrite Function. This is the V2 target. We are deferring it because: (a) the current quick-game is NOT category-based (10 random mixed questions), so per-category needs a new category-game mode first; (b) a CRON Function for ranks is over-engineering at current scale — query-time ranking suffices; (c) average-score+min-5-games ranking is debatable vs total-score. V2 also has good ideas to keep: display-name enforcement on signup, cleanup-user-stats Function on account deletion (needed for Layer 3 / store compliance), and the documented edge cases. Revisit when the game becomes category-based and scale grows.

---

## LoadingSpinner — use consistently for ALL blocking async work (ongoing convention)

A reusable `<LoadingSpinner>` exists at `components/LoadingSpinner.tsx` (built-in Animated API — NOT reanimated, which caused a worklets native-version mismatch; logo-ready empty center for a future logo; coral→gold rotating arc; props `size?/label?/fullscreen?`). RULE for the rest of the project: every NEW blocking/backend async operation must show `<LoadingSpinner>` (fullscreen for full-page waits, inline for in-section). Already wired: AuthContext auth gate, quick-game question load/restart, verify-email. When building new screens/features (leaderboard screen, Layer 2 guest→account, stats screen, account deletion, etc.), add the spinner to their loading states. DO NOT add it to intentionally-silent/background ops: fire-and-forget writes like `submitScore`, and the profile `getUserStats` fetch (chips show `"—"`). When the game logo is ready, drop it into the spinner's empty center and rotate the logo instead of (or with) the arc.

---

## V1 leaderboard decisions (being built now)

Global (not per-category) leaderboard. Single userStats collection (userId, userName, totalScore, gamesPlayed, bestScore, totalCorrect, totalQuestions, lastPlayedAt). Ranking by totalScore DESC. Rank computed at query time (no Function). Score writes require users("verified") role — guests (MS-*) are ephemeral (play, see local score, never persisted, never on leaderboard; they get persistence after Layer 2 account conversion). Profile Skor chip = totalScore, Doğruluk chip = totalCorrect/totalQuestions. scoreService.js matches questionService/authService patterns.
