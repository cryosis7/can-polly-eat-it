# 2026-08-07 ADR: Enforce WCAG 2.2 AA with axe-core in Playwright

**Status:** Accepted
**Date:** 2026-08-07
**Deciders:** Project owner (requester)

## Context and Problem Statement

Accessibility is a stated product requirement: the repository conventions forbid colour as the only
status signal and require semantic headings and lists, native labels, keyboard-operable controls,
visible focus, and result-count announcements. F-06 delivered that experience and its acceptance
criteria were validated by hand-written role queries in React Testing Library and Playwright.

Those queries only prove that a control a test already knows about can be found by role and name.
Nothing in the repository detects a whole class of regressions: insufficient colour contrast after a
palette tweak, a duplicated or missing landmark, a duplicate `id`, an invalid ARIA attribute, an
interactive control nested inside another, a `label` pointing at a removed input, or a list element
with a non-list child. A guide whose entire purpose is to communicate risk status must not silently
become unreadable to someone with low vision or a screen reader.

## Considered Options

- Add `@axe-core/playwright` scans to the existing Chromium end-to-end suite.
- Add `vitest-axe` (an `axe-core` binding for jsdom) to the React Testing Library component tests.
- Continue with manual review and hand-written role assertions only.

## Decision Outcome

Chosen option: "add `@axe-core/playwright` scans to the existing Chromium end-to-end suite", because
it runs `axe-core` against the real rendered application with its real stylesheet at real viewport
sizes. Colour contrast, computed landmark structure, and responsive layout rules are only meaningful
against a real layout engine, and jsdom has none. The suite, its Chromium browser, and its Husky
pre-commit gate already exist, so this reuses the established validation path rather than adding a
parallel one.

The gate is configured as follows:

