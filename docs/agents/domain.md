# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the
codebase.

## Before exploring, read these

- **`.github/copilot-instructions.md`**: the authoritative project constraints and pointers to the
  current domain, architecture, and delivery rules.
- **`docs/architecture/overview.md`**: the domain model, catalogue, search, filtering, URL contract,
  and accessibility behaviour. Read the relevant section before changing any of them.
- **`docs/decisions/index.md`**: scan the register first, then read every relevant Accepted ADR under
  `docs/decisions/` in full before changing its governed area.
- **`docs/features/README.md`**: the feature register, lifecycle, and status rules.

This is a single-context repository. Its documentation layout is:

```text
/
├── .github/copilot-instructions.md
└── docs/
    ├── architecture/overview.md
    ├── decisions/
    │   ├── index.md
    │   └── <dated ADR>.md
    └── features/
        ├── README.md
        └── <feature>.md
```

## Use the project's vocabulary

When an output names a domain concept in an issue title, refactor proposal, hypothesis, or test name,
use the term defined in `docs/architecture/overview.md` and the relevant feature or ADR. Do not drift
to synonyms that obscure an established distinction.

If the concept is not documented, either reconsider whether it belongs to the project or note the
gap for `/domain-modeling`.

## Flag ADR conflicts

If an output contradicts an existing Accepted ADR, surface the conflict explicitly rather than
silently overriding it. Name the ADR, state the conflicting decision, and ask whether to conform to
it or create a superseding decision.
