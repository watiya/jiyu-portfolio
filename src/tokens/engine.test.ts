// 실행: pnpm test (node --test, 타입 스트리핑)
import { test } from "node:test";
import assert from "node:assert/strict";
import { AA_TEXT, contrast, hexToOklch, luminance, oklchToHex } from "./color.ts";
import {
  ACCENT_STEPS,
  DEFAULT_DIALS,
  NEUTRAL_STEPS,
  PAIRINGS,
  PAIRING_META,
  PRESETS,
  accentScale,
  buildSemantic,
  buildTokens,
  dialsToQuery,
  neutralScale,
  parseDials,
  resolveToken,
  type Dials,
} from "./engine.ts";

const HEX = /^#[0-9a-f]{6}$/;

test("accent scale: 11 steps, hex, lightness falls, hue stays", () => {
  for (const hue of [0, 60, 120, 180, 240, 264, 300, 345]) {
    const s = accentScale(hue);
    assert.equal(s.length, ACCENT_STEPS.length);
    for (const hex of s) assert.match(hex, HEX);
    for (let i = 1; i < s.length; i++) assert.ok(luminance(s[i]) < luminance(s[i - 1]), `hue ${hue} step ${i} darker than ${i - 1}`);
    // 가운데 단계는 색이 있어야 하고, 색상은 지정값에서 크게 벗어나지 않아야 한다
    const mid = hexToOklch(s[5]);
    assert.ok(mid.c > 0.08, `hue ${hue} mid chroma ${mid.c}`);
    const diff = Math.abs(((mid.h - hue + 540) % 360) - 180);
    assert.ok(diff < 6, `hue ${hue} drifted to ${mid.h}`);
  }
});

test("neutral scale: 13 steps from paper to ink, temperature shows in hue", () => {
  for (const temp of ["cool", "neutral", "warm"] as const) {
    const s = neutralScale(temp);
    assert.equal(s.length, NEUTRAL_STEPS.length);
    assert.ok(luminance(s[0]) > 0.95);
    assert.ok(luminance(s[s.length - 1]) < 0.03);
    for (let i = 1; i < s.length; i++) assert.ok(luminance(s[i]) < luminance(s[i - 1]));
  }
  const warm = hexToOklch(neutralScale("warm")[6]);
  const cool = hexToOklch(neutralScale("cool")[6]);
  const flat = hexToOklch(neutralScale("neutral")[6]);
  assert.ok(warm.h > 40 && warm.h < 120, `warm hue ${warm.h}`);
  assert.ok(cool.h > 200 && cool.h < 290, `cool hue ${cool.h}`);
  assert.ok(flat.c < 0.002);
});

test("oklchToHex clips chroma into sRGB instead of clamping channels", () => {
  const hex = oklchToHex({ l: 0.6, c: 0.4, h: 150 });
  assert.match(hex, HEX);
  const back = hexToOklch(hex);
  assert.ok(Math.abs(back.l - 0.6) < 0.02, `lightness kept: ${back.l}`);
  assert.ok(Math.abs(back.h - 150) < 4, `hue kept: ${back.h}`);
});

test("defaults need zero contrast fixes", () => {
  const t = buildTokens(DEFAULT_DIALS);
  assert.deepEqual(t.fixes, []);
});

const everyCombo = (): Dials[] => {
  const out: Dials[] = [];
  for (const theme of ["light", "dark"] as const)
    for (const neutral of ["cool", "neutral", "warm"] as const)
      for (let hue = 0; hue < 360; hue += 15) out.push({ ...DEFAULT_DIALS, theme, neutral, hue });
  return out;
};

test("every hue x theme x neutral passes AA after fixes", () => {
  for (const d of everyCombo()) {
    const { semantic: s } = buildTokens(d);
    const bgs = [s.surface.canvas, s.surface.raised];
    for (const bg of [...bgs, s.surface.sunken]) {
      assert.ok(contrast(s.text.default, bg) >= AA_TEXT, `text.default ${JSON.stringify(d)}`);
      assert.ok(contrast(s.text.muted, bg) >= AA_TEXT, `text.muted ${JSON.stringify(d)}`);
    }
    for (const bg of bgs) assert.ok(contrast(s.text.subtle, bg) >= AA_TEXT, `text.subtle ${JSON.stringify(d)}`);
    assert.ok(contrast(s.accent.on, s.accent.default) >= AA_TEXT, `accent.on ${JSON.stringify(d)}`);
    for (const bg of [...bgs, s.accent.soft]) assert.ok(contrast(s.accent.text, bg) >= AA_TEXT, `accent.text ${JSON.stringify(d)}`);
  }
});

