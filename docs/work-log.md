# Work log

## 2026-09-16 — garden min/max humidity

- Prompt: Add optional `minHumidity` and `maxHumidity` (0–100, nullable) to the garden data model and garden API schemas, including the DB migration.
- Done: Extended garden types and Zod create/update/response schemas with a min≤max refine, and added migration002 for the new SQLite columns.

## 2026-09-16 — isbot and jiti

- Prompt: Why are the `isbot` and `jiti` packages needed?
- Done: `isbot` is a runtime SSR helper in `entry.server.tsx`: crawlers get full HTML (`onAllReady`) instead of a streamed shell. `jiti` is toolchain only (Vite/ESLint/Nx loading TypeScript config); it is not used by garden or plant features.

## 2026-09-15 — CORS on the API

- Prompt: `apps/web` (localhost:4200) uses TanStack Query. SSR loaders call the API from Node and do not need CORS. After hydration, the browser refetches and mutates against `http://localhost:3000`, which is cross-origin.
- Done: Added `@fastify/cors` allowing `http://localhost:4200` so those client requests succeed. No routes, schemas, or behavior otherwise changed.
