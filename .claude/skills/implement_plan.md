---
name: implement_plan
description: Implement the plan phase by phase. Run validation after each phase and stop for manual review.
disable-model-invocation: true
---

Plan file: $ARGUMENTS

## Steps

1. Read the specified plan file in thoughts/shared/plans/
2. Ask the user which phase they want to implement
3. Implement only that phase — do not touch files not in the plan
4. Run npm run lint when the phase is done
5. Show the user the following:

## Phase Completion Report

Phase [N] complete

Changed files:
- [file path]

Validation:
- [ ] npm run lint: [result]

Manual checks:
- [ ] [things to verify]

Context usage: [X%]
If over 60%: run /compact, then continue.

## Error Protocol

- If an error occurs, fix the root cause — do not suppress the symptom
- If not resolved in 2 attempts, stop and notify the user