- **Rule set:** the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa`. Axe
  best-practice and experimental rules are not part of the gate.
- **Threshold:** zero violations. There is no allowlist, no disabled rule, and no recorded baseline
  of pre-existing violations. Any violation found while implementing this ADR is fixed in the
  application, not excluded from the scan.
- **Placement:** a dedicated `e2e/accessibility.spec.ts`, run by `npm run test:e2e` and therefore by
  the existing `npm run test:precommit` Husky gate. No separate opt-in script.
- **Viewports:** every scanned state is checked at a 320px mobile viewport and at the desktop
  default.

### Consequences

- Good, because contrast, landmark, ARIA, and structural regressions fail a commit instead of
  reaching a person who depends on them.
- Good, because the check is machine-enforced and needs no reviewer to remember the accessibility
  conventions.
- Good, because F-06's acceptance criteria gain automated evidence rather than resting on manual
  validation.
- Bad, because the pre-commit gate gets slower: roughly sixteen additional scanned states, each
  running an in-page analysis.
- Bad, because a zero-violation gate with no allowlist means an upstream `axe-core` release that adds
  or tightens a WCAG-tagged rule can fail an unrelated commit. The dependency is pinned by
  `package-lock.json`, so this surfaces at upgrade time.
- Bad, because automated scanning detects only a minority of accessibility defects. It must not be
  read as proof of conformance, and the existing hand-written assertions remain necessary.

## Decision Drivers

- Repository conventions already mandate specific accessibility behaviour that nothing enforces
  automatically.
- The accepted static-SPA ADR requires browser smoke coverage; the Playwright ADR established the
  browser suite and the pre-commit gate this extends.
- Colour contrast and computed structure require a real browser and real CSS.
- The project is local-only with no CI, so the commit boundary is the only available gate.
- A new dependency must be justified against the existing toolchain rather than added by default.

## Pros and Cons of the Options

### `@axe-core/playwright` in the end-to-end suite

- Good, because it evaluates the real DOM, real CSS, and real viewport, so contrast and layout rules
  genuinely apply.
- Good, because it reuses the existing Playwright configuration, Chromium browser, and Husky gate.
- Good, because it can scan interaction states such as the open mobile `Filters` disclosure.
- Bad, because it adds runtime to every commit.

### `vitest-axe` in the component tests

- Good, because it is fast and runs inside the existing 100%-coverage Vitest suite.
- Bad, because jsdom does not compute layout or cascade styles, so the colour-contrast rule is
  unsupported and silently returns incomplete rather than passing or failing.
- Bad, because components are rendered in isolation, so document-level rules such as landmark
  uniqueness and `html[lang]` cannot be evaluated meaningfully.

### Manual review only

- Good, because it adds no dependency and no commit-time cost.
- Bad, because it does not regress-test anything; the conventions are only as reliable as the
  reviewer's memory on the day.

## Implementation Plan

- **Affected paths:** `package.json`, `package-lock.json`, `e2e/accessibility.spec.ts` (new),
  `e2e/support/axe.ts` (new), `docs/decisions/index.md`, `README.md`,
  `docs/architecture/overview.md`, and
  `docs/features/06-improve-mobile-first-accessible-guide-experience.md`.
- **Pattern to follow:** add `@axe-core/playwright` as a `devDependency` only; it must never be
  imported from `src/`. Put a single shared helper in `e2e/support/axe.ts` that builds an
  `AxeBuilder` with `.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])` and
  asserts `results.violations` is empty, reporting the offending rule IDs and target selectors in the
  failure message so a failure is diagnosable without opening the trace. Every scan goes through
  that helper; no spec constructs its own `AxeBuilder` or applies its own tag list. Never call
  `.disableRules()` or `.exclude()` to make a scan pass. Keep the scans in a dedicated
  `e2e/accessibility.spec.ts` and leave `e2e/catalogue.spec.ts` behavioural.
- **States to scan**, each at a 320px mobile viewport and at the desktop default:
  1. `/` in its default pregnancy scope.
  2. `/` with search text and an active category filter.
  3. `/` in its zero-results state.
  4. `/` with invalid URL constraints, so the removal announcement is present.
  5. `/food/cooked-eggs` with conditions and a citation.
  6. `/food/marshmallows` with its reason links.
  7. `/category/hard-cheese`.
  8. `/food/removed-food`, the not-found route.
  Additionally scan `/` on mobile with the `Filters` disclosure opened, because the disclosed
  controls are not in the DOM layout under test otherwise.
- **Do not remove existing assertions.** Axe cannot verify a visible focus indicator, the text of a
  result-count or invalid-filter announcement, the presence of a textual status label alongside a
  colour, or the disclaimer wording. The current Playwright and React Testing Library assertions
  remain load-bearing and this change is purely additive.
- **Tests:** `npm run test:e2e` runs the new spec; `npm run test:precommit` gates the commit. The
  Vitest coverage threshold is unchanged, and no `src/` code is added for this ADR, so coverage is
  unaffected unless a scan finding requires an application fix.

## Confirmation

- [x] `@axe-core/playwright` is present in `devDependencies` and absent from `dependencies`, and is
      not imported anywhere under `src/`.
- [x] `e2e/support/axe.ts` exports one helper applying exactly the five WCAG tags above and
      asserting zero violations.
- [x] No spec calls `.disableRules()`, `.exclude()`, or otherwise narrows the rule set, and no
      violation baseline file exists.
- [x] `e2e/accessibility.spec.ts` covers all eight states plus the opened mobile disclosure, at both
      the 320px and desktop viewports.
- [x] Introducing a deliberate violation, such as removing a form label, fails `npm run test:e2e`
      with a message naming the rule.
- [x] `npm run test:e2e` passes with zero violations, with any finding fixed in the application
      rather than excluded.
- [x] `npm run test:precommit` still runs Vitest coverage before Playwright and returns non-zero if
      either fails.
- [x] No pre-existing behavioural assertion was deleted as redundant.
- [x] The requester explicitly accepts this ADR before its status changes from Proposed.

## Implementation Outcome

The first scan run found one real defect, confirming the gate was worth adding: `--status-green`
(`#699a57`) rendered white status-icon text at 3.3:1, below the 4.5:1 minimum, failing seven scans
across the catalogue and category-detail routes at both viewports. It was fixed in the application
by darkening the token to `#4c7638` (5.31:1). That token is used only for the status-icon background
and a card border mix, so no other treatment changed.

The gate was then separately proven to fail on a different rule class by temporarily pointing a
`label` at a non-existent input, which failed with `label (critical): Form elements must have
labels`. `npm run test:precommit` passes with 33 Playwright tests and the coverage threshold intact.

## More Information

This decision extends
[2026-08-05 ADR: adopt Playwright end-to-end testing and Husky pre-commit validation](<2026-08-05 ADR - adopt Playwright end-to-end testing and Husky pre-commit validation.md>),
which is itself still `Proposed`. It supersedes nothing, and it does not alter
[2026-08-05 ADR: enforce complete coverage for application source](<2026-08-05 ADR - enforce complete coverage for application source.md>).
It provides automated evidence for the accessibility acceptance criteria in
[F-06: Improve the mobile-first accessible guide experience](<../features/06-improve-mobile-first-accessible-guide-experience.md>).

Automated scanning is a floor, not a ceiling. It typically surfaces only a minority of real
accessibility barriers, so it does not replace keyboard walkthroughs or screen-reader review.
