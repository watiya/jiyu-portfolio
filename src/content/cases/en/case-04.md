---
slug: wording-as-risk
order: 4
tag: Product Policy
title: Treating a single verb as regulatory exposure
role: Product policy judgment and wording standards
summary: The verbs on a screen state the company's legal position. This was not a matter of softening language but of changing the subject of the sentence.
figure: wording-as-risk
figureCaption: Softening the verb leaves the subject in place. Only removing the subject and writing a state stops the sentence from naming the company as the actor.
---

## The problem

In a product with financial characteristics, the terms the screens had inherited by
convention described the company as a larger actor than it was. Wording becomes
evidence in outside assessment. If a screen says we "approve" something, that phrasing
is itself an assertion that we are the licensing authority.

## First decision: narrow the scope

The easy move was a blanket find-and-replace across everything, and I did not make it.
The sweep was limited to **user-facing product screens only.**

Sweeping internal documents too costs you two things. First, the record of the
discussion loses the words it was actually held in, so the reasoning behind a decision
stops being traceable. Second, once people start choosing their words inside working
documents, precise discussion gets harder. A defensive line belongs on the screens
that face outward, not on the places where people think.

## Second decision: refuse to treat it as one problem

The same word appeared in several places on screen, but the correct answer differed by
place.

- Where the company genuinely compares a submission against requirements it published
  in advance, the wording was changed to **name that act precisely.** If it is a
  requirements check rather than a discretionary judgment, saying so is simply accurate
- Where there is no checking party at all, changing the verb was not enough. Soften only
  the verb and the actor remains the company, which leaves intact exactly what the rule
  was meant to prevent. Here the wording moved from an action to a **state**
- Where the company selects its own counterparty, the rule does not apply in the first
  place. The company is the actor, and saying so plainly creates no misreading

Writing that last item as **outside the scope** rather than as an "exception" mattered.
Filed as an exception, it reads as "the rule applies here but is waived," which puts two
rules on the same screen. Whoever reads it next is guaranteed to be confused.

## Third decision: exceptions must record their sweep

Creating a rule drags a propagation pass along with it. Removing an exception did not.
Deleting an item is a subtractive edit, so no list of things to revisit gets produced,
and the affected strings were exempt in the first place, which means no document cites
them. There is nothing to trace back through.

One exception was in fact lifted, and dozens of strings that had been exempt under it
stayed exactly as they were. Someone working on something else found them two days
later by accident.

So an exception now has to record **what it waives and how far that rule's sweep
reached.** Lifting an exception is treated as an edit with the same weight as writing a
new rule.

## The outcome

Forbidden strings are blocked by machine. Patterns of tone, however, would catch
legitimate sentences if enforced as blocks, so those stay as warnings, and the
documentation says plainly that this is a place a human has to open and read. A green
check and a clean screen are not the same statement.
