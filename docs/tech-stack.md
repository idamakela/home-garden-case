# Web app tech stack

The web app is a garden and plant inventory UI on top of an existing Fastify API. The brief asks for a React meta-framework, useful tests, and a working CRUD interface — not a polished design. The API is intentionally slow (200–2000ms) and fails about 10% of the time, so the stack is chosen so the UX does not wait on every round trip.

## Stack

- **React 19** — UI components for garden and plant CRUD
- **React Router v7** — meta-framework with SSR, nested routes, and loaders
- **TypeScript ~5.9** — typed models, API wrappers, and schemas
- **Vite 7** — bundler and local dev server (`http://localhost:4200`)
- **Nx 22** — monorepo tasks so API and web run as sibling apps
- **TanStack Query v5** — server prefetch, hydrated cache, retries, and cache writes
- **Native `fetch`** — one `api()` helper shared by SSR and the browser
- **Zod** — create/update validation (required fields, humidity 0–100, related pairs)
- **Mantine 9** — forms, tables, modals, alerts, skeletons, notifications
- **Tabler Icons** — small set of icons used with Mantine
- **CSS Modules + `postcss-preset-mantine`** — scoped layout and Mantine theme tokens
- **Vitest + Testing Library + jsdom** — unit and route capability tests
- **Playwright** — thin e2e for document / MPA behavior
- **ESLint + Prettier** — consistent, reviewable code

## Why these choices

### React meta-framework

The assignment requires a React meta-framework such as React Router or Next.js. React Router v7 (`ssr: true`) fits this Nx workspace: `@nx/react/router-plugin` is already wired, and the starter pointed at Remix / React Router rather than Next.js.

Nested `/gardens` and `/gardens/:id` use a layout loader that prefetches the garden list (and plants on a deep link). `shouldRevalidate` returns false for GET moves inside `/gardens`, so list ↔ detail clicks are not blocked by that slow loader. React 19 is the component model for the CRUD screens; TypeScript keeps garden/plant types and API wrappers explicit for reviewers.

Vite keeps local DX fast while the API is the bottleneck. Nx is the given monorepo: `npx nx dev api` and `npx nx dev web` run the two apps without a second repository.

### Slow, flaky API

The API’s `slow-api` and `random-errors` plugins are the main constraint. TanStack Query is the UX lever:

- A server loader prefetches with the same query factories, then dehydrates into a `HydrationBoundary`, so the first HTML has real data instead of a client-only skeleton.
- `staleTime` of 60s avoids refetch-on-hydrate.
- The browser retries twice to absorb random 5xx; loaders use `retry: false` so a failed document load is honest.
- After create/update/delete, cache writes (`setQueryData`) update the list without another slow GET.
- The garden list uses a quiet `refetchInterval` for freshness without blocking navigation.

A thin native `fetch` wrapper (`apps/web/app/lib/api.ts`) is enough for GET/POST/PUT/DELETE. It throws `ApiError` so the UI can show “what happened + what to do” instead of raw status text. SSR and the browser share that helper; no extra HTTP client.

A later API-side cache (HTTP cache, in-memory store, or CDN) would still help frequently used list data. The web stack already hides most of that latency from the user.

### Validation and a working UI

Zod schemas gate garden and plant create/update: required names, humidity 0–100, and paired fields (latitude/longitude, min/max humidity). Those schemas are unit-tested as critical business logic.

The brief does not ask for a heavy UI. Mantine supplies accessible forms, tables, modals, alerts, skeletons, and toasts without building a design system. Tabler Icons is Mantine’s usual companion and is used sparingly. CSS Modules plus `postcss-preset-mantine` handle layout and the forest theme in `apps/web/app/theme.ts` — no Tailwind or Sass.

### Tests and maintainability

The assignment asks for useful coverage of critical logic, not snapshot theater. Vitest and Testing Library cover capabilities on a page (`user can see gardens`, add/update/delete) with stubbed `fetch`, so tests never hit the live delayed/flaky API. Isolated Zod schemas and copy mappers get unit tests. Playwright stays a thin e2e layer for document/MPA behavior. ESLint (Nx React flat config) and Prettier keep the code readable for a case review.

## Given backend

The web app did not choose the API. It is Fastify with OpenAPI at `/docs`, plus intentional delay and random failures. SSR hydrate, Query cache, retries, and cache writes are the response to that constraint.

## What we did not add

- **Next.js** — also a valid meta-framework. React Router was already in the Nx workspace, and nested gardens routes map cleanly to loaders plus `shouldRevalidate`.
- **Axios / SWR** — native `fetch` plus TanStack Query already cover SSR dehydrate, retries, and cache writes.
- **react-hook-form / Tailwind** — Mantine inputs with Zod parse, and CSS Modules, keep the dependency surface small.
