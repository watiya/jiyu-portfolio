---
slug: canon-and-mirrors
order: 7
tag: Documentation
title: Making every mirror declare itself, and moving repeat mistakes into checks
role: Documentation architecture and process design
summary: After failing to eliminate duplication, I stopped removing mirrors and made each mirror declare that it is one. Repeat mistakes moved out of cautions and into checks a machine enforces.
figure: canon-and-mirrors
figureCaption: Rather than removing mirrors, each one carries a fixed banner with the source path and the sync date. Without that banner a mirror reads as the source itself.
metrics:
  - path: surfaces.documents
    label: Documents by category
---

## The problem

The same policy lived in two places: the repository and the shared wiki. The stated
principle was "the repository is the source of truth," but non-engineering colleagues
did not have a path that took them through the repository day to day. What they
actually opened was the wiki, and nothing on those pages said they were copies.

So stale values were cited with confidence. At one point a duration that had already
changed was still sitting in a copy, and a reader had no way to know it was old. A copy
emits no signal at all that it is telling you something false.

## The decision

Removing the mirrors had already failed once. Forbidding the place people look does not
change where they look. So I went the other way.

**The mirror was made part of the official procedure.** Creating a new source document
means creating its mirror in the same unit of work. Three conditions came with that.

1. **A mirror is a summary, not a copy.** Duplicate the full text and you have two
   documents, and two documents will diverge. A summary sends the reader to the original
   by construction
2. **A banner at the top pins the source path and the sync date.** Without it a mirror
   simply reads as the source. The stale-value incident happened along exactly that path
3. **Editing the source means reconciling the mirror in the same unit of work.** A
   half-updated mirror is worse than no mirror. A mirror whose updates have stopped holds
   an old value with full confidence

## One entrance for citation

The second problem was citation. When "where is the source of truth" has several answers,
everyone who cites opens a different one. The place non-engineering colleagues go to cite
our standards was fixed to **a single entrance.** However many items sit beneath it, the
entrance is one.

The cost was written down honestly. That index is maintained by hand, not automatically.
Publishing a new policy has to include listing it, and a policy that misses its listing
becomes, to anyone citing it, a thing that is not in the source of truth. Not pretending
an un-automated step is automated was the most important part of this design.

Figures used in policy are not embedded in document bodies either. They live in a single
list that the screens read from. Scatter a number across documents and a few copies will
always survive a change, and the survivors get cited more often than the corrected ones.

## Repeat mistakes belong in checks, not in prose

Once the document system stood up, the same problem turned up somewhere else. The
default response to a mistake happening a second time was to add one more line of
caution to a document. A few months of that leaves hundreds of lines of cautions, and
nobody reads to the end of that document. Worse, nobody knows when a given line stopped
being relevant.

So repeat mistakes stopped accumulating as prose and moved through a procedure that
turns them into **machine-enforced checks.** Four steps: capture, classify, promote,
retire. Once promotion is complete the original line is reduced to a single pointer or
deleted. Restating in prose what a check already catches makes that prose pure cost. The
triggers were fixed too: the second recurrence, the first incident, and any discovery
that a reference document and reality had drifted apart.

Retirement is the part that matters. Registers like this almost always grow in one
direction, because reasons to add appear on their own and reasons to remove are nobody's
job. So on a set cadence the document is reread and lines that no longer fire are
removed. The document exceeding a certain length is itself a trigger. Length was made
into a signal.

## What the checks cannot catch, stated plainly

Adding guards taught me that the existence of a check does not imply coverage.

- Some checks only run across a registered list. A screen that is not on the list holds
  a stale value under a green check
- Some checks warn rather than block. A warning does not stop anything, so a person has to
  open the result. Unopened, it may as well not exist
- Some checks compare against a list maintained by hand. Change a reference value and that
  list has to be corrected in the same unit of work. When I actually audited one, most of
  its entries were out of date

All three are documented. Unless you write down the difference between "a check exists"
and "the rule is being followed," a green light starts to be the reason people stop
looking.

## The outcome

Rather than trying to stop documents from multiplying, each document now states its own
standing. "Which of these is current" is answered on screen the moment the document
opens. And a substantial share of rules previously held together by cautions now fire
automatically at commit time and at authoring time. As the list a person has to remember
got shorter, what remains on it is the part that genuinely needs human judgment.
