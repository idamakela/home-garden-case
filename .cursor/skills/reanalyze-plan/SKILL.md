---
name: reanalyze-plan
description: >-
  Reanalyzes the current codebase and updates the latest plan in this chat
  so remaining work matches reality. Use only when the user explicitly asks
  to reanalyze the code and update the plan accordingly, update the plan from
  the code, or mentions /reanalyze-plan. Do not run after finishing other
  tasks unless asked.
---

# Reanalyze plan

## When to run

Only when the user explicitly asks (e.g. "reanalyze the code and update the plan accordingly", "update the plan from the code", `/reanalyze-plan`). Do not reanalyze after finishing other tasks.

## Resolve this chat's latest plan

Target the plan already attached to **this conversation**, not the newest file on disk.

1. Use the plan file URI from the most recent `CreatePlan` result in this conversation, or a `.plan.md` already read/edited in this chat.
2. If that is missing, search this conversation / its agent transcript for `.plan.md` paths and take the latest one **from this chat**.
3. If none exists, stop and say so. Do not invent a plan.

**Hard rule:** Do not pick the most recently modified file in `~/.cursor/plans/` by mtime. That directory is global across chats. Do not call `CreatePlan` — that creates a **new** plan file and leaves this chat's existing plan stale.

Plans live at `~/.cursor/plans/<name>_<id>.plan.md` with YAML frontmatter (`name`, `overview`, `todos` with `id` / `content` / `status`) plus a markdown body. Update **that file in place** with file-editing tools.

## Steps

1. Read the resolved plan file (frontmatter and body).
2. Reanalyze only the code the plan cares about: listed files, related tests, and `git status` / diffs when the working tree may have moved.
3. Edit the same plan file:
   - Mark finished todos `completed`; cancel or drop steps that no longer apply.
   - Rewrite remaining steps, paths, and snippets so they match current code (not the original snapshot).
   - Keep the same plan `name` and todo `id`s when the work is the same; add todos only for newly required work.
   - Keep the body a concise actionable plan (title `#` heading, no markdown tables).
4. Do not start implementing. Do not call `CreatePlan` again. Do not commit unless asked.
5. Reply with a short summary of what changed in the plan (done vs remaining). The edited plan file is the source of truth.

## Example

Plan still says "add gardens query helper"; `apps/web/app/queries/gardens.ts` already exports it.

- Mark that todo `completed`.
- Rewrite remaining steps against the current helper (call sites, tests), not the original "create the file" snapshot.
- Leave later todos pending until the code actually has them.
