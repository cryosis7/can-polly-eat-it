# High-Level Features

These documents define independently valuable product slices. They are intentionally not detailed
backlog tickets: each should be broken into user stories, content tasks, and test cases only after
the architecture and data contract are in place.

| Feature | Outcome | Depends on |
| --- | --- | --- |
| [01 - Browse the food guide](<01-browse-food-guide.md>) | Browse reviewed foods in their natural category hierarchy. | Valid categories, foods, and assessments |
| [02 - Search and filter foods](<02-search-and-filter-foods.md>) | Find a food or narrow the catalogue without losing context. | Browse feature and query layer |
| [03 - Explain food guidance](<03-explain-food-guidance.md>) | Understand a status, its conditions, and source. | Food records and citations |
| [04 - Maintain trustworthy guidance content](<04-maintain-trustworthy-guidance-content.md>) | Safely curate and validate the pregnancy data. | Content contract |
| [05 - Add independent guidance lists](<05-add-independent-guidance-lists.md>) | Add vegetarian suitability and future lists to the same catalogue. | Shared guidance-list assessment model |

The first releasable vertical slice is Features 01-03 using a small set of fully cited pregnancy
records. Feature 04 scales the content safely. Feature 05 is deliberately deferred until the
pregnancy experience and content contract are proven.

## Test confidence

Once the proposed branch-coverage ADR is Accepted and implemented, every feature that changes
application or content code must retain at least 90% global branch coverage for application source
under `src/`. This does not replace the feature-specific acceptance examples or human editorial
review.
