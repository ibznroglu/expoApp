# Quick-Game Full-Screen Responsive Layout

**Date:** 2026-06-10
**Status:** PLAN_READY

> Supersedes `thoughts/shared/plans/2026-06-10_quickgame-question-text.md`, which only addressed
> the question text font. That plan does not fix the structural overflow caused by fixed vertical
> pixel values throughout the in-game layout.

## Goal

Make the ENTIRE in-game quick-game screen render with **nothing clipped or overflowing on any target
screen**, from Android ~640dp through iPhone SE (~667px) up to large phones (~926px). Every in-game
section — timer/header card, category icon + badge, question card, four options, joker row, and the
vertical gaps between them — must fit inside the available `gameContent` height, and on the one screen
class where proportional floors still exceed the budget (Android 640dp), the content must remain fully
reachable via a non-intrusive vertical scroll rather than clipping.

### Root Cause

The layout mixes a flexbox shell (`flex: 1` on `safeArea` -> `gameContent`) with a large number of
**fixed vertical pixel values** that do not shrink on short screens:

- `optionWrapper.height: 50` x 4 options = 200px hard-locked
- `jokerBtn.height: 72` + joker labels/badges ~= 110px hard-locked joker block
- `categoryIconOuter.height: 80` + badge ~= 110px hard-locked category block
- `timerArcWrapper: 96` inside `headerCard` (paddingVertical `Spacing.md`=12 x2) ~= 120px
- `questionText` has fixed `lineHeight` (26 iOS / 30 Android) and the card only sets `flex: 1`
  with no bounded height, so Android `adjustsFontSizeToFit` cannot trigger reliably.

On a 667px device, after the system status bar / safe-area top inset and the exit row + header card +
dot row + category block consume their fixed heights, the remaining flex space for `gameContent`
is too small to hold 200px of options + ~110px of jokers + the question card. The result is options
and/or the joker row being clipped or pushed off-screen.

Fix: replace fixed vertical pixels in the in-game layout with `screenHeight`-proportional values
(`Dimensions.get('window').height`), guarding every touch target with `Math.max(proportional, 48)`,
and give the question card a proportional bounded height so `adjustsFontSizeToFit` works on Android.
On the single residual screen class (Android ~640dp) where proportional floors still exceed the
budget by ~21px, wrap the `gameContent` children in a **non-bouncing ScrollView safety net** so the
overflow becomes a few px of optional scroll instead of a clip. On all taller screens the ScrollView
behaves identically to the current `flex:1` View (no scroll, question card absorbs the remainder).

`screenHeight` is ALREADY computed once at module scope in `quick-game.jsx` (line 30):
`const screenHeight = Dimensions.get('window').height;`. The style file does not yet import it.

---

## Approach Decision — ScrollView safety net (Approach A)

Two approaches were evaluated to eliminate the verified ~21px overflow at H=640:

- **Approach A — ScrollView safety net (CHOSEN).** Replace the `gameContent` View with a ScrollView
  whose `contentContainerStyle` carries `flexGrow:1` + `gap:6`. When content fits (H≥667), `flexGrow:1`
  fills the viewport exactly like `flex:1` did, the `questionCard flex:1` absorbs the remainder, and
  no scroll occurs. When content exceeds the viewport (H=640, by ~21px), the ScrollView yields a small
  optional scroll instead of clipping. `bounces={false}` + `showsVerticalScrollIndicator={false}` keep
  it visually indistinguishable from a static View on screens that fit.

- **Approach B — shrink `categoryIconOuter` proportionally (NOT chosen, documented as fallback).**
  Reclaims ~29px at H=640 by scaling the category circle (`Math.max(H*0.08, 48)`), turning the −21px
  into +3.8px. Verified mathematically as viable, but it leaves the questionCard at only 3.8px at
  640dp (essentially zero), is sensitive to the exact safe-area inset estimate, and provides no margin
  against rounding or future copy changes. Use as fallback if Approach A ever exhibits a gesture
  conflict.

