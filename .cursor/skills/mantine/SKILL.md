---
name: mantine
description: >-
  Loads Mantine LLM docs from https://mantine.dev/llms.txt.
  Use when building or changing Mantine UI in apps/web, or when the user
  mentions Mantine components, theming, hooks, or /llms.
---

# Mantine docs

## When working with Mantine

1. Fetch the index: `https://mantine.dev/llms.txt`
2. Pick the matching page under `https://mantine.dev/llms/`
   (for example `core-button.md`, `core-select.md`, `guides-vite.md`).
3. Fetch that page before writing Mantine code.
4. Do not invent props, styles APIs, or package names from memory.

## Notes

- `https://mantine.dev/llms-full.txt` is the full dump. Only use it if
  the index is not enough; prefer the per-page files.
- Project constraints (prefer `@mantine/core`, forest theme, no duplicate
  Button atoms) live in `.cursor/rules/mantine.mdc`.
