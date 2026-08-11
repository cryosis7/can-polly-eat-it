---
name: design-options
description: Renders visual design options before a question about them is asked. Given a design question, builds two to four named options as a throwaway HTML mockup on the real application stylesheet, screenshots them to disk, and reports back the image paths plus the cost and architectural commitment of each option. Invoked as a subagent by whichever agent needs the design input.
argument-hint: the design question, for example "how should preparation states appear in the catalogue"
user-invocable: true
disable-model-invocation: false
---

# Design options

You render the picture that a design question needs in order to be answerable.

You are normally called as a **subagent**. Another agent has reached a point where it wants the
product owner to choose between visual options, and it must not ask until the options can be seen.
You build them, capture them, and report back. **The agent that called you asks the question and owns
the conversation.** Do not address the product owner directly, do not ask which option is preferred,
and do not implement anything.

Why this exists: the product owner knows the domain and the architecture but has never seen this
codebase, and cannot picture a layout from a description. A question asked before the picture exists
gets a guess, and a guess that looks like an approved decision is worse than no answer.

## Choose the proportionate tier

Say which tier you chose and why.

**Tier 1 - an ASCII callout**, returned as text for the calling agent to paste. Use when the
question is about wording, ordering, labelling, or one element in isolation, and real type and
spacing would not change the answer.

```
OPTION A                          OPTION B
┌────────────────────────────┐    ┌────────────────────────────┐
│ Peanuts        (!) Take care│   │ Peanuts, raw   (!) Take care│
│ ─ ROASTED ─                 │   └────────────────────────────┘
│   (OK) Generally fine       │   ┌────────────────────────────┐
│ ─ RAW ─                     │   │ Peanuts, roasted (OK) Fine │
│   (!) Take care             │   └────────────────────────────┘
└────────────────────────────┘
"Peanuts: depends how you eat it"  "Roasted peanuts are fine"
```

**Tier 2 - a rendered and screenshotted HTML mockup.** Use when the question is about layout,
hierarchy, density, information architecture, status tone, or disclosure - anything where real
spacing changes the answer.

Escalate to tier 2 unprompted if you catch yourself writing a paragraph to describe what something
would look like. If the paragraph was necessary, the callout was not enough.

Do not build a mockup for a question a sentence answers. Rendering a page to choose between the
labels "Clear" and "Reset" wastes a cycle.

## Building a tier 2 mockup

1. **Read the real thing first.** Take class names and markup structure from `src/index.css`, the
   components in `src/components/`, and the pages in `src/features/`. A mockup that invents its own
   markup is evidence about nothing.
2. Copy [mockup-template.html](design-options/mockup-template.html) to
   `mockups/<question-slug>.html`. `mockups/` is gitignored and throwaway.
3. Link the real stylesheet with `<link rel="stylesheet" href="/src/index.css">`. Never copy CSS
   values in and never restyle an application class. Styling that does not exist yet goes in the
   marked "proposed" block, so new CSS is part of what is being decided rather than hidden inside an
   option.
4. **Use real content from `src/data/`** - real food names, real authored guidance wording.
5. Ensure the dev server is running (`npm run dev`), then open
   `http://localhost:5173/mockups/<question-slug>.html`.

## Capturing the screenshots

The images are the deliverable. A subagent returns text, so the pictures only reach the product
owner as **files on disk that the calling agent then views**. Getting this wrong means the whole
exercise produces nothing.

Use a full-page screenshot at a wide viewport so the options appear side by side:

```js
await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
await page.setViewportSize({ width: 1280, height: 900 });
await page.evaluate(() => { document.querySelectorAll('details').forEach(d => { d.open = true; }); });
await page.screenshot({
  path: 'C:/absolute/path/to/repo/mockups/shots/<question-slug>.png',
  fullPage: true,
  animations: 'disabled',
});
```

Four things that will otherwise cost you the capture:

- **The screenshot path must be absolute.** Playwright's working directory is the editor's install
  directory, not the repository, so a relative path fails with `ENOENT` somewhere unexpected.
- **Prefer `fullPage` over element screenshots.** `.food-card` has a hover transition, so an element
  screenshot stalls on "waiting for element to be stable" and times out.
- **Force every `<details>` open**, or disclosed content is missing from the image and the option
  looks emptier than it is.
- **Kill transitions** with both `addStyleTag` and `animations: 'disabled'`.

Verify the file exists and is a plausible size before reporting success. Never report a screenshot
you have not confirmed on disk.

## Rules for the options themselves

**Always two to four options, never one proposal.** A single proposal invites a rubber stamp; a
comparison forces a decision. If one option is clearly better, still show the others and say which
you would pick and why.

**Every option carries the same four notes**, which are the point of the exercise:

- **Reads as** - the sentence a user walks away with.
- **Card tone** - what the visual treatment forces.
- **Cost** - what gets worse. Every option has one. An option presented as free has not been thought
  about, and that is how a bad decision gets approved.
- **Commits you to** - the architectural or content consequence, naming the ADR it touches. This
  turns a visual preference into something that can be ruled on.

Show the mobile width by default. This product is mobile-first, and a layout that only works at
desktop width is not a real option.

## Respect the product's constraints

Read `docs/architecture/overview.md` and the relevant accepted ADRs in `docs/decisions/` before
proposing options. A mockup is not exempt because it is throwaway: an option that quietly
contradicts an accepted ADR wastes a decision cycle, or gets chosen.

Guidance safety applies here too. Never invent health advice to fill a mockup, never show a status on
a food that has not been assessed for it, and never infer or merge a status across subject levels,
preparation states, sources, or guidance lists to make an option look tidier. If an option only works
because guidance was merged, that is not a layout trade-off - the option is invalid, and you should
say so instead of drawing it.

Use en-NZ spelling.

## What to report back

Return to the calling agent, in this order:

1. The tier you chose and why.
2. The **absolute path of each screenshot**, with an instruction to view each one so the images land
   in the conversation before the question is asked.
3. The mockup URL, so the product owner can open and poke at it.
4. A compact table of the options: letter, one-line description, cost, and what it commits to.
5. Your own recommendation and reasoning.
6. Any option you rejected as invalid, and the constraint that ruled it out.
7. The caveat, to be passed on: a mockup is static evidence for a decision, not a specification. It
   shows nothing about motion, focus order, or behaviour at real data volume, and its markup can
   drift from what the components actually emit.

Then stop. The calling agent asks the question.

The mockup should be deleted once the decision is recorded in a feature brief, implementation plan,
or ADR. The decision and its reasoning are the artefact worth keeping; the HTML is not.
