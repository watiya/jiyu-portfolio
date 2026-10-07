---
slug: dex-beta
order: 9
tag: Product design
title: Not finishing a design with one happy screen, but standing every state on one page
role: Product screen design and UI build
summary: The design file had the happy screen and the empty one was a frame marked "content TBD". Empty, error, loading and mobile were built in code first, laid out on one page, and sent back into the design file.
figure: dex-beta
figureCaption: Hand over one happy screen and the remaining states get decided on the spot by whoever implements it. Lay the states out on one page and there is nothing left to decide.
---

## The problem

The beta screens of an exchange for local-store tokens. Market, store, trade, launchpad and portfolio were one product, starting from twelve routes.

The design file had the happy screens. What the market shows when no store is listed yet, when a search returns nothing, when the network drops, when there is no wallet yet - those were empty frames marked "content TBD". Hand it over like that and the rest gets decided on the spot by whoever implements it. The decision differs from screen to screen, and later nobody can tell which one was intended.

## The call: build the states in code first

Instead of filling the empty frames in the design file, the states were built in code first. One route lists every state of one screen. For trade that means closed, choose a buy method, confirm, done, choose a sell method, each with a label and a note, standing in a row.

Empty was not a single state. When the reason for having no data differs, what the screen has to say differs too. No store listed yet, a filter that is too narrow, a misspelled query and a failed fetch are not the same empty screen. The market's empty state was split into four by cause.

Mobile was built separately. A desktop slide-out becomes a bottom sheet on mobile, and the scenarios change at 384 pixels wide. The state names stayed the same; the screens did not.

## Sent back into the design file

The state screens built in code became the first draft and were reflected back into the design file. Design following code. The happy screens started in the design file and the state screens started in code, and whichever comes first, the two have to match at the end. A separate gate checks that match with deterministic screenshots and pixel diffs.

## Result

Twenty-three state bundles. Market, launchpad, trade, store, portfolio, header, mobile menu and wallet each have their non-happy states standing on one page. From the beta scaffold to the first GA screen took twenty-eight days, and the screen bodies went up as a shared package that the product repository consumes. How that happened is in the case [The design tool is no longer the source of truth, and the code moved into packages](/cases/design-system-in-code).
