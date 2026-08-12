---
name: visualise-design-input
description: Render design options before asking the product owner to choose between them, and render a confirmation view when their feedback settles on something the options didn't show. Use whenever you are about to ask how something should look, be laid out, grouped, ordered on screen, or when you need to describe a visual to the user for feedback. Also use this when the user has corrected a design plan you made or has requested a change in UI design. Trigger this before asking the question, and after implementing feedback that differs from the options you presented.
---

# Visualise before asking for design input

The product owner knows the domain and the architecture but has never seen this codebase, and cannot
picture a layout from a description. A design question asked in prose therefore gets a guess, and the
guess comes back looking like an approved decision. Problems that would have been obvious on sight -
a card that is too tall on mobile, a warning tone that scares off someone the guidance does not apply
to - are only caught once the code is written.

So: **never ask a question about how something should look before the options can be seen.**

## Recognising the moment

Trigger the design agent when you are about to ask anything of this shape:

- "Should X be nested inside Y, or listed separately?"
- "Which of these should lead the card?"
- "Do you want this always visible, or behind a disclosure?"
- "How should this be grouped, ordered, or labelled on screen?"
- "Does this approach look right?"
- Any question where you were about to describe an appearance in words.

Also trigger it when the product owner asks you directly for a layout, presentation, or UI decision.

The tell is simple. **If you are writing a sentence describing what something would look like, stop
and delegate instead.** The sentence is the symptom.

## What to do

1. **Delegate to the `design-options` subagent before you ask anything.** Give it the design
   question, the constraint that makes it hard, the feature or file it relates to, and any option you
   already have in mind. It decides whether an ASCII callout or a rendered mockup is proportionate,
   so do not pre-empt that - and never build the mockup yourself.

2. **Surface the mockup URL the subagent reports back**, The URL is the deliverable: the product
   owner opens the live page and pokes at it.
3. **Then ask the question**, referring to the options by letter so the answer can be a letter. Pass
   on the URL, each option's cost and what it commits to, and your own
   recommendation. Ask one question at a time.
4. **If the answer is a clean pick, record it and stop here.** "Go with B" needs nothing further -
   the page that justified it already exists.
5. **If the answer is a minor change from the proposed mockups**
   i.e. keeps an option but swaps a detail, combines two options, or describes a
   variant in words rather than choosing a letter - that is a new, unrendered design. Sealing a
   decision on a picture that does not exist yet is the exact mistake this skill exists to prevent, so
   the rule applies here too: delegate to the `design-options` subagent once more for a confirmation
   render - one option, at final scale, reflecting exactly what was said, with no siblings to choose
   between. Surface its URL, then ask a short confirm-or-adjust question before treating the
   decision as settled.
6. **If the answer is a rejection of all options**
   Take the feedback into consideration and restart the process.
7. **Record the final decision** in the feature brief, implementation plan, or ADR, along with the reason
   it was chosen and the cost that was accepted. Then delete the comparison mockup: once the decision
   and its reasoning are written down, a folder of rejected options only invites someone to
   relitigate a settled choice.
   **One exception.** Once - and only once - the product owner has explicitly confirmed a render shows
   what should be built, capture it as a **static HTML artefact**. It is then not evidence weighed to
   reach a decision but a statement of the agreed outcome, and it can carry acceptance criteria that
   prose states badly ("this treatment, not that one"). Copy it out of the throwaway
   `mockups/` directory to `docs/features/artefacts/<feature-id>-<slug>.html`, standing on its own so
   it renders without the dev server, link it from the brief, and say in the brief **which parts of it
   are normative** - an unqualified picture silently promotes every incidental detail in it to an
   acceptance criterion. Capturing before confirmation is the failure mode to avoid: it preserves a
   still-open option as though it were settled.

## When not to use it

Do not delegate a question that a sentence answers, such as choosing between the button labels
"Clear" and "Reset". Rendering a page for that is slower than asking, and habitually over-applying
this will train the product owner to skim the designs.

Do not use it to decide domain or content questions. Whether a food is eaten raw in New Zealand,
what a source actually says, and which guidance applies are matters of evidence and product
judgement, not of layout. A mockup can show how an answer is presented; it can never establish
what the answer is.