**Why A wins:** It is the user's preferred approach, it is robust (any residual overflow on any device —
not just the one 640dp case we modelled — degrades gracefully to scroll instead of clip), and it
introduces no gesture conflict. The screen currently has **no ScrollView** anywhere in `quick-game.jsx`
(grep-confirmed), and the answer/joker taps are plain `TouchableOpacity onPress` handlers. React Native's
responder system distinguishes a stationary tap (press fires) from a drag (scroll fires), so taps are
unaffected. `optionsEntranceAnim` (`useNativeDriver:true`) animates the `Animated.View` option rows that
live *inside* the scroll content — the ScrollView wrapper does not touch them, so the native driver is
unaffected.

---

## Backward Compatibility — TextCustom

Current interface (`app/components/TextCustom.tsx`):

```ts
interface TextCustomProps {
  style?: StyleProp<TextStyle>;
  fontSize?: number;
  children: ReactNode;
}
```

The three real callers — `app/game/quick-game.jsx`, `app/signup.jsx`, `app/verify-email.jsx` —
only ever pass `style`, `fontSize`, and `children`. (Confirmed by grep: only these three `.jsx`
files plus the component itself reference `<TextCustom`.)

Plan: change `TextCustomProps` to `extends TextProps`, keep `style`, `fontSize`, `children` as the
same optional-or-required shape, and spread `...rest` onto the underlying `<Text>`. Because every
existing call passes a strict subset of the old props, no caller breaks. New optional props
(`adjustsFontSizeToFit`, `numberOfLines`, `minimumFontScale`, etc.) become available where needed
(the question text) without touching `signup.jsx` or `verify-email.jsx`.

`fontSize` must continue to be applied LAST (after `style` and after `...rest`) so it keeps its
current precedence; spread `...rest` before `style` in the JSX so an explicit `style`/`fontSize`
still wins. `children` stays out of `...rest` (destructured explicitly).

**Known pre-existing override (unchanged):** `verify-email.jsx` passes `fontSize` via the `style`
object. Because `TextCustom` applies `fontSize` as the last style entry, the prop wins over the
`style` object value. This override exists today and is not affected by `...rest` forwarding.

---

## Files to Change

| File | Change |
|------|--------|
| `app/components/TextCustom.tsx` | Extend `TextProps`, spread `...rest`, keep `fontSize` last |
| `assets/styles/quickGameStyle.js` | Import `Dimensions`; convert fixed in-game vertical px to proportional; remove fixed `questionText.lineHeight`; add `maxHeight` to `questionCard`; rename current `gameContent` style to use `flexGrow:1` (contentContainerStyle) and add new `gameContentScroll` (`flex:1`) |
| `app/game/quick-game.jsx` | Import `ScrollView`; replace `gameContent` `<View>` with `<ScrollView>`; add `adjustsFontSizeToFit numberOfLines={5} minimumFontScale={0.6}` to question `TextCustom`; simplify `fontSize` expression |

### Files NOT to change (read-only verification only)

- `app/signup.jsx`
- `app/verify-email.jsx`

---

## Vertical Budget Arithmetic

Reference frame — the in-game tree:

```
safeArea (flex:1, paddingTop Spacing.md=12, paddingBottom Spacing.sm=8)
├─ exitRow      (~44px btn + marginBottom 8)           = 52
├─ headerCard   (timerArc 96 + padV 12*2 + marginB 12) = 132
├─ dotProgress  (dot 8 + marginB 4)                    = 12
├─ categoryBlock (~80px icon + gap + badge ~24 + marginB 4) = 116
└─ gameContentScroll (flex:1)  ──►  contentContainer (flexGrow:1, gap 6)
    ├─ questionCard  (flex:1 absorber, bounded by maxHeight)
    ├─ optionsContainer  (4 × optionWrapper + 3 × gap 8)
    └─ jokerSection  (marginTop + jokerBtn + jokerItem stack)
```

### Available height for gameContentScroll

