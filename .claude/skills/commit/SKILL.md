---
name: commit
description: Stage, commit, and PUSH changes following the project's commit conventions. Invoked manually via /commit — never runs automatically.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*)
---

# Commit & Push

This project's commit rules. Follow them exactly. "Commit" ALWAYS means commit AND push — never stop at commit.

## Procedure

1. Run `git status --short` and `git diff --stat` to see what changed. Show the user the list of changed files.
2. Decide staging based on the TWO-COMMIT convention:
   - **Code changes** (app/, components/, services/, context/, constants/, assets/, lib/, utils/, app.json, etc.) → one commit with a `feat(...)`, `fix(...)`, `refactor(...)`, `chore(...)`, or `style(...)` message.
   - **Docs/plans** (thoughts/, *.md plans, backlog, CLAUDE.md) → a SEPARATE commit with a `docs(...)` message.
   - If both are present, make TWO commits in sequence (code first, then docs).
3. Stage only the intended files (never blindly `git add -A` if unrelated files are present — confirm with the user if anything unexpected appears).
4. Write a Conventional Commit message: `type(scope): summary` plus an optional bullet body for non-trivial changes.
5. Commit, then **always** `git push`. A commit without a push is incomplete.
6. After pushing, run `git status` (confirm clean tree) and `git log --oneline -1` (or -2 for two commits) and report the hash(es) to the user.

## Rules
- NEVER commit automatically or mid-phase — only when the user explicitly runs /commit.
- NEVER skip the push.
- NEVER mix code and docs/plan changes in one commit — split them.
- If unsure which files belong in the commit, ask the user before staging.
- Keep messages in English, Conventional Commit style.
