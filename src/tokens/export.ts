// 지금 다이얼이 만든 토큰을 파일로 내보낸다. CSS 는 :root 변수 그대로, JSON 은 W3C 디자인 토큰(DTCG) 형식.
// 이름 규칙은 화면과 같다: --card-line-hover 는 card.line-hover, var(--surface-raised) 는 별칭 {surface.raised}
import { ACCENT_STEPS, NEUTRAL_STEPS, PAIRING_META, SPACE_SCALE, dialsToQuery, type Tokens } from "./engine.ts";

const SITE = "https://www.brainchild.kr/projects";

export function themeLink(tokens: Tokens): string {
  const q = dialsToQuery(tokens.dials);
  return q ? `${SITE}?${q}` : SITE;
}

const dialLine = (tokens: Tokens) =>
  Object.entries(tokens.dials)
    .map(([k, v]) => `${k}=${v ?? "-"}`)
    .join(" · ");

export function toCss(tokens: Tokens): string {
  const lines = Object.entries(tokens.vars).map(([k, v]) => `  ${k}: ${v};`);
  return [
    "/* Brainchild-Jiyu tokens",
    ` * dials: ${dialLine(tokens)}`,
    ` * theme: ${themeLink(tokens)}`,
    " * fonts are referenced by name, load them yourself (Fontsource, Pretendard)",
    " */",
    ":root {",
    ...lines,
    "}",
    "",
  ].join("\n");
}

type Leaf = { $value: unknown; $type?: string };
type Group = { [key: string]: Group | Leaf | string | Record<string, unknown> };

const path = (cssVar: string) => {
  const name = cssVar.replace(/^--/, "");
  const i = name.indexOf("-");
  return i < 0 ? [name] : [name.slice(0, i), name.slice(i + 1)];
};

function leaf(name: string, value: string): Leaf {
  const alias = value.match(/^var\((--[\w-]+)\)$/);
  if (alias) return { $value: `{${path(alias[1]).join(".")}}` };
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return { $type: "color", $value: value };
  if (/^-?[\d.]+px$/.test(value)) return { $type: "dimension", $value: value };
  if (/^[\d.]+ms$/.test(value)) return { $type: "duration", $value: value };
  const bezier = value.match(/^cubic-bezier\(([^)]+)\)$/);
  if (bezier) return { $type: "cubicBezier", $value: bezier[1].split(",").map(Number) };
  if (value === "linear") return { $type: "cubicBezier", $value: [0, 0, 1, 1] };
  if (name.startsWith("--font-")) return { $type: "fontFamily", $value: value.split(",").map((f) => f.trim().replace(/^'|'$/g, "")) };
  if (name.endsWith("-weight")) return { $type: "fontWeight", $value: Number(value) };
  return { $value: value };
}

export function toJson(tokens: Tokens): string {
  const root: Group = {
    $description: `Brainchild-Jiyu tokens · ${dialLine(tokens)}`,
    $extensions: { "kr.brainchild": { dials: tokens.dials, theme: themeLink(tokens) } },
  };
  for (const [name, value] of Object.entries(tokens.vars)) {
    const [group, key] = path(name);
    if (key === undefined) {
      root[group] = leaf(name, value);
      continue;
    }
    const g = (root[group] ??= {}) as Group;
    g[key] = leaf(name, value);
  }
  return JSON.stringify(root, null, 2) + "\n";
}

