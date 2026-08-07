# F-13: Surface Raw-Egg Foods Where People Browse for Them

**Status:** Proposed

**Depends on:** [F-04: Maintain Trustworthy Guidance Content](<04-maintain-trustworthy-guidance-content.md>), [F-12: Lift Group-Level Guidance onto Categories](<12-lift-group-guidance-onto-categories.md>)

**Governing decisions:** [assess categories as first-class subjects with inherited guidance](<../decisions/2026-08-06 ADR - assess categories as first-class subjects with inherited guidance.md>), [store reviewed guide content as version-controlled static data](<../decisions/2026-08-04 ADR - store reviewed guide content as version-controlled static data.md>), and [vary source-citation requirements by guidance list](<../decisions/2026-08-06 ADR - vary source-citation requirements by guidance list.md>)

## Goal

As Polly, I need raw-egg foods to appear in the categories I actually browse — sauces, desserts, and
drinks — so that a home-made mayonnaise, a tiramisu, or an eggnog tells me the risk where I look for
it, instead of that risk being reachable only through an entry filed under eggs.

## Problem evidence

The reviewed MPI guide lists, under "Do not eat: Raw eggs or foods containing raw eggs", the items
"mayonnaise, dressings containing mayonnaise, hollandaise sauce, Caesar dressing, and some desserts
(unless the products are labelled as containing pasteurised eggs)".

Today every one of those foods exists only as an alias string on the single
`Raw eggs and foods containing raw eggs` record: `home-made mayonnaise`, `mousse`, `tiramisu`,
`home-made ice cream`, `eggnog`, `egg flips`, `smoothies`. None of them is browsable. A reader
scanning sauces or looking for desserts meets nothing, while the only sauces entry carries the amber
rule "refrigerate opened products and follow their manufacturer storage and heating instructions",
which presumes a manufacturer that a home-made sauce does not have.

## Primary experience

1. Browse to `Sauces, dressings and spreads` and see it split into `Commercial` and `Home-made`.
2. See `Home-made sauces` carry an amber "check whether it contains raw egg" status, because only some
   home-made sauces contain egg.
3. See `Mayonnaise`, `Hollandaise sauce`, and `Caesar dressing` beneath it, each red, because these
   are the ones the source names.
4. Browse to `Desserts` → `Cold desserts` and find the same shape, with `Mousse` and `Tiramisu` red
   beneath an amber group, alongside `Ice cream` and `Panna cotta`.
5. Browse to `Drinks` → `Home-made drinks` and find `Eggnog` and `Egg flips` red, with `Smoothies`
   inheriting the amber check.

## Required behaviour

- `Sauces, dressings and spreads` keeps the source's heading as a plain browse heading, with
  `Commercial sauces, dressings and spreads` and `Home-made sauces` as its assessed children.
- A `Desserts` root category with a `Cold desserts` child is added. `Desserts` is a root, a sibling of
  `Dairy` and `Miscellaneous`. `Cold desserts` carries the raw-egg guidance so that a cold dessert added
  later inherits it rather than reading as unassessed.
- Root categories are ordered alphabetically by name, so `Desserts` and `Drinks` take a position a
  reader can predict rather than one chosen by hand. This reassigns every root's `sortOrder` and moves
  some existing roots up or down the browse view; it changes no guidance and no child ordering.
- The existing `Ice cream` category moves from `Dairy` to `Cold desserts`, keeping its `Packaged` and
  `Soft-serve` children, and gains a `Home-made ice cream` child.
- `Panna cotta` moves from `foods-that-may-contain-animal-derived-ingredients` into `Cold desserts`.
- A `Drinks` root category is added with a `Home-made drinks` child carrying the same amber
  check-for-raw-egg rule. `Eggnog` and `Egg flips` sit beneath it as red foods, because the source
  names them; `Smoothies` sits beneath it with no assessment of its own and inherits the amber rule,
  because only some smoothies have raw egg added.
- `Fruit juice, kombucha and cider (non-alcoholic)` moves from `Miscellaneous` into `Drinks`, keeping
  its pasteurised and unpasteurised children and their assessments unchanged. This is included here,
  despite being outside the raw-egg subject matter, because this feature creates the `Drinks` root and
  shipping it without the guide's existing drinks would leave a reader browsing `Drinks` unable to
  find fruit juice. It needs no additional coverage change, because `drinks` is already being added to
  the pregnancy coverage.
- `Home-made ice cream` is amber, not red. The source does not name a specific home-made ice cream as
  containing raw egg, and much of it is cooked-custard based or eggless, so it follows the same
  "only some contain egg" rule as `Home-made sauces`. Named red children can be added later if the
  source supports them.
