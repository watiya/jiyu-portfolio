---
slug: design-system-in-code
order: 2
tag: Design System
title: The design tool is no longer the source of truth, and the code moved into packages
role: Design system architecture and shared package promotion
summary: The standard for a screen lives in running code, not in a design file. That standard was then lifted into packages all four products share.
image: design-system-tokens
imageCaption: The colour token screen, where running code is the source of truth. Primitive scales sit apart from semantic tokens. Logo and brand token name are masked.
figure: design-system-in-code
figureCaption: Primitives hold values and screens never touch them. Exposing only semantics as utilities keeps every theme edit inside one layer.
metrics:
  - path: surfaces.tokenDefinitions
    label: Token definitions
  - path: surfaces.routes
    label: Product screens
  - path: surfaces.componentsByPackage
    label: Shared components per product
---

## The problem

The design files and the shipped screens had drifted apart. Change a color in the
file and the screen stayed as it was; patch a value in a hurry on the screen and
it never made its way back into the file. Both claimed to be the source of truth,
so every question had two answers, and in the end a person compared the two by eye
every single time.

## The source of truth moved into code

The design tool was not abandoned. It is simply **no longer the source of truth.**
Exploration and early concepts still happen there, but the answer to "which screen
is correct" now lives in one place: the code that actually runs. The reasoning is
plain. Synchronization maintained by human comparison is the first thing to break
when the team is busy, and when it breaks it leaves no trace.

The system itself was split in two layers. Primitive tokens carry values; semantic
tokens carry meaning. Screens reference semantic names only and never reach for a
raw value. Without that boundary, someone has to decide "is this blue the brand
color or the informational color" on every use, and that decision differs from
person to person.

## Failure modes closed by structure

Defining tokens was not enough. What actually broke was never the rule itself but
**the places where a rule passes silently.**

- A missing dark-theme counterpart still built successfully. A completeness check
  now catches tokens that exist in the light theme and not the dark one
- When the scan glob is written by hand on the consumer side, matching zero files
  still passes the build. The build goes green and only the screen is broken.
  The glob was moved inside the package
- Importing a single preset now pulls the fonts along with it. "Forgetting the
  font import" was removed by structure rather than guarded by a note
- Using an undefined color step rendered transparent with no warning. Only
  semantic names are permitted, so the mistake can no longer be expressed

## The same piece was redrawn once per product

When the fourth product arrived, the same thing had been built four times. Badges,
dropdowns, category icons, stat cards, the pieces every product has. Every one of
them worked well enough, so nobody ever filed it as a problem. It surfaced when
something had to change. Adjusting the padding on a badge meant finding four
places, and the four had drifted enough that it was not the same edit in each.
Miss one and that product kept the old shape, and the fact that it was old was
invisible until the two were placed side by side.

Counting the duplication was the first thing that stalled. Asked "how many screens
are there," product counted from the spec table of contents, engineering counted
routes, design counted mockups. Three different numbers, none of them wrong; they
were counting different units. So the unit of counting was fixed to the **URL.** A
screen is a human concept and needs agreement; a URL either exists or it does not.
The list is extracted from the code rather than typed by hand, and on top of it a
board gives each product a row of cards carrying state and the product area that
owns it, so product, engineering and design all look at the same board. Counted
from the code instead of from memory, two things surfaced at once: a preview copy
and a package copy had diverged, and an older and a newer generation of the same
product were coexisting. Before that, a review had once run off a screen list and
missed five pages that existed only in the deployed build. They were not on the
list, so they were not in scope, and the review passed.

## Promotion became a state rather than an agreement

I decided not to settle each promotion by agreement. Agreements get skipped when
things are busy, and a skipped agreement leaves no record.

Instead every screen and shared piece carries a **handoff state**: draft, review,
stable, retired. The moment something turns stable is the moment it becomes a
promotion candidate. Nobody has to ask whether it is time to lift it, because the
state already says so.

The structure splits into one shared core and four per-product packages. The core
leans on no product, and product packages use the core without referencing one
another. Without that direction fixed up front, the shared layer grows around one
product's circumstances, and later the others cannot use it.

## What kept blocking promotion

Even after the process existed, promotions kept failing, and they failed where the
rules and reality had drifted apart. A screen leaning on the shell or on shared
fragments broke the moment it was pulled out; the same route appeared twice in the
list carrying two different states; more than a hundred screens were already
deployed while the list still had them in review.

All of it was caught by eye, and catching things by eye works once and stops
working the second time. So promotion is now read from the actual package
composition rather than from the list, and displayed automatically. When the list
and reality disagree, a check blocks the change, and I tightened it to block edits
into review as well as into stable.

## The outcome

Changing one color went from opening dozens of files to editing a single token, and
changing a shared piece became a change in one place. The question "is this screen
shared?" no longer comes to a person; the screen answers it. Promotion became an
outcome of the process rather than of somebody's diligence.

## What I keep thinking about

Making the standard singular has a cost. Design discussion moved into the code
review path, which raises the barrier for non-engineering colleagues. The browsing
board was built to offset that. But standing a board up does not by itself build
the habit of reading it, and that part this design did not solve.
