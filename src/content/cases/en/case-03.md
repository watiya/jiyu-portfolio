---
slug: exposure-as-a-build
order: 3
tag: Delivery
title: Building only what goes out, instead of opening the firewall
role: Release boundary design and build
summary: The ask was to use one screen from outside the company, but that screen shipped in the same bundle as the internal ones. Instead of opening access, I built only the part that goes out.
image: valuation-entry
imageCaption: The whole of what went outside. Only the result and the place for supporting documents stand here; no one else's figures and no internal screens.
figure: exposure-as-a-build
figureCaption: Open the firewall and the whole bundle opens with it. Screens that are never imported never ship, so the file that lists what is imported becomes the definition of what is exposed.
---

## What this screen is

Starzip is a product where a local store issues a token under its own name.
Before issuing, the store has to arrive at some sense of what it is worth, and the
owner of a cafe or a restaurant has no ready way to produce that number. A
professional appraisal costs money and time, and nobody pays it before deciding
whether to issue at all.

So this screen is a self-assessment the owner runs themselves. One method computes
the value and we lay no weights on top, because the moment we touch the number it
stops being the store's value and becomes our verdict. The people who open this
screen are stores that have not entered the product yet, and the ones who meet
those stores are partners rather than us. That is why it had to go outside.

## The problem

The request was to use the store valuation screen from outside the company and
hand partners a link to it.

At the time the screen lived only inside the corporate network. Getting it outside
meant building that screen on its own. All the screen code ships in one bundle, so
simply opening the address sends out screens that have no reason to leave.

Splitting access permissions screen by screen was also available. But when the
thing that needs to go out is a single screen, that path adds rules to keep. Added
rules have to be kept again every time a screen is added, and the fact that one was
not kept only shows up once something goes wrong.

## The judgment: I built only the part that goes out

The source stays together and only the release artefact is split. A reduced router
imports just the screen that goes out, and the build runs through that router.

- A screen that is never imported never ships. That makes **the one file listing
  what is imported the definition of what is exposed**. The boundary is an
  artefact rather than a rule, so there is never an occasion to check whether it
  is being kept
- The first artefact came out at 136MB, because the build tool copies the static
  asset folder wholesale and the internal assets came with it. Splitting off a
  dedicated folder and keeping only the files actually used brought it to 1.8MB
- The in-house development tooling came out too. The screen switcher and the links
  into internal documents must not be visible from outside
- Verification was not done by eye. I served the built artefact and opened the
  internal paths one at a time, comparing responses to confirm they all fall back
  to this screen. The internal assets are simply not in the artefact

## What I decided not to do

**No crawler-blocking file.** It went into the requirements once and then came
back out.

Blocking the crawl and blocking the index are different jobs. Block the crawl and
the robot never reads the page at all, which means it never sees the no-index
marker already sitting in the document. If a link to the address exists somewhere
out there, the address can then surface in search results with no content behind
it. That is a worse place than the one we were avoiding. The marker on its own is
safer.

**No password either.** The purpose was for partners to receive a link, and a
password travels in the same message as the link it protects. That looks like
protection without being any. Instead we closed the path where search leads people
in, and decided that nothing in the product links to this address.

## Outside, the same sentence stands somewhere else

While the screen sat behind the firewall its wording was not exposure. The moment
the address goes out, those same sentences move into a position where people
outside the company read them as grounds for judgment. So the wording was revised
alongside.

- A footnote on the result screen described itself as reference material for a
  decision. That sentence came out. What a screen declines to claim has to be
  settled as deliberately as what it claims
- A button that did nothing came out. There is no reason to leave a dead control
  on a screen that shows figures with no server and no save behind it
- The save-draft button came out as well. Values were already being saved
  automatically, so the button had no work to do. Leaving it as a button reads as
  nothing being saved unless you press it, which to an outside reader implies the
  values are kept on a server
- That last one changed the internal review screen too. Once the screen under
  review and the screen partners see diverge, nobody looks at the one that
  diverged

Input values never go to a server; they stay in the browser. The retention window
counts from the last time the person touched it. Counting from the first entry
would take the values away mid-task from someone gathering their paperwork across
two days.

## The result

One screen opens outside the corporate network, and the rest of what shared its
bundle does not exist at that address. The boundary is an artefact rather than a
rule, so it does not blur as time passes.

What I could not settle is worth recording too. How it reads, from outside, for a
company to publish a tool that computes a value and presents it at a public
address was not mine to decide. What the screen says and on what terms it opens
was my part; the character of the act went to the people who judge that. I did not
hold the release while that judgment was pending. Going public was the reason to
ask for it sooner.
