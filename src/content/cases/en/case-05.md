---
slug: delivery-operations
order: 5
tag: Delivery
title: Collapsing a release schedule to one gate, then putting progress on a screen
role: Product management, delivery operations and internal portal design
summary: Several gates mean each one becomes negotiable. Reduced to one there is nothing left to negotiate, and how far that one gate has come is answered by a screen rather than by a person.
figure: delivery-operations
figureCaption: With several gates each one becomes negotiable. Reduced to a single date there is nothing left to negotiate.
metrics:
  - path: totals.activeDays
    label: Active days
  - path: totals.repos
    label: Areas of work
---

## The situation

A small engineering organization was preparing several product screens for release at
once. I was not one of the engineers. My role was product management and design, and my
deliverable was policy and acceptance criteria in a form the team could verify.

## Boundaries were defined before features

The first thing written down was not a feature list. It was a **boundary.**

- Product management decides: policy, target users, priority, what counts as a confirmed
  state, consent and withdrawal, data minimization, and acceptance criteria the team can
  verify
- Engineering decides: the actual services, storage design, retry behavior, deployment
  method, and the rest of the internal wiring

Without that boundary the failure runs in two directions. Product turns internal wiring
into questions and ties up engineers, or implementation research bleeds into policy
documents until the policy itself is no longer legible. Having hit both, I fixed it in
writing.

The grounds for reopening a decision were pinned down as well: a policy change,
additional personal data being passed, and a change to release scope or schedule. An
implementation constraint escalates only when it touches one of those. Everything else,
engineering decides and evidences.

## The gates collapsed into one

The release run-up had several deadline gates. Several gates mean each is negotiated
separately, one slipping drags the rest with it, and every incoming request needs a ruling
on which gate it falls under.

They were merged into one. After that there was no ruling to make. A request is either
inside or outside.

## Three axes on every ticket

Left as free-form tags, issue labels accumulate a different vocabulary per person within
weeks. Three axes were fixed instead: feature, product area, and layer. With those three,
"what is ready to what depth" becomes a query. The point was to stop compiling progress
by hand.

Assignment was mapped by service, so a ticket routes itself even when the author does not
pick an owner. The important part is the ambiguous case: instead of leaving it blank it
goes to the lead with a flag for reassignment. Nobody looks at an unassigned ticket.

## Then a screen that draws those axes

Even with the axes fixed, answering "where are we right now?" still meant finding a
person. Progress lived in the issue tracker, the reference documents in the repository,
deployment state on the pipeline screen, and the person joining all three was the same
person every time. None of them was in the wrong place. The problem was that the joining
happened only inside one person's head.

So an internal portal was built. I kept it small: one shell and three panels, work
status, pipelines, and reference documents. Those three answer "how far along, is it
running right now, and what is the standard." I did not add more, because internal tools
usually fail by going unopened rather than by lacking features. The values started as
snapshots updated by hand and moved to live sources later.

- **The screen has to say whether it is a snapshot or live.** A value whose refresh
  has stopped emits no signal that it stopped. I made the badge honest, so what was
  filled in and as of when is legible on the screen itself
- **When a fetch fails, fall back to the snapshot rather than to an empty screen.**
  An empty screen reads as "there is no value" when the truth is "it could not be
  fetched." Those are different statements
- **Reference values are held by a comparison script, not by the screen.** Rather than
  leaving a person to discover that the reference document changed while the portal
  still holds the old value, the two are compared and the drift is reported

Building the portal also meant settling the words. I renamed delivery to work status
and moved it to the top of the home screen. Leave engineering vocabulary in place and
non-engineering colleagues read the screen as something not meant for them, when in
fact it was answering the question they asked most often.

## What I took from it

Because progress is no longer tallied by hand, the part of a meeting spent reconciling
numbers disappeared, and that time went to discussing why the numbers look the way they
do.

The most expensive failure was quiet repetition, hitting the same wall without reporting
it. So escalation was written as numbers too. The same approach is retried at most twice;
past a set amount of time on one problem, it goes up with a list of what was tried and why
each failed. And scope is never quietly reduced to reach done. Whether to cut is not my
call to make alone.