- The pregnancy list's `coverage.categoryIds` gains both `desserts` and `drinks`. This is mandatory,
  not optional: coverage containment is resolved by walking a subject's ancestor path, and ice cream
  is currently inside coverage only by virtue of its `Dairy` ancestor. Without this, the moved
  ice-cream assessments and every new drinks assessment fail coverage-containment validation, and
  those foods would otherwise render as "Outside current coverage".
- Citation locators are not rewritten to match the new structure. A locator records where the text sits
  in the source, not where the guide files it, so the ice-cream rules keep their existing
  `Dairy: Ice cream — Packaged` and `Ice cream — Soft serve` locators after the move.
- A group that only *may* contain raw egg is amber: the group-level rule tells the reader to check
  whether raw egg is present, and states what to do in each case.
- A food the source names explicitly as containing raw egg is red and carries its own assessment,
  which overrides the amber group rule entirely under the existing resolution order. This is the same
  shape as `Hard cheese` and `Parmesan`.
- The mitigation is expressed in terms of whether the egg is raw or cooked, not in terms of
  pasteurised egg. The guide must not imply that a home cook can obtain pasteurised egg.
- Where the guidance turns on the egg being cooked, it points to the existing cited `Cooked eggs`
  rule rather than authoring a new exception.
- Citations are the existing MPI pullout guide at its existing raw-eggs and cooked-eggs locators. No
  new source is introduced, and no source is re-fetched or scraped.
- `dressings containing mayonnaise` is an alias of the mayonnaise record, not a record of its own.
- Every alias that moves onto a new record is removed from the raw-eggs record, so one search term
  never matches two entries carrying different statuses.
- The raw-eggs entry keeps its own status, summary, conditions, and citation, and remains the entry
  for raw eggs themselves.

## Non-goals

- Introducing a pasteurised-egg exception on any home-made entry. The source attaches that exception
  to *labelled products*, so it belongs with commercial products, not home-made ones.
- Enumerating every possible sauce or dessert. Only the items the source names get their own record;
  anything else inherits its group's rule.
- Changing the raw-eggs or cooked-eggs guidance wording, status, or citation.
- Extending the reason-link schema to target categories. This feature is designed not to need it.
- Changing any vegetarian assessment. Moving a food between categories must leave its per-list
  assessments untouched.
- Reworking the `foods-that-may-contain-animal-derived-ingredients` category, beyond moving any food
  that genuinely belongs in a new dessert category.
- Moving `Cakes, slices and muffins` out of `Breads and cereals`. They are desserts in ordinary usage,
  but the source files them there and this feature does not relitigate the source's structure.
- Rewriting citation locators to match the new category structure.

## Assumptions and open questions

- This authors records from text already in the reviewed source, so it is content curation under the
  existing ADRs rather than a new decision. Human review remains mandatory before publication.
- The pregnancy list is `citationPolicy: 'required'`, so every record here carries the MPI URL and an
  exact locator. `Desserts` is authored as a new root, so the pregnancy coverage `categoryIds` must
  gain `desserts` as described above, or validation will reject the moved ice-cream assessments.
- Resolved: `Ice cream` moves under `Cold desserts` with its existing children, and `Home-made ice
  cream` is authored as a category beneath it rather than a bare food, matching its `Packaged` and
  `Soft-serve` siblings so that named home-made ice creams can be added later without restructuring.
- **Consequence worth accepting deliberately:** a category has exactly one parent, so once `Ice cream`
  sits under `Cold desserts` it no longer appears beneath `Dairy`. A reader who looks for ice cream in
  Dairy will not find it there, and the data model offers no "see also" or secondary-parent mechanism
  to soften that. The trade is deliberate: ice cream is browsable with the other cold desserts
  instead.
- **Needs confirmation against the source:** `Home-made ice cream` is authored amber, applying the
  same "only some contain egg" rule that makes `Home-made sauces` amber, because the source does not
  name a specific home-made ice cream as a raw-egg food. A reviewer should confirm this against the
  source text before publication rather than accepting it purely by analogy.
- Resolved: `eggnog`, `egg flips`, and `smoothies` are drinks, so a `Drinks` root is added with a
  `Home-made drinks` child, with eggnog and egg flips red and smoothies inheriting amber.
- Resolved: `Fruit juice, kombucha and cider (non-alcoholic)` moves from `Miscellaneous` into
  `Drinks`, so the new root is not shipped obviously incomplete.
- Resolved, now its own feature: `orange-juice`, `wine-and-beer`, and `apple-pie` sit in
  `foods-that-may-contain-animal-derived-ingredients`, which groups foods by *why they were assessed*
  rather than by *what they are* — the same latent problem `Panna cotta` had. Orange juice also now
  overlaps the fruit-juice category. Untangling that category is a coherent piece of work in its own
  right, is deliberately not attempted here, and is now
  [F-14](<14-retire-animal-derived-foods-category.md>), which depends on this feature for the
  `Desserts` and `Drinks` roots it needs.
