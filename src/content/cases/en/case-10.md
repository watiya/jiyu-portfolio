---
slug: dials-to-design-md
order: 10
tag: Design system
title: Not just showing the tokens, but letting people take them
role: Design and build
summary: This site builds its tokens from seven dials and wears them. The result could only be shared as a link. Now it downloads as three files, DESIGN.md, CSS and JSON, and all three are built from the dials at that moment rather than prepared in advance.
figure: dials-to-design-md
figureCaption: Nothing is prepared ahead of time. The dials go through the engine and become 91 variables, and each export rewrites that result in the shape its reader needs.
---

## The problem

This site makes one claim. Turn the dials and the site follows. Accent hue,
neutral temperature, type pairing, radius, density, motion, theme. Turn any
of the seven and the primitive steps are recomputed, and the semantic and
component tokens resolve again on top of them.

But the only way to take the result away was a link. A theme link puts the
dial values in the address and reopens the same screen, so it only means
something inside this site. The moment you moved to another project you had
to copy every color by hand. The system could be shown, but not used.

## The call: no file prepared in advance

The easy route was to upload one static token file. But that file holds the
default dials only, and for anyone who turned a dial it is wrong from the
start. Every change to the site would need a second change to the file, and
one day the two would drift.

The engine was already computing 91 CSS variables every time a dial moved,
including text colors whose lightness it had nudged to pass AA. So exporting
became a matter of writing the same result in another shape, not a new
calculation. The dials at the moment you press the button are the content of
the file.

## Three files, three readers

The same values are written three times because three different readers
take them.

- **tokens.css.** For the developer who pastes it in. Plain `:root`
  variables, with the dial values and the theme link in the header so you
  can get back to the screen it came from
- **tokens.json.** For tools. It follows the W3C design tokens format, and
  component tokens point to semantic tokens through aliases instead of
  copying values. `card.bg` is not a color but `{surface.raised}`. The layers
  have to survive inside the file for the receiver to change the theme
- **DESIGN.md.** For people and AI agents. The YAML front matter holds color,
  type, spacing and motion for machines to read, and the body puts the
  principles, components and motion rules into sentences. It is the file you
  hand over when you ask for one more screen in this style

## Values follow, sentences do not

DESIGN.md has a limit. The color table, spacing and motion figures are
generated from the dials, but the sentences about how a card looks and where
the accent goes were written by hand. When the design of the site changes,
those sentences need their own edit.

So the promises a machine can keep moved into tests. Every run checks that
the CSS leaves out none of the engine's variables, that every JSON alias
points to a token that exists, and that DESIGN.md carries no banned
punctuation. People check that the sentences are right. Machines check that
the values are.

## Putting it where people look

At first the buttons sat only at the bottom of the token panel. Whoever opens
the panel is turning dials, so that seemed like the right place. But then
anyone who only scrolls never learns the feature exists.

The system section walks the layers from primitive to screen and ends with
the contrast check. Take was added as step 06 on the next line, so people who
have just seen the layers can download those layers as files. A link beside
it, turn the dials first, leads into the panel.

## The result

What used to be shared as one link is now three files, all from the same
engine. The command palette copies the same content to the clipboard. A
system that was shown became a system that can be used, and anyone looking at
this site can check the difference for themselves.