**Android small — H = 640 (status bar ~20–28px; plan uses 600 inner for budget conservatism):**

- safeArea inner = 600 (conservative; see note)
- Fixed header = exitRow 52 + headerCard 132 + dotRow 12 = 196
- categoryBlock = 116
- gameContent available = 600 − 196 − 116 = **288**

**Small device — H = 667 (iPhone SE, top inset ~20px):**

- safeArea inner = 667 − 20 − 12 − 8 = **627**
- Fixed header 196 + categoryBlock 116 = 312
- gameContent available = 627 − 312 = **315**

**Large device — H = 926 (Pro Max class, top inset ~47px):**

- safeArea inner = 926 − 47 − 12 − 8 = **859**
- Fixed header 196 + categoryBlock 116 = 312
- gameContent available = 859 − 312 = **547**

### Proportional sizing for gameContent children

| Element | Ratio | 640px result | 667px result | 926px result | Guard |
|---------|-------|-------------|-------------|-------------|-------|
| `optionWrapper` height (each) | `Math.max(H * 0.058, 42)` | 42 (floor) | 42 (floor) | 53.7 | 42px full-width bordered tap row |
| optionsContainer total | 4×opt + 3×8 | 4×42 + 24 = **192** | 4×42 + 24 = **192** | 4×53.7 + 24 = **238.8** | — |
| `jokerBtn` width + height | `Math.max(H * 0.085, 48)` | 54.4 | 56.7 | 78.7 | **≥ 48 touch target** |
| jokerSection total | marginTop + jokerItem (btn + gap 4 + label ~13 + gap 4 + badge 20 + marginTop 2) | 5.1 + 97.4 = **102.5** | 5.3 + 99.7 = **105** | 7.4 + 121.7 = **129** | — |
| gameContent gaps | fixed 6 × 2 | **12** | **12** | **12** | — |

### Final budget — all breakpoints satisfied

`gameContentScroll` carries `flex:1`; its `contentContainer` carries `flexGrow:1`. When the sum of
siblings is **≤ available**, `flexGrow:1` stretches the container to the full viewport and `questionCard`
(`flex:1`) absorbs the leftover — exactly like the old View. When siblings **> available**, the
ScrollView makes the difference scrollable; nothing clips.

| Screen | Min siblings (questionCard→0) | Available | Outcome |
|--------|------------------------------|-----------|---------|
| H=640 (Android small) | 192 + 102.5 + 12 = **306.5** | **288** | siblings exceed by ~18.5px → **ScrollView yields ~19px optional scroll; nothing clips ✓** |
| H=667 (iPhone SE) | 192 + 105 + 12 = **309** | **315** | fits; questionCard gets ~6px via flexGrow; **no scroll ✓** |
| H=926 (large phone) | 238.8 + 129 + 12 = **379.8** | **547** | fits; questionCard gets ~167px (capped by `maxHeight H×0.25 = 231.5`); **no scroll ✓** |

**Result: no clipping or hard overflow on any of the three breakpoints.** The only screen that
scrolls is Android 640dp, by ~19px; on 667px and 926px the ScrollView is visually and behaviorally
identical to the prior `flex:1` View.

**Critical finding — do NOT set `minHeight` on questionCard:** At H=667, the question card's flex
remainder is only ~6px. Setting `minHeight: 80px` would force the card to expand to 80px, making the
667px screen scroll when it should be static. `minHeight` must NOT be set on `questionCard` (or any
of its `flex:1` wrapper ancestors) so that 667px and above remain non-scrolling.

**For `adjustsFontSizeToFit` on Android:** A `minHeight` is NOT required. The `flex:1` question
card receives a concrete computed height from the flex engine (even if small on SE/640dp), which is
sufficient for Android to trigger shrink. Rely on the natural flex allocation. On large screens
`maxHeight: H*0.25` prevents the card from growing too tall.