test("contrast fix: a teal accent in light gets nudged and reported", () => {
  const t = buildTokens({ ...DEFAULT_DIALS, hue: 180 });
  const fixed = t.fixes.find((f) => f.token === "accent.text");
  if (!fixed) throw new Error("accent.text was not fixed");
  assert.notEqual(fixed.from, fixed.to);
  const against = [t.semantic.surface.canvas, t.semantic.surface.raised, t.semantic.accent.soft];
  assert.ok(against.some((bg) => contrast(fixed.from, bg) < AA_TEXT), "nominal failed somewhere");
  assert.ok(against.every((bg) => contrast(fixed.to, bg) >= AA_TEXT), "fixed passes everywhere");
  // 보정 후에도 색상은 유지
  assert.ok(Math.abs(hexToOklch(fixed.to).h - 180) < 4);
});

test("contrast fix: a grey accent scale forces accent.default to move", () => {
  // 모든 단계가 중간 회색이면 흰 글자가 안 보이므로 accent.default 를 어둡게 밀어야 한다
  const greys = ACCENT_STEPS.map(() => "#8a8a8a");
  const { semantic, fixes } = buildSemantic(DEFAULT_DIALS, greys, neutralScale("warm"));
  assert.ok(fixes.some((f) => f.token === "accent.default"));
  assert.ok(contrast(semantic.accent.on, semantic.accent.default) >= AA_TEXT);
});

test("contrast fix: muted text that is too light walks toward ink", () => {
  const neutral = neutralScale("warm");
  // 700 자리에 400 색을 넣어 일부러 실패시킨다
  const broken = [...neutral];
  broken[NEUTRAL_STEPS.indexOf(700)] = neutral[NEUTRAL_STEPS.indexOf(400)];
  const { semantic, fixes } = buildSemantic(DEFAULT_DIALS, accentScale(264), broken);
  assert.ok(fixes.some((f) => f.token === "text.muted"));
  assert.ok(contrast(semantic.text.muted, semantic.surface.canvas) >= AA_TEXT);
});

test("presets build and pass AA", () => {
  assert.equal(PRESETS.length, 6);
  for (const p of PRESETS) {
    const { semantic: s } = buildTokens({ ...DEFAULT_DIALS, ...p.dials });
    assert.ok(contrast(s.accent.on, s.accent.default) >= AA_TEXT, p.name);
    assert.ok(contrast(s.text.default, s.surface.canvas) >= AA_TEXT, p.name);
    for (const sw of p.swatches) assert.match(sw.hex, HEX);
  }
});

test("query round trip: only non-default keys, unknown values ignored", () => {
  assert.equal(dialsToQuery(DEFAULT_DIALS), "");
  const d: Dials = { hue: 12, secondary: null, neutral: "cool", pairing: "editorial", radius: 0, density: "airy", motion: "off", theme: "dark" };
  const q = dialsToQuery(d);
  assert.deepEqual(parseDials(new URLSearchParams(q)), d);
  const junk = parseDials(new URLSearchParams("hue=999&neutral=hot&radius=-5&pairing=comic&theme=dark"));
  assert.equal(junk.hue, 360);
  assert.equal(junk.neutral, "warm");
  assert.equal(junk.radius, 0);
  assert.equal(junk.pairing, "geist");
  assert.equal(junk.theme, "dark");
  assert.deepEqual(parseDials(null), DEFAULT_DIALS);
});

