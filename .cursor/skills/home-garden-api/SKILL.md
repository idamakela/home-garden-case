---
name: home-garden-api
description: >-
  Loads the Home Garden API contract from the running Fastify OpenAPI JSON.
  Use when building or changing apps/web against the API, planning
  frontend features that call the backend, or when the user mentions API
  endpoints, gardens, plants, users, or /docs.
---

# Home Garden API contract

## When working with the API

1. Prefer the live OpenAPI JSON (same source as Swagger UI):
   `http://localhost:3000/docs/json`
2. Fetch it with WebFetch, browser tools, or `curl` before designing
   clients, routes, or types.
3. If the fetch fails, tell the user to start the API with
   `npx nx dev api`, then retry.
4. Fallback if the server is down: read
   `apps/api/src/app/routes/` and `apps/api/src/app/schemas/`.

## Notes

- Base URL for the API is `http://localhost:3000` (see README).
- Do not invent endpoints; use the OpenAPI doc or Zod route schemas.