// 사람과 AI 에이전트가 읽고 그대로 따라 만들 수 있는 설계 문서. 앞머리 YAML 은 기계가, 본문은 사람이 읽는다
export function toDesignMd(tokens: Tokens): string {
  const { dials, semantic: s, vars } = tokens;
  const pair = PAIRING_META[dials.pairing];
  const first = (stack: string) => stack.split(",")[0].replace(/'/g, "").trim();
  const row = (name: string, hex: string, use: string) => `| \`${name}\` | \`${hex}\` | ${use} |`;
  const scale = (steps: readonly number[], hexes: string[]) => steps.map((st, i) => `\`${st}\` ${hexes[i]}`).join(" · ");
  const space = SPACE_SCALE.map((_, i) => vars[`--space-${i + 1}`]);
  return `---
name: Brainchild-Jiyu
theme: ${dials.theme}
source: ${themeLink(tokens)}
colors:
  canvas: "${s.surface.canvas}"
  raised: "${s.surface.raised}"
  sunken: "${s.surface.sunken}"
  text: "${s.text.default}"
  text-muted: "${s.text.muted}"
  line: "${s.line.default}"
  accent: "${s.accent.default}"
  on-accent: "${s.accent.on}"
  accent-text: "${s.accent.text}"
  secondary: "${s.accent.secondary}"
typography:
  heading: "${first(pair.heading)}"
  body: "${first(pair.body)}"
  mono: "${first(pair.mono)}"
  hangul: "Pretendard Variable"
  heading-weight: ${pair.weight}
radius: { sm: ${vars["--radius-1"]}, md: ${vars["--radius-2"]}, lg: ${vars["--radius-3"]} }
spacing: [${space.join(", ")}]
motion: { fast: ${vars["--duration-1"]}, base: ${vars["--duration-2"]}, slow: ${vars["--duration-3"]}, ease: "${vars["--ease-default"]}" }
---

# Brainchild-Jiyu design system

A living spec sheet. The page reads like a design file: mono annotations, dimension lines, crosshair corners, token names shown next to what they paint. Calm surfaces, one accent, and the accent is mostly used to *annotate*, not to decorate.

Generated from the dials \`${dialLine(tokens)}\`. Open the source link above to see the same tokens live, or turn the dials there and download again.

## Principles

- **Show the system.** Label things with their token names (\`card.bg → surface.raised\`) in mono, small, subtle. Annotation is part of the look.
- **One accent.** \`accent\` for primary actions and focus; \`accent-text\` for annotations, numbers, live values. Everything else is neutral.
- **Every text color passes WCAG AA** on every surface it sits on. The engine nudges lightness until it does${tokens.fixes.length ? ` (this export nudged ${tokens.fixes.map((f) => f.token).join(", ")})` : ""}.
- **Layers, not values.** Components never use a raw hex. Primitive → semantic → component → screen.

## Color

| Token | Value | Use |
|---|---|---|
${[
  row("surface.canvas", s.surface.canvas, "Page background"),
  row("surface.raised", s.surface.raised, "Cards, panels"),
  row("surface.sunken", s.surface.sunken, "Stages, chips, wells (often with a 24px grid)"),
  row("surface.inverse", s.surface.inverse, "Inverted blocks, toasts"),
  row("text.default", s.text.default, "Body and headings"),
  row("text.muted", s.text.muted, "Secondary copy, ledes"),
  row("text.subtle", s.text.subtle, "Meta, mono labels"),
  row("line.default", s.line.default, "Hairlines, card borders"),
  row("line.strong", s.line.strong, "Hover borders, dimension lines"),
  row("accent.default", s.accent.default, "Primary button, focus ring"),
  row("accent.on", s.accent.on, "Text on accent"),
  row("accent.text", s.accent.text, "Annotations, live values, links in mono"),
  row("accent.soft", s.accent.soft, "Tinted backgrounds"),
  row("accent.secondary", s.accent.secondary, "Badges, active nav, selection"),
].join("\n")}

Primitive scales (OKLCH, generated from hue ${dials.hue}):

- accent: ${scale(ACCENT_STEPS, tokens.accent)}
- neutral (${dials.neutral}): ${scale(NEUTRAL_STEPS, tokens.neutral)}

## Typography

- **Headings** ${first(pair.heading)}, weight ${pair.weight}, tracking ${pair.tracking} (Hangul ${pair.trackingKo})${pair.italic ? ", italic" : ""}. Hero runs very large (around 120px, line-height 0.95) and tight.
- **Body** ${first(pair.body)}, 16-18px, line-height 1.5-1.6, max 60ch.
- **Mono** ${first(pair.mono)} for every annotation: section indices, token names, spec rows, dimension values. Small (11-13px), often uppercase with 0.06em tracking.
- **Hangul** falls back to Pretendard Variable inside every stack.
- Section numbers (\`01\`, \`02\`) use Geist Pixel.

## Space, radius, density

- Spacing scale (density ${dials.density}): ${space.join(" · ")}.
- Radius: sm ${vars["--radius-1"]} · md ${vars["--radius-2"]} · lg ${vars["--radius-3"]} · xl ${vars["--radius-4"]}. Buttons use md, cards lg, chips sm.
- Layout: 12-column grid, generous vertical rhythm between sections, hairline rules under section labels.

## Components

- **Section label**: \`01 / HERO\` mono on the left, a short mono aside on the right, hairline below.
- **Card**: raised surface, 1px \`line.default\` border that turns \`line.strong\` on hover, radius lg, padding ${vars["--space-5"]}. Top row: mono index + chip. A sunken stage with a 24px grid holds the screenshot.
- **Button**: accent background, \`accent.on\` text, radius md. Ghost variant: transparent with \`line.strong\` border.
- **Chip / badge**: chip is sunken + muted text; badge (current state) is \`accent.secondary\`.
- **Dimension annotations**: thin \`line.strong\` rules with end ticks, value in \`accent.text\` mono, unit in subtle mono. Values are draggable.
- **Crosshair corners**: small + marks at the ends of a sheet's top rule.

## Motion

Durations ${vars["--duration-1"]} / ${vars["--duration-2"]} / ${vars["--duration-3"]}, ease \`${vars["--ease-default"]}\`, emphasis \`${vars["--ease-emphasis"]}\`.

- Motion explains, it does not decorate. The hero headline types in letter by letter with an accent caret, then dimension lines draw and spec values print.
- Sections rise ${vars["--space-3"]} and fade in once. Cards enter one by one; on hover the stage gets a soft accent light and the phone tilts toward the pointer.
- Respect \`prefers-reduced-motion\`: with motion off, everything is simply there.

## Don't

- Don't use the accent for large fills or gradients.
- Don't use em dashes in copy; use a hyphen, comma or parentheses.
- Don't put raw hex values in components; go through a semantic token.
`;
}

export const EXPORTS = [
  { file: "DESIGN.md", type: "text/markdown", build: toDesignMd },
  { file: "tokens.css", type: "text/css", build: toCss },
  { file: "tokens.json", type: "application/json", build: toJson },
] as const;

export function download(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
