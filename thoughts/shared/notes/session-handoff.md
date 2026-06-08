# Session Handoff Notes

## Completed
- Home screen v4 (dark gradient, user card, game modes, daily reward modal)
- Quick-game premium redesign (SVG timer arc, neon borders, category icons, entrance animations)
- Sound system (button-click, bubble, daily-prize, woosh, bravo)
- Agent system (planner/plan-reviewer/coder/code-reviewer/tester)
- Appwrite MCP connected
- Theme system (constants/theme.ts)

## Next Task
Auth screens redesign: signin, signup, verify-email, forgot-password
- Must match new dark purple theme (theme.ts)
- App Store / Play Store quality
- Use Nunito font, Ionicons, expo-linear-gradient

## Full Backlog (in priority order)
1. Auth screens redesign (signin, signup, verify-email, forgot-password)
2. Leaderboard implementation (spec ready at thoughts/shared/plans/leaderboard-spec.md)
3. Profile screen (with logout button and stats modal)
4. Upload Questions tool (uploadQuestions.js exists, needs UI solution)
5. Test infrastructure (Jest + React Native Testing Library — do after Appwrite service layer complete)
6. Arkadaşla Oyna / multiplayer (WebSocket or Appwrite Realtime, complex)
7. Turnuva sistemi (not planned yet)
8. Statistics screen (modal in profile)

## Important Files
- constants/theme.ts — all colors, typography, spacing
- context/AuthContext.js — auth logic, do not change
- app/signin.jsx, app/signup.jsx, app/verify-email.jsx, app/forgot-password.jsx

## Key Rules
- Research → Plan → Plan-reviewer → Coder → Code-reviewer → Tester
- Planner: Read, Glob, Grep only (no Write)
- Context max 60%, compact between phases
- English identifiers, Turkish UI strings