test("spacing comes from the scale and follows density", () => {
  const compact = buildTokens({ ...DEFAULT_DIALS, density: "compact" }).vars;
  const regular = buildTokens(DEFAULT_DIALS).vars;
  const airy = buildTokens({ ...DEFAULT_DIALS, density: "airy" }).vars;
  assert.equal(regular["--space-4"], "16px");
  assert.equal(compact["--space-4"], "13.6px");
  assert.equal(airy["--space-4"], "19.2px");
  assert.equal(regular["--radius-2"], "6px");
  assert.equal(buildTokens({ ...DEFAULT_DIALS, motion: "off" }).vars["--duration-2"], "0ms");
});

test("accent.secondary: source equals accent, presets keep brand hex or nudge it, on-color passes AA", () => {
  const src = buildTokens(DEFAULT_DIALS).semantic.accent;
  assert.equal(src.secondary, src.default);
  assert.equal(src.secondaryOn, src.on);
  for (const p of PRESETS) {
    const t = buildTokens({ ...DEFAULT_DIALS, ...p.dials });
    const { secondary, secondaryOn } = t.semantic.accent;
    assert.ok(contrast(secondaryOn, secondary) >= AA_TEXT, `${p.name} secondary on-color`);
    const moved = t.fixes.some((f) => f.token === "accent.secondary");
    if (!moved) assert.equal(secondary, p.dials.secondary, `${p.name} keeps brand hex`);
    else assert.ok(Math.abs(hexToOklch(secondary).h - hexToOklch(p.dials.secondary!).h) < 4, `${p.name} nudge keeps hue`);
  }
  // 중간 회색 브랜드 색은 흰/먹 모두 미달이라 밝기가 움직여야 한다
  const grey = buildTokens({ ...DEFAULT_DIALS, secondary: "#7a7a7a" });
  assert.ok(grey.fixes.some((f) => f.token === "accent.secondary"));
  assert.ok(contrast(grey.semantic.accent.secondaryOn, grey.semantic.accent.secondary) >= AA_TEXT);
  // 쿼리 왕복
  const q = dialsToQuery({ ...DEFAULT_DIALS, secondary: "#d9ff5b" });
  assert.equal(q, "sec=d9ff5b");
  assert.equal(parseDials(new URLSearchParams(q)).secondary, "#d9ff5b");
  assert.equal(parseDials(new URLSearchParams("sec=zzz")).secondary, null);
});

test("token chain resolver follows var() links down to the primitive", () => {
  const t = buildTokens(DEFAULT_DIALS);
  const card = resolveToken("card.bg", t);
  assert.ok(card);
  assert.deepEqual(card.links.map((l) => l.name), ["card.bg", "surface.raised", "neutral.0"]);
  assert.equal(card.value, t.semantic.surface.raised);
  assert.equal(card.text, `card.bg → surface.raised → neutral.0 = ${t.semantic.surface.raised}`);
  const btn = resolveToken("button.bg", t);
  assert.deepEqual(btn?.links.map((l) => l.name), ["button.bg", "accent.default", "accent.600"]);
  const pad = resolveToken("card.pad", t);
  assert.equal(pad?.text, "card.pad → space.5 = 24px");
  // 보정으로 밀린 포인트색은 가장 가까운 단계에 * 표시
  const teal = buildTokens({ ...DEFAULT_DIALS, hue: 180 });
  const txt = resolveToken("accent.text", teal);
  assert.ok(txt && /accent\.\d+\*/.test(txt.links[txt.links.length - 1].name), txt?.text);
  assert.equal(resolveToken("nope.token", t), null);
});

test("pairings: every stack ends in the Pretendard fallback, funnel carries Funnel faces and Geist Mono", () => {
  for (const p of PAIRINGS) {
    const m = PAIRING_META[p];
    for (const stack of [m.heading, m.body, m.mono]) assert.match(stack, /'Pretendard Variable'/, `${p} stack lacks Hangul fallback`);
  }
  assert.match(PAIRING_META.funnel.heading, /^'Funnel Display Variable'/);
  assert.match(PAIRING_META.funnel.body, /^'Funnel Sans Variable'/);
  assert.match(PAIRING_META.funnel.mono, /^'Geist Mono Variable'/);
  assert.equal(parseDials(new URLSearchParams("pairing=funnel")).pairing, "funnel");
  assert.match(buildTokens(DEFAULT_DIALS).vars["--font-pixel"], /^'Geist Pixel'/);
});
