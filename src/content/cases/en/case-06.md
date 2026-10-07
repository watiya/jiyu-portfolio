---
slug: content-studio
order: 6
tag: Design tooling
title: Building the tool so nobody has to wait for a designer
role: Internal content tool design and build
summary: The specs were already settled and a person was the bottleneck. Instead of widening the bottleneck I built a tool that knows the specs.
figure: content-studio
figureCaption: Output that needed no judgment was still queueing behind a person. Move it to a tool that knows the spec and there is nothing to queue for.
---

## The problem

Announcement images, banners, share cards: output whose format was already fixed
still had to pass through a designer's queue every time. It was not work that needed
judgment, only text and images placed into a settled frame.

When that queue grows, two things happen. Whoever is in a hurry builds outside the
spec and the brand splits, and whoever is not in a hurry does not build at all. Both
undo the reason for having a spec.

## The call: I built the tool

Rather than adding people, I built an editor that knows the spec. Templates, layers,
and assets on the left, the canvas in the middle, design and export on the right.
Choosing a template means the spec is already satisfied, and all the user does is
put in the words and the pictures.

I did not skip what an editor is expected to have: deck-level undo and redo, layer
search, a command palette, background presets. Miss any one of them and people go
back to the tool they know, and the moment they do the spec splits again.

## Export was the real problem

The time went not into editing but into export.

- **Do not leave ratios for people to remember.** Platform ratios and tone were bundled
  into presets. Most of what a spec-aware tool is worth sits right here
- **Hidden layers were showing up in the output.** Something switched off on screen but
  present in the file is the kind of error a user is unlikely to catch. Export was
  fixed to see the same thing the screen sees
- **Capturing off-screen produced a blank image**, because rendering does not happen
  off-screen. The capture target now sits on-screen for the duration of the capture

## Removing the server

At first the generation feature went through a server route. I tore that wiring out
and replaced it with an adapter called directly from the browser. The whole tool ships
as static files.

Going static made deployment easier, but the larger reason was that users bring their
own key. A key that passes through a server gives the server a place to leak it, and
that place should be removed rather than guarded by care. With no server, nothing
leaks from the server.

## Result

Fixed-format output stopped passing through a queue. Built in about five working days,
counted from the days that left commits: 151 commits on five active days, May 17 to June 10. It went that fast because almost nothing new
was decided. The spec already lived in the design system, and the tool only had to
read it.
