# Jiyu

**Design Engineer**

I turn messy product rules into systems that ship.

- brainchild.jiyu@gmail.com
- Portfolio [brainchild.kr](https://www.brainchild.kr/projects)
- GitHub [github.com/watiya](https://github.com/watiya)

---

## Summary

- 14 years in UI/UX (full time since 2012), preceded by UI design work from 2003 to 2011
- A consecutive run of blockchain and gaming product screens: BORA, Play2bit, NAODA, OVERTAKE, Starzip
- I design the system and the information architecture, and **I decide the policy those screens follow.**
  Today I own design and product management from one seat
- The work does not stop at design: **I build the screens and the source of truth myself.**
  React, Next.js, with Claude Code in the daily loop
- The failure I guard against hardest is having two sources of truth. The standard lives in one place,
  and drift is caught by machine

## Capabilities

Design systems (primitive and semantic token layers, theme checks, promotion criteria), information
architecture and screen design, product policy (wording systems for regulated screens, confirmed
state, verifiable acceptance criteria), and delivery operations (role boundaries, release gates,
self-aggregating progress), held from one seat.

**Tools** Figma, Framer, Webflow / HTML, CSS, React, Next.js / Cursor, Claude, ChatGPT, Gemini / After Effects, Spline

---

## Experience

### Starzip · 2026.02 - Present
**Head of UX/UI, PM/PO and Design**

An opBNB-based DEX and token launchpad for local merchants. Working alongside a three-person
engineering team, **I own design and product management end to end, as the only person in that role.**
Four products are under management: the design system, screen-spec operations, product policy
calls, and the release gate. Most of the product screens, backend aside, I built myself.

**What distinguishes this role is that the role boundary itself is written down.** Product policy
(users, classification, priority, confirmed state, acceptance criteria) is decided by product;
servers, APIs and storage are chosen by engineering. Checks hold that boundary, so implementation
choices stop returning as open product questions and screen decisions stop landing on engineering.

Repository record for the product codebases, 2026-04-15 to 2026-08-10 (3.8 months):

| | |
|---|---|
| Areas of work | 11 |
| Active days | 97 |
| Commits | 2,621 |
| Product routes | 444 |
| Shared components | 889 |
| Token definitions | 544 |
| Canonical documents | 45 decisions, 17 policies, 62 features, 11 conventions, 124 delivery, 50 design, 60 meeting notes |

Selected work (the rest is in the [work index](/work)):

- **Entry without a wallet.** Most buyers of an on-chain asset sale had no wallet, and asking for one
  first lost them before they saw the product. I split login from wallet: an account browses, and a
  wallet is required only at purchase.
- **Moved the design system onto code as the source of truth.** The standard was split across the
  design file and the shipped screens, kept in sync by human comparison. I unified it onto running
  code in primitive and semantic token layers, and turned silent failures such as a missing
  dark-theme token into checks.
- **Built only what ships, separately.** A request came to use an internal-only screen from outside.
  Rather than open the access boundary, I built a separate artifact through a reduced router carrying
  only the screens meant to leave, taking **the bundle from 136MB to 1.8MB.**
- **Collapsed the release gate to one.** Several product areas shipped together through several gates,
  which made each one negotiable. I reduced it to one gate and fixed three axes on every ticket
  (feature, product area, layer) so progress aggregates itself.

> Figures are extracted by script from repository history. The first two months after joining ran in
> design tools only, and that work is not machine-countable, so it is not included here.

### OVERTAKE Labs · 2024.01 - 2026.01
**UI/UX Designer**

Design system and brand rules, the marketplace (game item trading moved on-chain; the 2026 revision
made verified account trades visually distinguishable), the quest platform and its marketplace,
the landing site, Stakehouse, tiktem.gg.

### Flask · 2022.08 - 2023.12
**UI/UX Designer**

NAODA Beta, design system and marketplace prototype (a gaming platform where participation becomes
eligibility), MOIDA UI.

### Friends Games / METABORA · 2021.07 - 2022.08
**UI/UX Designer**

BORA 2.0 and its guide screens, BORA Scope (a chain explorer), Todayis, METAPICK design system,
Friends Games website.

### Way2bit · 2018.10 - 2021.06
**UI/UX Designer**

Play2bit app, market and membership (playtime selection), Spera-LuckyDayBet (a stablecoin gaming
platform), the Astellia Royal website redesign, the BORA 1.0 family (Island, Atoll, Lagoon,
Explorer, Wallet, Membership, Ecosystem).

### Earlier · 2003.08 - 2018.10

- **TLX PASS** · 2018.04 - 2018.10 · UI/UX Designer
- **Syworks** · 2017.09 - 2018.02 · Designer
- **Mog Communications** · 2017.04 - 2017.06 · Designer / Freelancer
- **Freelance** · 2015.01 - 2017.03 · UI/UX Designer
- **SocialApps** · 2012.11 - 2016.02 · UI/UX Designer
- **PNP Soft, NSoft** · 2003.08 - 2011.10 · UI Designer / Full-time, Freelancer
- **SK T Academy** · from 2010.06 · UX/UI lecturer

<!--
- Starzip figures come from facts.json (machine-generated, 2026-08-10)
- Phone number deliberately omitted. Add it at the top per application if needed.
-->
