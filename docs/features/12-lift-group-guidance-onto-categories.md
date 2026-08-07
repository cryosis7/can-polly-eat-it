# F-12: Lift Group-Level Guidance onto Categories

**Status:** Proposed

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-09: Assess and Browse Food Categories](<09-assess-and-browse-food-categories.md>), [F-11: Make the Browse Hierarchy Legible and Collapsible](<11-make-browse-hierarchy-legible.md>)

**Governing decisions:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [model food groups as an unbounded category tree](<../decisions/2026-08-04 ADR - model food groups as an unbounded category tree.md>), and [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>)

## Goal

As Polly, I need a rule that a source states about a whole group to be shown once against that group,
so that the guide does not repeat the same advice on near-identical entries and I can tell which
entries are genuinely distinct foods.

## Problem evidence

F-09 established categories as assessable subjects and required that "the generic food records that
only stand in for a category rule are retired", but the migration retired only three. The current
content still contains:

- One category, `Pasteurised cottage cheese, cream cheese, etc`, whose two direct foods carry
  byte-identical status, summary, conditions, and citation locator, while the category itself is
  unassessed. This is the same shape as `Hard cheese`, which already carries its rule at the category
  level.
- 38 categories that contain exactly one direct food, no subcategories, and no category assessment.
  In 30 of them the food shares the category's identifier, for example `Raw fish` → `Raw fish`,
  `Processed meats` → `Processed meats`, and `Canned foods` → `Canned foods`. The food record adds no
  information the category does not already carry, and its guidance is a group rule wearing a food's
  clothes.

## Required behaviour

- Where every direct food of an unassessed category carries the identical reviewed rule, that rule is
  authored once as a category assessment with an authored `scopeStatement`, and the duplicate food
  assessments are removed. Those foods then inherit, and disclose their origin, through the existing
  resolution order.
- Where a category exists only to wrap a single food that stands in for the group rule, the food
  record is retired and its rule is authored on the category, continuing the retirement F-09 began.
- Where the source itself makes an open-ended group claim and separately names an exception, that
  group rule may be lifted onto the category even though not every direct food carries it, with the
  exception authored as a food-level assessment that overrides it. This is permitted only on the
  evidence of the source's own wording, is recorded case by case in this brief, and is never inferred
  from the foods happening to look similar.
- A food that names a genuinely specific item keeps its own food record and its own assessment. A
  category with more than one meaningfully distinct food is not collapsed.
- Every alias on a retired food record moves to its category, so the same search terms still reach the
  same guidance. Where the retired food's name differs from the category name, that name is kept as an
  alias.
- A merged category takes the source's own heading as its name, except where the retired food's name
  carries a qualifier that narrows the claim, in which case the narrower name survives. Broadening a
  merged entry's name is treated the same as broadening the claim and is not permitted.
- Each moved rule keeps its exact reviewed status, summary, conditions, scenarios, and citation
  locator. No wording is reworded, inferred, merged, or re-derived, and no source is re-fetched.
- A rule is lifted only onto the category that the source itself scopes it to. Guidance is never
  raised to an ancestor broader than the source's own claim.
- Content validation continues to enforce that a category assessment has a `scopeStatement`, a food
  assessment does not, no subject is assessed twice in one guidance list, and every assessed subject
  sits inside its list's declared coverage.
- The vegetarian guidance list is migrated on the same rules as the pregnancy list, independently, with
  no guidance crossing between lists.

## Non-goals

- Changing any reviewed guidance wording, status, or source. A category assessment's `scopeStatement`
  is newly authored because the schema requires one, but it restates the scope the source already
  claims rather than extending or narrowing it.
- Inventing new categories or new guidance. The tree changes only where a resolution above requires
  it: the sauces merge produces a `Commercial…` child category, and the sprouts merge splits one
  mirror food into two child foods under a category that carries the single existing rule. Neither
  authors a rule that is not already in the reviewed source.
- Inferring guidance from a food's name, a sibling, or an unassessed ancestor.
- Adding an inheritance opt-out flag; an exception is authored as a food-level assessment.
- Collapsing the fish species beneath `Fish mercury guidance`, which are genuinely distinct foods with
  differing serving limits.
- Any browse-view presentation change, which belongs to [F-11](<11-make-browse-hierarchy-legible.md>).

## Assumptions and open questions

- This applies an accepted ADR rather than making a new decision, so it needs no new ADR. If review
  finds a case where the source's scope is ambiguous, that case is left as a food assessment and
  recorded rather than guessed.
- Retiring a food changes its public URL from `/food/<slug>` to `/category/<slug>`. The application is
  unreleased, so no redirect is required, consistent with F-09.
- F-11 is a prerequisite rather than merely related: until an assessed category renders its summary
  and source like a food does, retiring a mirror food would visibly lose that summary and source from
  the browse view.
- Nine mirror categories name their food differently from the category. In every one of the nine the
  category name is already the source's own heading and the food name is an editorial addition, so the
  naming rule is: **the category name wins, and the retired food's name is kept as an alias** so the
  former wording still finds the entry. This is overridden only where the food name carries a
  qualifier that narrows the claim, because adopting the broader name would present the rule as
  covering more than the source scopes it to.