- **Needs the closest review:** the amber group rules are the one place this feature goes beyond
  restating the source. The source says these foods are do-not-eat; it does not say "check your
  home-made sauce". The amber summary must therefore be phrased as applying the cited rule
  conditionally — the guide says not to eat foods containing raw egg, so check whether this one does —
  rather than as new advice. A reviewer should confirm that wording before publication.
- `Cold` is an editorial grouping, chosen because a baked dessert's egg is cooked while a chilled
  dessert's may not be. That rationale must not be presented as something the source states; the
  source says only "some desserts".
- Resolved: `home-made ice cream` is authored as a category beneath `Ice cream`.
- Resolved: `Panna cotta` moves from `foods-that-may-contain-animal-derived-ingredients` into
  `Cold desserts`. Its vegetarian assessment is unchanged, and the vegetarian
  coverage lists it by `foodIds`, so that coverage still holds after the move.
- **Consequence of that move, accepted deliberately:** `Panna cotta` leaves a root that is outside
  pregnancy coverage and enters one that is inside it, so its pregnancy result changes from
  `Outside current coverage` to the inherited amber `Cold desserts` rule with its origin disclosed.
  That is the correct result under the existing resolution order and the same treatment every other
  unassessed cold dessert receives, but it is a visible change to an existing entry and is asserted
  rather than discovered.
- Resolved: root categories are ordered alphabetically. The alternative was to hand-pick a position for
  `Desserts` and `Drinks` in the existing sequence, which encodes nothing a reader can perceive and
  would reopen the same argument for every future root.

## Implementation plan

[F-13 implementation plan](<13-surface-raw-egg-foods-plan.md>), approved and blocked on
[F-12](<12-lift-group-guidance-onto-categories.md>) reaching `Done`, because F-13 authors on top of
F-12's migrated sauces, raw-eggs, and cooked-eggs records and edits the same data files.

## Acceptance criteria

- Browsing `Sauces, dressings and spreads` shows a commercial and a home-made group, and neither the
  parent nor either child presents the other's rule.
- `Home-made sauces`, `Cold desserts`, `Home-made ice cream`, and `Home-made drinks` show an amber
  check-for-raw-egg status, while `Mayonnaise`, `Hollandaise sauce`, `Caesar dressing`, `Mousse`,
  `Tiramisu`, `Eggnog`, and `Egg flips` show red. `Smoothies` inherits the amber drinks rule with its
  origin disclosed.
- Browsing `Drinks` finds `Home-made drinks` with eggnog, egg flips, and smoothies beneath it,
  alongside `Fruit juice, kombucha and cider (non-alcoholic)` with its pasteurised and unpasteurised
  children, and `Miscellaneous` no longer lists fruit juice.
- No entry added by this feature mentions pasteurised egg as an option available to a home cook.
- A cold dessert or home-made sauce with no record of its own resolves to its group's amber guidance,
  with status, summary, citation, and statement of breadth, without an assessment being authored for
  it.
- Searching `hollandaise`, `caesar dressing`, `tiramisu`, or `dressings containing mayonnaise` reaches
  a sauces or desserts entry, and no search term matches two entries carrying different statuses.
- The raw-eggs entry's status, summary, conditions, and citation are unchanged.
- Browsing `Desserts` finds `Cold desserts` containing `Ice cream` with its `Packaged`, `Soft-serve`,
  and `Home-made` children, plus `Panna cotta`, and `Dairy` no longer lists ice cream.
- Every ice-cream, dessert, and drinks subject resolves inside the pregnancy list's coverage, and none
  renders
  as "Outside current coverage".
- Every food moved between categories keeps its existing per-list assessments unchanged, including
  `Panna cotta`'s vegetarian assessment, and `Panna cotta` shows the inherited amber cold-dessert rule
  for pregnancy with its origin disclosed instead of `Outside current coverage`.
- Root categories appear in alphabetical order, with `Desserts` and `Drinks` in their alphabetical
  positions, and no child ordering inside a root changes.
- Content validation passes, including citation-required, `scopeStatement` ownership, subject
  uniqueness per list, and coverage containment.

## Validation

Domain and content-validation unit tests for the new records, amber-group inheritance, red food-level
override, alias uniqueness across entries, and coverage containment for the new dessert subtree. React
Testing Library tests for the split sauces view and for a cold dessert inheriting with disclosed
origin. Chromium Playwright coverage for searching a migrated alias and for a new category's direct
URL. Repository-wide 100% statements, branches, functions, and lines coverage for application source is
retained. A subagent runs the `prepare` skill after implementation and targeted validation, before the
pull request is opened and before this feature moves to `Done`.
