---
name: add-work-log
description: >-
  Appends a short entry to docs/work-log.md documenting the user prompt just
  followed. Use only when the user explicitly asks to add a work log, update
  the work log, or mentions /add-work-log. Do not run after finishing other
  tasks unless asked.
---

# Add work log

## When to run

Only when the user explicitly asks (e.g. "add work log", "update the work log", `/add-work-log`). Do not append after finishing other tasks.

## Steps

1. Read `docs/work-log.md`. If it is missing, create `docs/` and the file with a `# Work log` heading.
2. Draft one entry from the latest user prompt in this conversation (the request that was followed, not the "add work log" ask itself unless that was the only prompt).
3. Prepend the entry immediately after `# Work log` (newest first). Do not append at the bottom.
4. Do not commit unless asked.

## Entry format

```markdown
## YYYY-MM-DD — <short title>

- Prompt: <one-line restatement of the user request>
- Done: <one or two sentences of what changed>
```

Keep it minimal: no file lists, no commit messages, no pasted conversation. Summarize long prompts; do not dump the full user message. Use today's date from the session.

## Example

Prompt followed: create a Cursor skill that logs completed prompts to `docs/work-log.md`.

```markdown
## 2026-09-15 — add-work-log skill

- Prompt: Create a Cursor skill that updates the work log with minimal notes on the prompt followed.
- Done: Added the project skill and seeded `docs/work-log.md`.
```