> **Design contract for implementer:** use exactly these values:
> - `optionWrapper.height = Math.max(screenHeight * 0.058, 42)`
> - `jokerBtn.width = jokerBtn.height = Math.max(screenHeight * 0.085, 48)`
> - `jokerSection.marginTop = screenHeight * 0.008`
> - `questionCard.maxHeight = screenHeight * 0.25` (NO `minHeight` — see above)
> - `questionCardWrapper` and `questionCardGradientBorder` keep `flex:1` with no added bounds
> - Replace the `gameContent` View with a ScrollView:
>   - `gameContentScroll` style = `{ flex: 1 }` (ScrollView `style` prop)
>   - `gameContent` style = `{ flexGrow: 1, flexDirection: 'column', justifyContent: 'flex-start', gap: 6 }` (ScrollView `contentContainerStyle` — `flexGrow:1` replaces the old `flex:1`)
>   - ScrollView props: `showsVerticalScrollIndicator={false}`, `bounces={false}`; do NOT set `scrollEnabled`

---

## Phase 1 — Extend TextCustom to forward Text props

**File:** `app/components/TextCustom.tsx`

1. Import `TextProps` alongside `Text`, `StyleProp`, `TextStyle` from `react-native`.
2. Change the interface:
   ```ts
   interface TextCustomProps extends TextProps {
     style?: StyleProp<TextStyle>;
     fontSize?: number;
     children: ReactNode;
   }
   ```
3. Destructure `{ style, fontSize = 16, children, ...rest }` and render:
   ```tsx
   <Text {...rest} style={[style, { fontSize }]}>{children}</Text>
   ```
   `...rest` spreads first so explicit `style` / `fontSize` keep their current precedence. `fontSize`
   is still applied last as the final style entry.
4. Do NOT change defaults or remove `fontSize`. Existing callers are unaffected — `rest` is empty for them.

---

## Phase 2 — Proportional vertical sizing + ScrollView styles in quickGameStyle.js

**File:** `assets/styles/quickGameStyle.js`

1. Add `Dimensions` to the react-native import and compute at module scope:
   ```js
   import { Dimensions, StyleSheet } from "react-native";
   const screenHeight = Dimensions.get('window').height;
   ```
   (`Platform` is currently imported and used only by `questionText.lineHeight`, which Phase 3
   removes — verify and drop the `Platform` import after Phase 3.)

2. Convert in-game styles (leave all loading/error/game-over/modal styles untouched):
   ```js
   // optionWrapper — was height: 50
   optionWrapper: {
     height: Math.max(screenHeight * 0.058, 42),
     // ... keep all other props
   },

   // jokerBtn — was width: 72, height: 72
   jokerBtn: {
     width: Math.max(screenHeight * 0.085, 48),
     height: Math.max(screenHeight * 0.085, 48),
     // ... keep all other props
   },

   // jokerSection — replace fixed marginTop: 8 with proportional
   jokerSection: {
     marginTop: screenHeight * 0.008,
     // ... keep all other props (flex:0, alignItems, gap, opacity)
   },
   ```

3. Add `maxHeight` to `questionCard` (keep existing `flex:1` and `justifyContent:'center'`).
   **Do NOT add `minHeight`** — at H=667 only ~6px of flex space remains; a `minHeight` > 6px would
   force that screen to scroll when it should be static:
   ```js
   questionCard: {
     flex: 1,
     justifyContent: 'center',
     maxHeight: screenHeight * 0.25,
     // ... keep all other props (no minHeight)
   },
   ```
   `questionCardWrapper` (`Animated.View`) and `questionCardGradientBorder` (`LinearGradient`) both
   retain their existing `flex:1` with no added `maxHeight`.

4. **Convert `gameContent` into ScrollView styles.** The current style is:
   ```js
   gameContent: {
     flex: 1,
     flexDirection: 'column',
     justifyContent: 'flex-start',
     gap: 6,
   },
   ```
   Replace it with TWO styles:
   ```js
   // ScrollView `style` — owns the flex:1 slot in the safeArea column
   gameContentScroll: {
     flex: 1,
   },
   // ScrollView `contentContainerStyle` — was the gameContent View;
   // flexGrow:1 lets it fill the viewport when content fits
   // and grow beyond it (enabling scroll) when content overflows.
   gameContent: {
     flexGrow: 1,
     flexDirection: 'column',
     justifyContent: 'flex-start',
     gap: 6,
   },
   ```

