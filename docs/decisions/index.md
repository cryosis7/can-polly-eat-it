# Architecture Decisions

This register records the durable decisions that govern the application as it exists now. It is not
a chronological log of implementation changes. Git history carries decisions that were completely
overturned; a replacement ADR must state the whole current decision without requiring readers to
reconstruct amendments or supersession chains.

Read the relevant Accepted ADR in full before changing its governed area. Update this index whenever
an ADR is added, replaced, or changes status.

| ADR | Status | Summary |
| --- | --- | --- |
| [2026-09-23 ADR: enforce local quality gates and fixed-UTC production promotions](<2026-09-23 ADR - enforce local quality gates and fixed-UTC production promotions.md>) | Accepted | Local quality gates remain mandatory while GitHub Actions promotes `main` to the `production` release branch at 20:00 UTC or on manual dispatch. |
| [2026-09-21 ADR: permit review-gated AI guidance drafting](<2026-09-21 ADR - permit review-gated AI guidance drafting.md>) | Accepted | A repository skill may prepare source-cited local content drafts from a maintainer-supplied credible source, but a human must review every claim before publication. |
| [2026-09-21 ADR: enforce local quality gates](<2026-09-21 ADR - enforce local quality gates.md>) | Superseded | Replaced by the 2026-09-23 local-quality-gates and production-promotions ADR. |
| [2026-09-21 ADR: resolve guidance conservatively without inference](<2026-09-21 ADR - resolve guidance conservatively without inference.md>) | Accepted | Guidance resolves nearest-subject-first on separate preparation axes, preserves authored layers and source positions whole, and falls back only to neutral not-assessed. |
| [2026-09-21 ADR: model guidance as independent lists and sources](<2026-09-21 ADR - model guidance as independent lists and sources.md>) | Accepted | List-owned status vocabularies, citation policies, and attributed source assessments provide several perspectives over one shared catalogue. |
| [2026-09-21 ADR: model catalogue subjects and preparation independently](<2026-09-21 ADR - model catalogue subjects and preparation independently.md>) | Accepted | Foods and assessable categories use an unbounded parent-reference tree, while preparation is a separate global dimension declared by foods and assessments. |
| [2026-09-21 ADR: store reviewed guidance as validated static data](<2026-09-21 ADR - store reviewed guidance as validated static data.md>) | Accepted | Human-reviewed catalogue and guidance records live in typed, version-controlled data and pass Zod relationship validation before rendering. |
| [2026-09-21 ADR: deliver a client-only React SPA](<2026-09-21 ADR - deliver a client-only React SPA.md>) | Accepted | React 19, TypeScript 6, Vite 8, and React Router 8 deliver a statically hosted, URL-addressable application without a backend or runtime content API. |

## Maintaining this register

- Record a durable technical choice with meaningful alternatives, not a feature, bug fix, or
  implementation step.
- Refine an ADR in place when the choice is unchanged. When the current choice changes, write a
  self-contained replacement and remove the wholly obsolete record once all references are updated.
- Keep rationale, consequences, affected paths, and confirmation checks in each ADR; do not make an
  agent infer the decision from code or Git history.
