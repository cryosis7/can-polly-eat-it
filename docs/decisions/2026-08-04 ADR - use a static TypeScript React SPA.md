# 2026-08-04 ADR: Use a Static TypeScript React SPA

**Status:** Accepted
**Date:** 2026-08-04
**Deciders:** Project owner (requester)

## Context and Problem Statement

The project needs a responsive React application that lets one person browse reviewed food guidance,
search it, apply filters, and share a result. The first release has no accounts, server-owned state,
or live data requirement, so the initial architecture must stay simple while retaining deep links to
food details and a clear path to later expansion. A static SPA is not deployable without a concrete
deep-route and cache policy, particularly because stale health guidance is a trust risk.

## Considered Options

- React 19, TypeScript 5, Vite 7, and React Router 7 deployed as a static SPA.
- GitHub Pages hosting for the Vite SPA.
- A React framework with server-side rendering and a backend from the first release.
- A no-build static HTML application.

## Decision Outcome

Chosen option: "React 19 with TypeScript 5, Vite 7, React Router 7, and Netlify static hosting",
because it directly satisfies the React SPA requirement, keeps curated data private to the build
rather than a runtime service, and provides a concrete deep-route and cache configuration.

### Consequences

- Good, because static hosting, reviewable deployment artefacts, and local-first development are
  sufficient for the first release.
- Good, because a strict TypeScript domain layer can validate complex editorial data before it
  reaches the UI.
- Bad, because every data change requires a new build and deployment.
- Bad, because static hosting must be configured with an `index.html` route fallback for deep links.
- Bad, because Netlify configuration and deploy-preview verification are part of every release.
- Bad, because future accounts, shared editing, or live updates would require a new backend/CMS
  decision.

## Decision Drivers

- The catalogue is initially small, read-only, and manually reviewed.
- The application stores no personal health information.
- Search and filters must be fast and bookmarkable without server state.
- The HTML entry point must revalidate promptly while immutable hashed assets remain cacheable.
- The codebase is currently empty, so an explicit convention avoids accidental framework sprawl.

## Pros and Cons of the Options

### React 19, TypeScript 5, Vite 7, and React Router 7 as a static SPA

- Good, because Vite supplies a maintained React TypeScript starter, development server, and
  production build without defining a server architecture.
- Good, because React Router 7 supports stable `/food/:foodSlug` routes and
  `URLSearchParams`-based shareable catalogue state.
- Bad, because first-load content is not server-rendered.

### GitHub Pages hosting for the Vite SPA

- Good, because it is integrated with GitHub repositories, can deploy from GitHub Actions without a
  separate hosting account, and is suitable for a public static site.
- Good, because an implementation using hash routing can run without server-side route rewrites.
- Bad, because GitHub Pages does not provide a configurable rewrite from `/food/<slug>` to
  `index.html`; browser-router deep links would return a 404. A `404.html` SPA workaround still
  produces a 404 response and adds path-recovery complexity.
- Bad, because hash routing would change the intended clean, shareable URLs to
  `/#/food/<slug>`, and GitHub Pages does not provide the chosen per-path cache-header policy for
  prompt HTML revalidation.

### React framework with server-side rendering and a backend

- Good, because it provides a natural home for later accounts, authentication, and editorial APIs.
- Bad, because it adds hosting, security, persistence, and operational work before a product need
  exists.

### No-build static HTML application

- Good, because it has the smallest deployment footprint.
- Bad, because it does not meet the React SPA requirement and makes typed composition, routing, and
  testable interactive filters unnecessarily difficult.

## Implementation Plan

- **Affected paths:** `package.json`, lockfile, `vite.config.*`, `tsconfig*.json`, `src/app/`,
  `src/main.tsx`, `src/routes/`, `public/_redirects`, `netlify.toml`, and CI workflow files.
- **Pattern to follow:** Scaffold with Vite's React TypeScript template; pin exact generated package
  versions in the lockfile. Enable strict TypeScript. Use React Router for `/` and
  `/food/:foodSlug` with a `/` base path; use the versioned URL query contract for catalogue and
  detail-list state. Configure Netlify's `/* /index.html 200` rewrite, no-cache/revalidate headers
  for the HTML entry point, and immutable headers for Vite hashed assets. Keep `src/domain/` free
  of React imports. See the 2026-08-07 amendment below for the current version baseline.
