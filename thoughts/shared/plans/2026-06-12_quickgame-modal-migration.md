# Quick-Game Exit Modal Migration to ConfirmModal

## Goal

Replace the inline `<Modal>…</Modal>` exit-confirm block in `app/(app)/game/quick-game.jsx`
with the shared `<ConfirmModal>` component so quick-game uses the same teal / spring /
sound modal system as the rest of the app. No behavior change to the actual exit logic
(navigation + sound stop), no double sounds, no orphaned imports or styles.

## Context (verified facts)

- `exitModalVisible` state — `quick-game.jsx:104`
- `handleExitPress` — `quick-game.jsx:320-323`: calls `playUISound('modal')` then
  `setExitModalVisible(true)`.
- `confirmExit` — `quick-game.jsx:325-331`: guards via `exitingRef`, calls
  `playUISound('button')`, `setExitModalVisible(false)`, then
  `setTimeout(() => router.back(), 200)`. This `exitingRef` guard + delayed `router.back()`
  is the REAL exit logic and must be preserved.
- `cancelExit` — `quick-game.jsx:333-336`: calls `playUISound('button')` then
  `setExitModalVisible(false)`.
- Inline `<Modal>` block — `quick-game.jsx:759-793`.
- `Modal` import — `quick-game.jsx:7` (from `react-native`). Grep confirms `Modal` is used
  ONLY at lines 7, 760, 793 — i.e. only the block being removed.
- Modal styles `modalOverlay`, `modalCard`, `modalTitle`, `modalButtons`, `modalCancelBtn`,
  `modalCancelText`, `modalConfirmBtn`, `modalConfirmText` live at
  `quickGameStyle.js:415-464`. Grep confirms each name appears ONLY at its own definition
  line — safe to remove.
- `ConfirmModal` (`components/ConfirmModal.tsx`) already internally:
  - plays `playUISound('modal')` on open (effect, line 45)
  - plays `playUISound('button')` on confirm (`handleConfirm`, line 69) and on cancel
    (`handleCancel`, line 73)
  - dismisses backdrop SILENTLY via `handleRequestClose` -> `onCancel()` with NO sound
    (lines 77-80)
  - supports `destructive` variant (red confirm button)
  - has a `loading` guard on backdrop/buttons
  - Props: `visible, title, message?, confirmLabel?, cancelLabel?, onConfirm, onCancel,
    icon?, destructive?, singleButton?, loading?`
- `TextCustom`, `TouchableOpacity` are used in many other places in `quick-game.jsx`
  (header, options, result screen, etc.) — DO NOT remove these imports.

> Note on backdrop sound: ConfirmModal's backdrop tap routes to `onCancel` directly
> (silent), while the explicit "Hayır" button routes through `handleCancel`
> (one `playUISound('button')`). Since our `cancelExit` will no longer play a sound
> itself (Phase 2), backdrop dismiss is fully silent and button dismiss plays exactly
> one click. This matches the desired behavior.

## Files to Change

1. `app/(app)/game/quick-game.jsx`
2. `assets/styles/quickGameStyle.js`

## Files to Create

None.

---

## Phase 1 — Swap inline Modal with ConfirmModal

1. Add import near the other component imports (after line 27,
   `import TextCustom from "../../components/TextCustom";`):
   ```jsx
   import ConfirmModal from '@/components/ConfirmModal';
   ```
   (Use the `@/` alias to match how `ConfirmModal` is imported elsewhere in the app.)

2. Replace the entire inline block at lines 759-793 (from the
   `{/* Exit confirm modal */}` comment through `</Modal>`) with:
   ```jsx
   {/* Exit confirm modal */}
   <ConfirmModal
     visible={exitModalVisible}
     title="Oyundan Ayrıl"
     message="Oyundan ayrılmak istediğine emin misin? İlerlemen kaydedilmeyecek."
     confirmLabel="Evet"
     cancelLabel="Hayır"
     destructive
     onConfirm={confirmExit}
     onCancel={cancelExit}
   />
   ```

3. Leave the exit button wiring (`onPress={handleExitPress}`) and the
   `exitModalVisible` state untouched.

Validate: `npm run lint` and `npx tsc --noEmit` pass.

---

## Phase 2 — Remove duplicate sound calls from handlers

ConfirmModal owns the open sound and the confirm/cancel button sounds. The quick-game
handlers must NOT also play them, or sounds double-fire.

