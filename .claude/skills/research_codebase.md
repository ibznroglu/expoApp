---
name: research_codebase
description: Research the existing codebase. DO NOT write code — read and report only.
disable-model-invocation: true
---

Research topic: $ARGUMENTS

## Rules
- Never write or modify code in this phase
- Read, understand, and report only

## Steps

1. Find all files related to the research topic
2. Read the relevant sections of each file
3. Check thoughts/shared/research/ for any prior research on this topic

## Output

When research is complete, create the following file:
thoughts/shared/research/YYYY-MM-DD_[topic].md

Content:
- Summary (3-5 sentences)
- Related files (file path and what it does)
- Existing architectural decisions
- Open questions

Notify the user after the file is created.
