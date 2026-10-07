---
slug: starground
order: 11
tag: Product Policy
title: Settlement small enough for one box, and answering without a stake
role: Concept design and prototype build
summary: A game of five daily questions on Seoul data. The rules nobody had settled were settled while the screens were revised. Three outcomes for settlement, and staking left optional.
image: picks
imageCaption: Prototype screens. Today's picks, the star point staking sheet, a correct result. At the bottom of the staking sheet sits "Answer without staking".
figure: starground
figureCaption: Settlement has three outcomes - right, wrong, no correct answer. An answer with no stake still counts as a round. Attendance and ranking run on rounds answered, not points staked.
---

## The problem

A mobile game where questions are built from Seoul's aggregated card spending
and foot traffic, and answered by staking star points. Which area grew its
evening spending more, where people will stay longer after work. Five open
each day.

The screen list was confirmed first. Today, season, friends ranking,
settlement, receipts, rewards, star points, invites, attendance. What had yet
to be decided were the rules those screens would follow. How much comes back,
what happens without a stake, what ranks people.

## The call: rules went onto screens first

Rules kept only in a document break the first time they meet a screen. So the
settlement and result screens were drawn, and every revision of them revised
the rules with them. The screens were where the rules were tested.

## Three outcomes

Settlement was cut down to one to one. Right pays double the stake, wrong pays
nothing, and only a round with no correct answer is refunded. All three fit in
the single "How star points settle" box at the foot of the result screen. A
rule that will not fit in one box is a rule people will ask about again at
settlement.

## Staking made optional

The staking sheet carries "Answer without staking". A question can be answered
with zero points. In exchange, an answer-only pick cannot be staked later, and
an answer cannot be changed. Someone who has run out of points is still in
today's five.

So the unit of counting became the round answered, not the points staked.

- **Attendance.** Answering three rounds in a day earns the stamp. The stake is not looked at
- **Ranking.** Guests are ranked too. Ties go to correct answers, then to whoever joined first
- **Data label.** The source line carries "Sample", so the prototype's numbers
  are not read as real aggregates

## Shaped for engineering to pick up

The screens are drawn at 430 wide and live in a package that takes all data
and actions as props. No settlement is hidden inside a screen, so a rule
change does not mean redrawing it. The earlier v1 card book and the dark and
light skins from the period under the previous name were kept as the
exploration.

## The result

October was launch polish. A character in a star hood went onto the hero card,
the start sheet, the waiting, correct and wrong results and the maintenance
screen, each in its own pose, and a done state with sharing was added for days
when all five are answered. Three rounds of web mobile QA kept long numbers to
one line and right aligned, and the full season ranking opened as its own
sub-screen.
