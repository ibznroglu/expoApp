# Done — Shipped Archive

Chronological record of completed work. (Future to-dos live in thoughts/shared/backlog.md; how-we-build lives in CLAUDE.md.)

## 2026-06 session

Profile redesign (f421c5b): ornate game-UI profile — light peach bg, cut-corner coral-framed identity card (octagon frame, gold engraved border, studs, diamonds, hexagon avatar), teal/coral member-guest badge, teal "Skor" + gold "Doğruluk" stat chips. AuthButton gained gradientColors? + 'solid' variant. Guest "Hesabını Kaydet" disabled as "Yakında" (fixed signup-redirect bounce).

Workflow hardening (9fdfd13, 60c9eee): code-reviewer read-only verdict-only (Bash removed); coder never commits (PHASE_COMPLETE + STOP); planner does a user-iteration step; 4 redundant skills retired; CLAUDE.md aligned.

authService extraction (b9ad0c0, 0d59b7b): account.* moved from AuthContext into services/authService.js (8 stateless named exports), behavior-preserving. Device-tested all auth flows.

/commit skill (8abc9be): .claude/skills/commit/SKILL.md — manual /commit, splits feat/docs/chore, always pushes.

Leaderboard V1 (cc3d7f4, 9d46ce4, f2a2e16): userStats collection (real $id lowercase "userstats"; 8 attrs; indexes totalScore DESC + userId ASC; create perm users/verified; row security ON). services/scoreService.js (submitScore UPSERT + per-doc perms [read(any)+update/delete(user)], getLeaderboard, getUserStats). quick-game submits at game-end (verified-only, guest-guarded, fire-and-forget). Profile chips show real totalScore / "%accuracy" or "—". tester.md hardened to strict read-only. Device-tested: writes, upserts, guest no-write, per-doc perms.

LoadingSpinner (7d89259, 38b4905, cab02e8): components/LoadingSpinner.tsx — built-in Animated (NOT reanimated — worklets mismatch broke launch), coral→gold rotating arc on dark track, empty logo-ready center, props size?/label?/fullscreen?. Wired into AuthContext gate, quick-game load/restart, verify-email. Device-tested: launches, all 4 spinners work.
