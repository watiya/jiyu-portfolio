---
slug: entry-without-a-wallet
order: 1
tag: Product Design
title: Letting people see all of it without a wallet, and asking for one only at purchase
role: Product definition and screen design
summary: We were selling an on-chain asset and most of the buyers had no wallet. Rather than making entry easier, I moved the point where entry is required.
image: genesis-entry
imageCaption: The live site, [genesis.starzip.io](https://genesis.starzip.io), already public. Not a mockup. Browsing sits in front of sign-in, and signing in and buying stand as separate doors.
figure: entry-without-a-wallet
figureCaption: Put the wallet up front and people are filtered out before they have seen what is for sale. Split browsing from buying and the wallet is only needed just before payment.
---

## The problem

The product sold an on-chain asset, and most of the people who might buy it had no
wallet. Demand a wallet first and people are filtered out before they have seen what
the product is. Those people did not leave because they were uninterested, they left
because they lacked a prerequisite, and on screen the two look identical.

I did not build these screens. I owned the product definition and the design, and the
engineering team built it. So what I produced was not working screens but a judgment
about where to ask for what, and where not to ask at all.

## The decision: split browsing from buying

Login and wallet were not bound into one door. An account gets you all the way through
what the product is and what it gives you, and the wallet is asked for only at the
point of actually buying.

- An account names a **person** and a wallet names an **asset**. They point at
  different things to begin with, so binding them means changing one drags the other
- Lead with the wallet and the drop-off happens **before the judgment.** People leaving
  after seeing what is for sale is information; people leaving before that tells you
  nothing
- Someone who wants to buy will go get the prerequisite. Demanding the prerequisite
  before the wanting is what puts the order wrong

## What I decided not to do

The easiest fix was to issue the wallet for them, and I did not do it.

Issuing it does make entry demonstrably smoother. But at that moment the key passes
through us, and any place a key passes through is a place it can leak from. Such a
place is not something to guard carefully, it is something not to create. A rule you
promise to keep is a rule you eventually fail to keep; a place that does not exist
needs no keeping.

Instead there are several ways to pick a wallet, and the path back from picking one is
kept unbroken. In any design that sends people out, the place you actually lose them is
not the door out but the door back.

## The result

Someone without a wallet can see the whole product first and then decide whether to get
one. And because there was never a place where we hold the key, there is no later work
of protecting it.

The cost is written down honestly. Empty the front and the back gets heavier. The
hardest step now sits immediately before payment, and how to lighten that step is not
something these screens finished.
