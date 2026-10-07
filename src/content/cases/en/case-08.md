---
slug: hood-star
order: 8
tag: Prototyping
title: Six shells later, finding out the structure was the problem
role: Concept design and prototype build
summary: A neighbourhood game app, seven builds in two days, laid side by side. Six of them differed only in the shell. The seventh cut the home down to today's one round, neither map nor feed.
figure: hood-star
figureCaption: A map home and a feed home both live on material that has yet to accumulate. Right after launch, both are empty. A home that is today's one round fills up with thirteen stores and zero users.
---

## The problem

A neighbourhood game app - guess the store, pin it, rank it. Direction changed at every meeting, and two drafts already existed, one drawn by the CEO and one file made by a colleague. The first line of the prototype plan read: this is not a redraw, it is a join.

At this stage the only things that survive are screen structure, copy and state definitions. Colour and components get overwritten later by the design system. So the design system was not ported, and everything was built as static HTML that opens from a single link. Showing a draft has to be cheap before several can be laid out and chosen from.

## The call: the prototype must not decide policy

Building screens keeps surfacing policy nobody has decided. Do users post store names themselves, how many entries before a store goes public, and so on. Leave the slot empty and the screen does not stand; fill it in and the prototype reads as if it decided the policy.

So the screens were built, but each such slot got a "policy pending" strip with an owner's name, and went up to the meeting. The strip collapses to a single line and unfolds on tap. Even collapsed, the red dot and the count stay. If the pending marker disappears from the screen, the prototype reads as if it settled the policy.

## Variants cheap, and side by side

The fixed data went into one file. Brand name, points and ten districts live there, and changing one line moves all eight screens. Measured and invented values are separated inside the file. Administrative districts, alley counts and store totals came from public commercial-area data; store names, scores and vote counts are all made up. Without that split, people judge from invented numbers.

Each build got its own folder, switched in a viewer. Earlier builds were kept for comparison, not deleted.

- **v2 to v3.** A meeting dropped four games and kept the top three by a five-axis score: ease of build, ease of UI, fun, store exposure, return visits. The shell stayed
- **v4.** v2 and v3 looked too alike, so this was a full turn toward social. The home is a feed rather than a map, and a game result is a post
- **v5 and v6.** One build pinned an outside reference to every screen; the next put v3's visual rules on v5's layout. Store-versus-store rankings were deliberately left out

Seven builds landed within two days, counted by the days that carry commits.

## Six builds were shells

Looking at v1 through v6 together, every one of them changed the shell. A map home and a social home both live on material that has yet to accumulate. The day after launch there are thirteen pins and zero users, and both are empty.

v7 changed the structure. The home became today's one round. It is full with zero users and thirteen stores. The map and the feed were not dropped; they moved later in the order. The share card was new here - the only screen among six builds whose result leaves the app, and it carries no answer.

v8 changed the reward. Through v7 a reward was something bought with accumulated points; the meeting settled on gift vouchers, so it was rebuilt that way. Points became a ranking measure rather than a currency.

## A new branch

An engineering review moved the first game from "which store" to predicting district sales, and assumed points would be deducted. All eight builds were of the "which store" line, so instead of a v9 they got a separate bundle that shares no files. The vocabulary was settled at the same time: "pick", not "bet". The word says where the company stands legally.

Five builds came in four days, the last a web version with a nine-screen pick loop on v8's desktop shell.

## Result

From the district-grade proof of concept to the O/X pick deck, a little over twenty days; the prototype proper stood thirteen builds inside a week. Why each build changed is recorded in the commit bodies. The decisions were made in meetings, and the prototype was where those decisions became something to look at.