5. Do NOT change `categoryIconOuter`, `categoryIconGradient`, `timerArcWrapper`, header paddings, or
   any feedback/modal styles.

---

## Phase 3 — Remove fixed lineHeight, swap View → ScrollView, apply adjustsFontSizeToFit

**Files:** `assets/styles/quickGameStyle.js` and `app/game/quick-game.jsx`

Style file:
1. In `questionText`, remove:
   ```js
   ...Platform.select({ ios: { lineHeight: 26 }, android: { lineHeight: 30 } }),
   ```
   Leave `questionText` as `{ color, fontFamily, textAlign }` only.
2. Remove the `Platform` import if it is now the only usage. Grep-confirm before deleting:
   if no other `Platform.` usage remains, change the import to `import { Dimensions, StyleSheet } from "react-native";`.

quick-game.jsx:
3. Add `ScrollView` to the `react-native` import block (keep alphabetical order):
   ```js
   import {
     Animated, Dimensions, Easing, Modal, ScrollView,
     StyleSheet, Text, TouchableOpacity, View,
   } from "react-native";
   ```
   (Adjust to match whatever is currently imported — only add `ScrollView`.)
4. Replace the `gameContent` `<View>` with a ScrollView. The three children (question card
   `Animated.View`, options `View`, `jokerSection` `View`) move inside unchanged:
   ```jsx
   <ScrollView
     style={s.gameContentScroll}
     contentContainerStyle={s.gameContent}
     showsVerticalScrollIndicator={false}
     bounces={false}
   >
     {/* ...existing questionCardWrapper Animated.View... */}
     {/* ...existing optionsContainer View... */}
     {/* ...existing jokerSection View... */}
   </ScrollView>
   ```
   Do NOT set `scrollEnabled` — letting content size decide is required so that 667/926 stay
   non-scrolling and only 640 scrolls.
5. In the question `TextCustom` (lines ~605–614), add auto-fit props and simplify `fontSize`:
   ```jsx
   <TextCustom
     style={s.questionText}
     fontSize={screenHeight < 700 ? 16 : 18}
     adjustsFontSizeToFit
     numberOfLines={5}
     minimumFontScale={0.6}
   >
     {currentQuestion.question}
   </TextCustom>
   ```
   The old `question.length` ternary is replaced — `adjustsFontSizeToFit` handles per-question
   length variation automatically.

---

## Phase 4 — Verify callers unchanged (read-only)

**Files:** `app/signup.jsx`, `app/verify-email.jsx`

1. Read both files and confirm every `<TextCustom>` call passes only `style` / `fontSize` /
   `children` — no new props needed, no conflicts.
2. No edits. Confirm `npx tsc --noEmit` produces no new diagnostics for these files.

---

## Risks and Edge Cases