4. `handleExitPress` (~line 320) — remove the `playUISound('modal')` line.

   Before:
   ```jsx
   const handleExitPress = useCallback(() => {
     playUISound('modal');
     setExitModalVisible(true);
   }, []);
   ```
   After:
   ```jsx
   const handleExitPress = useCallback(() => {
     setExitModalVisible(true);
   }, []);
   ```

5. `confirmExit` (~line 325) — remove ONLY the `playUISound('button')` line.
   PRESERVE the `exitingRef` guard, `setExitModalVisible(false)`, and the delayed
   `router.back()`.

   Before:
   ```jsx
   const confirmExit = useCallback(() => {
     if (exitingRef.current) return;
     exitingRef.current = true;
     playUISound('button');
     setExitModalVisible(false);
     setTimeout(() => router.back(), 200);
   }, [router]);
   ```
   After:
   ```jsx
   const confirmExit = useCallback(() => {
     if (exitingRef.current) return;
     exitingRef.current = true;
     setExitModalVisible(false);
     setTimeout(() => router.back(), 200);
   }, [router]);
   ```

6. `cancelExit` (~line 333) — remove the `playUISound('button')` line.

   Before:
   ```jsx
   const cancelExit = useCallback(() => {
     playUISound('button');
     setExitModalVisible(false);
   }, []);
   ```
   After:
   ```jsx
   const cancelExit = useCallback(() => {
     setExitModalVisible(false);
   }, []);
   ```

> Do NOT remove the `playUISound` import — it is still used by `restartGame` /
> retry button / result buttons elsewhere in the file. Confirm it remains referenced
> after edits.

Validate: lint + tsc pass; manually confirm each interaction plays exactly one sound.

---

## Phase 3 — Cleanup unused imports and styles

7. In `app/(app)/game/quick-game.jsx`, remove `Modal,` from the `react-native` import
   block (line 7). Grep confirmed `Modal` has no other usage. Keep all other imports:
   `Animated, Dimensions, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View`.

8. In `assets/styles/quickGameStyle.js`, remove the eight modal style definitions
   (the `// Exit confirm modal` comment block and all of `modalOverlay`, `modalCard`,
   `modalTitle`, `modalButtons`, `modalCancelBtn`, `modalCancelText`, `modalConfirmBtn`,
   `modalConfirmText` — lines ~414-464).
   Grep confirmed none of these are referenced anywhere else in the file.
   Leave surrounding blocks intact.

9. After removing styles, verify `Spacing`, `Radius`, `Colors` imports in
   `quickGameStyle.js` are still used elsewhere in the file (they are, throughout).
   Only remove an import if it becomes genuinely unreferenced.

Validate: lint + tsc pass; no unused-variable warnings for `Modal` or removed styles.

---

## Risks and Edge Cases

1. **Double sound** — if any `playUISound` call in the three handlers is left in place,
   open/confirm/cancel will fire twice. Phase 2 removes all three; verify by ear.
2. **Losing real exit logic** — `confirmExit` must keep `exitingRef` guard +
   `setExitModalVisible(false)` + `setTimeout(router.back, 200)`. Only the
   `playUISound('button')` line is removed.
3. **Removing a still-used import/style** — `playUISound`, `TextCustom`,
   `TouchableOpacity`, `Text`, `Colors`, `Spacing`, `Radius` are all used elsewhere;
   only `Modal` and the eight named modal styles are safe to remove (grep-verified).
4. **Backdrop dismiss** — ConfirmModal backdrop calls `onCancel` directly (silent).
   Confirm tapping outside the card closes the modal with NO sound.
5. **`@/` alias** — use `@/components/ConfirmModal` to match app convention; alias is
   configured in `tsconfig.json`.

---

## Validation

```bash
npm run lint
npx tsc --noEmit
```

### Manual device test checklist

- [ ] Tapping the exit button opens the teal ConfirmModal with spring pop-in + bubble sound.
- [ ] Modal shows title "Oyundan Ayrıl", message about progress not saved, "Evet" (red/destructive) + "Hayır" buttons.
- [ ] Opening the modal plays exactly ONE modal sound (no double).
- [ ] "Evet" plays one button click and exits the game (`router.back()` after 200 ms).
- [ ] "Hayır" plays one button click and closes the modal; game continues.
- [ ] Tapping the backdrop (outside the card) closes the modal SILENTLY (no sound).
- [ ] Rapid double-tap on "Evet" does not double-navigate (`exitingRef` guard holds).
- [ ] No visual remnants of the old gray modal style.

PLAN_READY: thoughts/shared/plans/2026-06-12_quickgame-modal-migration.md