- Resolved, naming rule applied as-is (six cases): `Raw eggs` over "Raw eggs and foods containing raw
  eggs"; `Cooked meats` over "Cooked meat and poultry"; `Raw meat` over "Raw meat and poultry";
  `Smoked fish, shellfish and crustacea` over "Chilled smoked or pre-cooked seafood"; `Cooked foods`
  over "Leftover cooked foods"; and `Red or green seaweed` over "Red and green seaweed", the source
  using "or". The dropped wording is not lost, because the existing aliases already carry it, for
  example `eggnog`, `tiramisu`, `chicken`, and `mince`. `Cooked foods` is only meaningful beneath its
  `Leftovers` parent, which [F-11](<11-make-browse-hierarchy-legible.md>) guarantees is always
  rendered.
- Resolved, sauces: the merged entry is **not** renamed. `Sauces, dressings and spreads` keeps the
  source's heading and becomes a plain browse heading, and the retired mirror food becomes a child
  category named `Commercial sauces, dressings and spreads` carrying the manufacturer rule unchanged.
  [F-13](<13-surface-raw-egg-foods.md>) then adds the `Home-made sauces` sibling. Each qualifier
  therefore lives on the child that earns it, and no rule is broadened. This is the one merge in this
  feature that produces a child category rather than folding the rule into the existing parent.
- Resolved, sprouts: the mirror food is split rather than merged. `Sprouts and enoki mushrooms` keeps
  the source's heading and carries the single cited rule at category level, with `Seed sprouts` and
  `Enoki mushrooms` as distinct child foods that inherit it. They are unrelated foods and deserve
  separate entries, but the rule is authored once rather than copied to both, and the child name
  `Seed sprouts` removes the "Brussels sprouts" ambiguity that the bare source heading carries. The
  ten seed-sprout aliases move to `Seed sprouts` and `enoki mushrooms` to `Enoki mushrooms`.
- Resolved, stuffing: the merged category keeps the source's heading `Stuffing`, and the poultry scope
  is authored into the rule's `scopeStatement` and conditions rather than into the entry's name, so a
  reader looking up stuffing of any kind finds the entry and then reads the scope the source actually
  claims. The retired food name "Chicken or turkey stuffing" is kept as an alias.
- All nine differing-name cases are now resolved; no naming question remains open in this feature.
- The sauces collision described below is resolved by F-13 rather than by this feature. Until F-13
  lands, the commercial rule must stay on a `Commercial…`-qualified subject so that a home-made,
  raw-egg product is never presented under advice about following a manufacturer's instructions.
- Defect present in content today, independent of this migration and resolved by F-13: the amber sauces
  rule reads
  "refrigerate opened products and follow their manufacturer storage and heating instructions", which
  presumes a manufactured product, while `home-made mayonnaise` is an alias of the red, avoid entry for
  raw eggs. Naming the merged category `Sauces, dressings and spreads` without the "Commercial"
  qualifier would file a home-made, raw-egg product under advice that cannot apply to it.
- Resolved, cereals: the shared `breakfast-cereals`/`rice`/`pasta` rule is lifted onto the `Cereals`
  category, with `fresh filled pasta` keeping its own assessment as a food-level override. This does
  not meet the automatic-lifting test above, because not every direct food carries the identical rule,
  so it is recorded as a deliberate exception justified by the source. The shared rule's own locator
  reads `Breads and cereals: Cereals — Breakfast cereals, rice, pasta, and similar`: the phrase "and
  similar" is the source making an open-ended group claim rather than three item-specific ones, and
  the source separately carves out fresh filled pasta at locator `Breads and cereals: Cereals`. The
  source's structure is therefore already a group rule plus a named exception. Leaving the rule at
  food level would represent an explicitly open-ended claim as though it applied to exactly three
  foods.
  - The three foods keep their records and lose only their own assessments, inheriting from `Cereals`
    with its origin disclosed. They are distinct real foods, so this is not a mirror collapse.
  - `Cereals` needs an authored `scopeStatement` that tracks the source's wording, covering breakfast
    cereals, rice, pasta and similar cereal foods.
  - Accepted consequence: `Cereals` renders as a green entry directly above an amber
    `Fresh filled pasta`. This is the same shape already accepted for `Hard cheese` above `Parmesan`,
    and the child's own status stays visible beneath it.

## Acceptance criteria

- `Pasteurised cottage cheese` and `Pasteurised cream cheese` have no assessment of their own, and
  both display the category's rule with its status, summary, conditions, citation, and a statement of
  the breadth of the claim.
- No unassessed category remains whose direct foods all carry an identical reviewed rule.
- `Breakfast cereals`, `Rice`, and `Pasta` have no assessment of their own and show the `Cereals` rule
  with its origin disclosed, while `Fresh filled pasta` shows only its own guidance.
- Every retired food's guidance remains reachable, searchable by its former name and aliases, and
  filterable by scope and outcome.
- No food's displayed status, summary, condition, or source text differs from what it displayed before
  the migration.
- Content validation fails if a lifted assessment omits its `scopeStatement`, duplicates a subject in
  one list, or falls outside its list's declared coverage.
- The catalogue's guide-entry count after migration is explainable entry by entry against the count
  before it, with no entry silently lost.

## Validation

Domain and content-validation unit tests for the lifted assessments, inheritance resolution, alias
migration, and each validation rule. React Testing Library tests confirming that a food beneath a
newly assessed category shows the inherited rule with disclosed origin. Chromium Playwright coverage
for a retired record's new `/category/<slug>` URL and for search by a migrated alias. Repository-wide
100% statements, branches, functions, and lines coverage for application source is retained, and the
before-and-after record counts are stated in this brief on completion, as F-09 did. A subagent runs the
`prepare` skill after implementation and targeted validation, before the pull request is opened and
before this feature moves to `Done`.