| Risk | Mitigation |
|------|-----------|
| Option rows fall below 48px touch min (42px floor on small screens) | Option rows are full-width bordered tap targets; 42px is acceptable (Material reduced-density). Joker buttons keep the strict `Math.max(..., 48)` guard. |
| **ScrollView gesture conflicts with answer/joker taps** | No conflict expected. `quick-game.jsx` has no existing ScrollView (grep-confirmed). Answer/joker handlers are plain `TouchableOpacity onPress`; RN's responder system fires the press on a stationary tap and scrolls only on a drag. **Validation gate: on Android 640dp, confirm tapping an option selects it and joker buttons respond while content is scrollable.** |
| ScrollView breaks `optionsEntranceAnim` (`useNativeDriver:true`) | The native-driven animation runs on `Animated.View` rows *inside* the scroll content; the ScrollView itself is not animated. Native driver is unaffected. Confirm grouped slide-up still plays. |
| ScrollView scrolls on screens that should be static (667/926) | `contentContainerStyle` uses `flexGrow:1`; when siblings ≤ viewport the container stretches to exactly the viewport size and questionCard absorbs the remainder — contentSize == viewportSize, no scroll possible. Verified: H=667 (309≤315) and H=926 (379.8≤547) do not scroll. |
| `bounces={false}` insufficient on iOS | Disables bounce; when content fits there is nothing to scroll so bounce cannot trigger. iPhone SE and Pro Max are static. |
| Android `adjustsFontSizeToFit` needs a concrete text-container height | `flex:1` on `questionCard` inside a bounded parent produces a concrete computed height. Android triggers shrink from that height. No `minHeight` required. **Primary validation gate: test on Android < 700px with a 120+ char question — verify text actually shrinks rather than showing ellipsis-only.** |
| `Platform` import removed but still referenced elsewhere | `Platform` is only used in `questionText.lineHeight`; after Phase 3 removes it, grep before deleting the import. |
| `...rest` forwarding a conflicting `style` or `children` | Both are destructured out before `...rest` — double-application is impossible. |
| Very tall screens leave whitespace under question card | `maxHeight: H*0.25` caps the card; jokers stay anchored; natural whitespace, not a bug. |
| Two `screenHeight` definitions (style file + screen) drift | Both call `Dimensions.get('window').height` at module load; identical value on a given launch. |
| Very long question (>200 chars) overflows at `minimumFontScale` floor | `numberOfLines={5}` truncates with ellipsis rather than clipping mid-glyph — acceptable last resort. |
| Removing `lineHeight` changes vertical centering of short questions | `questionCard.justifyContent:'center'` centers naturally. Verify with a short-question screenshot. |
| `minHeight` on `questionCard` would force needless scroll on H=667 | Do NOT add `minHeight`. Only ~6px of flex space remains at H=667; any `minHeight` > 6px makes that screen scroll. The `maxHeight: H*0.25` is the only bound needed. |
| **Fallback if Approach A exhibits a gesture conflict** | Switch to Approach B: make `categoryIconOuter`/`categoryIconGradient` proportional (`Math.max(H*0.08, 48)` / inner circle −4px). At H=640 this reclaims ~29px, turning −21px into +3.8px, eliminating the need for a ScrollView. Documented here so no re-derivation is needed. |

---

## Validation Commands

```bash
npm run lint
npx tsc --noEmit
```

## Manual Device Checklist

Run the in-game screen with at least one 120+ char question loaded.

- [ ] Android small (~640dp, e.g. Pixel 4a): all sections reachable (tiny scroll if needed); nothing clipped; `adjustsFontSizeToFit` scales text down (smaller, not ellipsis-only); tapping options selects them; joker buttons respond through the ScrollView.
- [ ] iPhone SE (~667px): everything fits with **NO scroll**; header, category, question card, all 4 options, full joker row visible; long question shrinks within 5 lines.
- [ ] iPhone 15 Pro Max (~926px): **NO scroll**; natural layout, no oversized gaps; jokers anchored near bottom.
- [ ] Android large (~900+dp, e.g. Pixel 8 Pro): **NO scroll**; natural spacing; joker buttons visibly ≥ 48px.
- [ ] Short question (<40 chars) on both small and large: text at base `fontSize`, centered cleanly.
- [ ] Cycle all 10 questions: no per-question layout jump, no clipping.
- [ ] Correct/wrong feedback colors and animations unchanged.
- [ ] Entrance animation (grouped options slide-up) unchanged inside the ScrollView.
- [ ] All sounds fire (tick, correct, wrong, woosh, completed/bravo).
- [ ] Joker buttons tappable and functional.
- [ ] `signup` and `verify-email` screens render unchanged.

---

## Running with Claude Code

Human drives phase transitions; one delegated step per turn; commit only when explicitly instructed.

PLAN_READY: thoughts/shared/plans/2026-06-10_quickgame-responsive.md