- **Tests:** Run Vite build, TypeScript check, linting, Vitest unit tests, React Testing Library
  rendering tests, and a browser smoke test that loads a deep food route directly.

## Confirmation

- [x] The generated manifest uses the major versions recorded in the current version baseline, with
  exact resolved versions committed to the lockfile.
- [ ] The deployed static host rewrites `/food/<slug>` to the SPA entry point.
- [ ] A Netlify deploy preview loads `/food/<slug>?v=1&list=<list-slug>` directly.
- [ ] `netlify.toml` revalidates the HTML entry point and makes only hashed Vite assets immutable.
- [ ] The home route and a direct food-detail route load without a server API.
- [ ] Search/filter state is represented in the URL rather than a server session.
- [ ] `src/domain/` has no React, browser-router, or DOM dependency.

## Amendments

### 2026-08-07: uplift the version baseline

The original decision named React 19, TypeScript 5, Vite 7, and React Router 7. Those specific
majors are amended, not the architecture: this remains a client-only, statically hosted React SPA
with a strict TypeScript domain layer and a versioned URL query contract.

The trigger was a high-severity advisory against React Router 7
([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2), RSC-mode CSRF), which is
only fixed in React Router 8. The remaining dependencies were brought to their current releases in
the same change so the toolchain stays on one supported baseline rather than drifting.

The current version baseline is:

| Package | Was | Now |
| --- | --- | --- |
| react-router | 7 | 8 |
| typescript | 5 | 6 |
| vite | 7 | 8 |
| vitest, @vitest/coverage-v8 | 3 | 4 |
| eslint, @eslint/js | 9 | 10 |
| eslint-plugin-react-hooks | 5 | 7 |
| jsdom | 26 | 30 |
| @vitejs/plugin-react | 5 | 6 |
| @testing-library/jest-dom | 6 | 7 |
| globals | 16 | 17 |
| eslint-plugin-react-refresh | 0.4 | 0.5 |

React 19 is unchanged. Three consequential notes for a future agent:

- **TypeScript is deliberately held at 6, not the latest 7.** No stable `typescript-eslint` release
  supports TypeScript 7: version 8.66.0 declares `peer typescript ">=4.8.4 <6.1.0"`, so a clean
  `npm install` with TypeScript 7 fails with `ERESOLVE`. TypeScript 6.0.3 is the highest version
  that installs cleanly while keeping TypeScript-aware linting. Do not raise TypeScript past 6.0.x
  until `typescript-eslint` publishes a stable release widening that peer range; do not work around
  it with `--legacy-peer-deps`.
- `eslint-plugin-react-hooks` 7 moved its flat configuration to
  `configs.flat['recommended-latest']`; the old `configs['recommended-latest']` is legacy-shaped and
  throws under ESLint 10. Both expose the same 17 rules.
- That plugin's new `react-hooks/set-state-in-effect` rule flags the deferred live-region
  announcement in `src/features/catalogue/CataloguePage.tsx`. The deferral is deliberate and is
  suppressed with an explanatory comment: `role="status"` announces content *changes*, so deriving
  the message during render would silence it for screen-reader users.

Verified from a clean `node_modules` by `npm install`, `npm run lint`, `npm run typecheck`,
`npm run build`, and `npm run test:precommit` (88 unit tests at 100% coverage, 36 Playwright tests
including the WCAG 2.2 AA scans), with `npm audit` reporting no vulnerabilities.

## More Information

This ADR governs the application foundation described in
[`docs/architecture/overview.md`](../architecture/overview.md) and Phase 0 of
[`docs/implementation-plan.md`](../implementation-plan.md). A future requirement for accounts,
CMS editing, or live updates requires a new ADR rather than silently adding a backend.
GitHub Pages can be reconsidered by replacing this proposal with an accepted ADR that adopts hash
routing and GitHub Actions deployment, or by accepting the limitations of a 404 fallback.
