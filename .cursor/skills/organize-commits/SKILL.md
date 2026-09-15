---
name: organize-commits
description: >-
  Analyzes uncommitted git changes, splits them into reviewable commits
  (product code first, .cursor rules and skills last), and writes messages
  per git-commit-messages.mdc. Use only when the user asks to organize
  commits, split the working tree into commits, or commit uncommitted work
  following Cursor rules. Do not run after finishing other tasks unless asked.
---

# Organize commits

## When to run

Only when the user explicitly asks (e.g. "organize commits", "split the working tree into commits", "commit uncommitted work following the rules", `/organize-commits`). Do not commit after other tasks unless asked.

## Steps

1. Inspect: `git status`, `git diff`, `git diff --cached`, `git log` (message style).
2. If the index mixes `.cursor/` with `apps/`, lockfile, or `docs/`, run `git restore --staged .` first. Working tree stays on disk.
3. Read `.cursor/rules/git-commit-messages.mdc`. Subjects: one allowed prefix (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`), then imperative lowercase. HEREDOC. No `--no-verify`. Do not push unless asked. Do not amend unless the user asks and the amend rules allow it.
4. Group files, then commit one group at a time. After all groups, `git status`. If there is nothing to commit, stop (no empty commit).

## Grouping

Leave out secrets, `.nx`, `out-tsc`, `dist`, and `.cursor/rules/nx-rules.mdc`.

Split only when groups are independently reviewable. Do not slice tests away from the feature they cover, or `package-lock.json` away from the `package.json` that changed. `docs/work-log.md` goes with the related product change, not with `.cursor/`.

**Hard rule:** all of `.cursor/rules/` and `.cursor/skills/` in the **last** commit. Never mix them with `apps/`, lockfile, or `docs/`.

## Example

Working tree has web/API changes plus new Cursor rules.

```
feat: add web routes, tanstack query, and api cors
feat: add cursor rules and skills for the web app
```
