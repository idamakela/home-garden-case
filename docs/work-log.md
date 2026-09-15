# Work log

## 2026-09-15 — CORS on the API

- Prompt: `apps/web` (localhost:4200) uses TanStack Query. SSR loaders call the API from Node and do not need CORS. After hydration, the browser refetches and mutates against `http://localhost:3000`, which is cross-origin.
- Done: Added `@fastify/cors` allowing `http://localhost:4200` so those client requests succeed. No routes, schemas, or behavior otherwise changed.
