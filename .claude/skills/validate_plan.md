---
name: validate_plan
description: Compare the completed implementation against the plan and produce a validation report.
disable-model-invocation: true
---

Plan file: $ARGUMENTS

## Steps

1. Read the relevant plan file in thoughts/shared/plans/
2. Check recent commits with git log --oneline -10
3. Run npm run lint
4. Compare changed files against the plan

## Report Format

Save to thoughts/shared/prs/YYYY-MM-DD_[topic]-validation.md:

---
## Validation Report — [date]

### Correctly Implemented
- [item]

### Deviations from Plan
- [item] — [explanation]

### Missing or Incorrect
- [item]

### Validation
- [ ] npm run lint: [result]

### Overall Status
[READY / NEEDS FIXES / CRITICAL ISSUE]
---

Show the report to the user. If READY, suggest a commit.
