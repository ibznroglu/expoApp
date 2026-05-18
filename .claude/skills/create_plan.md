---
name: create_plan
description: Create a detailed implementation plan from research output. Iterate with the user before writing any code.
disable-model-invocation: true
---

Plan topic: $ARGUMENTS

## Steps

1. Find and read the relevant research file in thoughts/shared/research/
2. Draft a plan that answers the following questions:
   - Which files will change? (with full paths)
   - How many phases will it take?
   - What is the success criterion for each phase?
   - What are the risks and edge cases?
3. Show the plan to the user and ask: "Do you see anything missing or incorrect?"
4. Update based on user feedback — do at least one iteration

## Plan Format

For each phase:
- What will be done
- Which files will change
- Validation command (npm run lint, etc.)
- Success criterion

## Output

Save the approved plan to:
thoughts/shared/plans/YYYY-MM-DD_[topic].md

Notify the user and tell them they can continue with implement_plan.
