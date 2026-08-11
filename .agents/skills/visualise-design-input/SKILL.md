---
name: visualise-design-input
description: Render design options as pictures before asking the product owner to choose between them. Use whenever you are about to ask how something should look, be laid out, be grouped, be ordered on screen, which of several presentations to build, or to confirm a visual or wording approach - and whenever the product owner asks for a design, layout, or UI decision. Trigger this before asking the question, not after.
---

# Visualise before asking for design input

The product owner knows the domain and the architecture but has never seen this codebase, and cannot
picture a layout from a description. A design question asked in prose therefore gets a guess, and the
guess comes back looking like an approved decision. Problems that would have been obvious on sight -
a card that is too tall on mobile, a warning tone that scares off someone the guidance does not apply
to - are only caught once the code is written.

So: **never ask a question about how something should look before the options can be seen.**

## Recognising the moment

Trigger this skill when you are about to ask anything of this shape:

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
   so do not pre-empt that - and do not build the mockup yourself, because the point is that the work
   happens off your context.
2. **View every screenshot it reports back**, by path. The subagent returns text, so the images only
   reach the product owner if you view each file and put it in the conversation. Skipping this
   reduces the whole exercise to the prose question you were trying to avoid.
3. **Then ask the question**, referring to the options by letter so the answer can be a letter. Pass
   on the mockup URL, each option's cost and what it commits to, and your own recommendation. Ask one
   question at a time.
4. **Record the decision** in the feature brief, implementation plan, or ADR, along with the reason
   it was chosen and the cost that was accepted. Delete the mockup afterwards. The reasoning is the
   artefact worth keeping; the HTML is not.

## When not to use it

Do not delegate a question that a sentence answers, such as choosing between the button labels
"Clear" and "Reset". Rendering a page for that is slower than asking, and habitually over-applying
this will train the product owner to skim the pictures.

Do not use it to decide domain or content questions. Whether a food is eaten raw in New Zealand,
what a source actually says, and which guidance applies are matters of evidence and product
judgement, not of layout. A mockup can show how an answer is presented; it can never establish
what the answer is.
