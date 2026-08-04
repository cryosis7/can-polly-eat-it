# Architecture Decisions

This index maps each ADR to a one-line summary so agents can find relevant decisions without
opening every file. Keep it in sync whenever an ADR is added or its status changes.

| ADR | Status | Summary |
| --- | --- | --- |
| [2026-08-04 ADR: link assessments to canonical reason foods](<2026-08-04 ADR - link assessments to canonical reason foods.md>) | Accepted | Assessments can cite a typed reason link to a canonical food such as Gelatin without inferring suitability from that food. |
| [2026-08-04 ADR: use independent guidance lists for food assessments](<2026-08-04 ADR - use independent guidance lists for food assessments.md>) | Accepted | Food suitability is an assessment against a list-specific status vocabulary, allowing pregnancy and vegetarian guidance to share one catalogue. |
| [2026-08-04 ADR: store reviewed guide content as version-controlled static data](<2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>) | Accepted | Reviewed food, condition, and citation records live in typed static data validated during development and CI. |
| [2026-08-04 ADR: model food groups as an unbounded category tree](<2026-08-04 ADR - model food groups as an unbounded category tree.md>) | Accepted | A validated parent-reference category tree supports arbitrary group depth and keeps food records separate from categories. |
| [2026-08-04 ADR: use a static TypeScript React SPA](<2026-08-04 ADR - use a static TypeScript React SPA.md>) | Accepted | React 19, TypeScript 5, Vite 7, and React Router 7 provide a client-only, statically hosted application. |
