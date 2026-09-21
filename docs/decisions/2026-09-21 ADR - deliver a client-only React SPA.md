# 2026-09-21 ADR: deliver a client-only React SPA

**Status:** Accepted  
**Date:** 2026-09-21  
**Deciders:** Product owner

## Context and Problem Statement

Polly's Food Guide is a small public reference application with no accounts, personal data,
server-side workflow, or live content dependency. It needs stable direct routes and shareable
catalogue state while remaining inexpensive to run and simple to inspect locally.

## Considered Options

- A client-only React SPA built and served as static files.
- A server-rendered application.
- A client application backed by an API and database.

## Decision Outcome

Chosen option: "a client-only React SPA built and served as static files", because all current
content can ship with the application and every current interaction can run in the browser.

React 19, TypeScript 6, Vite 8, and React Router 8 form the application baseline. Netlify serves the
generated bundle, redirects deep routes to `index.html`, and applies immutable caching only to
hashed assets. The application has no backend, database, CMS, account, analytics, server session, or
runtime content API.

Catalogue state is URL state. `/`, `/food/:foodSlug`, and `/category/:categorySlug` are stable
routes. The versioned `v=1` query contract carries selected guidance scopes, generic outcomes,
search, category, and optional preparation context; invalid shared values are removed visibly rather
than silently changing their meaning. An invalid detail-only preparation value is ignored and is not
carried into links generated from the parsed state.

### Consequences

- Good, because deployment is a deterministic static build with no runtime service or credentials.
- Good, because useful catalogue and detail states are bookmarkable and survive refresh.
- Bad, because every content change requires rebuilding and redeploying the application.
- Bad, because collaboration, accounts, or live updates would require a new architecture decision.

## Implementation Plan

- **Affected paths:** `package.json`, `src/main.tsx`, `src/app/`, `src/features/`, `public/_redirects`,
  and `netlify.toml`.
- **Pattern to follow:** Compose browser routes in `src/app/`; keep domain and data modules free of
  React, router, and browser dependencies; serialise shareable state through the versioned query
  helpers in `src/app/catalogueQuery.ts`.
- **Tests:** Route and query unit tests, direct-route Playwright tests, and `npm run build`.

## Confirmation

- [x] The production artefact is a Vite static bundle.
- [x] Direct food and category routes load through the static-host rewrite.
- [x] Shared catalogue parameters are versioned, validated, and retained across navigation.
- [x] No application path requires a backend, runtime content fetch, account, or server session.
