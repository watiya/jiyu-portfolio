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
  presetBySlug,
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
  assert.equal(PRESETS.length, 10);
  for (const p of PRESETS) {
    const { semantic: s } = buildTokens({ ...DEFAULT_DIALS, ...p.dials });
    assert.ok(contrast(s.accent.on, s.accent.default) >= AA_TEXT, p.name);
    assert.ok(contrast(s.text.default, s.surface.canvas) >= AA_TEXT, p.name);
    for (const sw of p.swatches) assert.match(sw.hex, HEX);
  }
});

test("query round trip: only non-default keys, unknown values ignored", () => {
  assert.equal(dialsToQuery(DEFAULT_DIALS), "");
  const d: Dials = { hue: 12, primary: null, secondary: null, neutral: "cool", paper: "white", pairing: "editorial", radius: 0, scale: 130, density: "airy", motion: "off", theme: "dark" };
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

test("type scale: 100 keeps the hand-set steps, other values spread or pull them, body stays", () => {
  const at = (scale: number) => buildTokens({ ...DEFAULT_DIALS, scale }).vars;
  const src = at(100);
  assert.deepEqual([src["--text-base"], src["--text-lg"], src["--text-xl"], src["--text-2xl"], src["--text-3xl"]], ["17px", "20px", "24px", "32px", "44px"]);
  const tight = at(60);
  const loud = at(140);
  for (const k of ["--text-lg", "--text-xl", "--text-2xl", "--text-3xl"]) {
    assert.ok(parseFloat(tight[k]) < parseFloat(src[k]) && parseFloat(src[k]) < parseFloat(loud[k]), k);
  }
  assert.equal(loud["--text-base"], "17px");
  assert.equal(parseDials(new URLSearchParams("scale=999")).scale, 140);
  assert.equal(parseDials(new URLSearchParams("scale=abc")).scale, 100);
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

test("accent.primary: preset brand hex stays as accent.default with a readable on-color", () => {
  const lime = buildTokens({ ...DEFAULT_DIALS, primary: "#75fc96" });
  assert.equal(lime.semantic.accent.default, "#75fc96");
  assert.ok(contrast(lime.semantic.accent.on, lime.semantic.accent.default) >= AA_TEXT);
  const q = dialsToQuery({ ...DEFAULT_DIALS, primary: "#75fc96" });
  assert.equal(parseDials(new URLSearchParams(q)).primary, "#75fc96");
  assert.equal(parseDials(new URLSearchParams("pri=zzz")).primary, null);
});

test("mono pairing: headings and body both mono, annotations in JetBrains Mono, leading opens up", () => {
  const m = PAIRING_META.mono;
  assert.match(m.heading, /^'Geist Mono Variable'/);
  assert.match(m.body, /^'Geist Mono Variable'/);
  assert.match(m.mono, /^'JetBrains Mono Variable'/);
  for (const stack of [m.heading, m.body]) assert.doesNotMatch(stack, /serif'|Serif/, "no serif in an all-mono pairing");
  assert.equal(parseDials(new URLSearchParams("pairing=mono")).pairing, "mono");
  const v = buildTokens({ ...DEFAULT_DIALS, pairing: "mono" }).vars;
  assert.equal(v["--font-heading"], m.heading);
  assert.equal(v["--heading-leading"], String(m.leading));
  assert.ok(m.leading > PAIRING_META.geist.leading);
  // 다른 조합은 손으로 맞춘 줄간 그대로
  assert.equal(buildTokens(DEFAULT_DIALS).vars["--heading-leading"], "1.05");
});

test("ink preset: white paper, ink buttons, radius 0, mono, AA in both themes", () => {
  const p = presetBySlug("ink");
  if (!p) throw new Error("ink preset missing");
  assert.equal(p.system, true);
  assert.equal(p.dials.radius, 0);
  assert.equal(p.dials.pairing, "mono");
  for (const theme of ["light", "dark"] as const) {
    const t = buildTokens({ ...DEFAULT_DIALS, ...p.dials, theme });
    const s = t.semantic;
    if (theme === "light") {
      // 견본의 아이보리·먹은 실제 canvas·글자 색과 같아야 한다
      assert.equal(s.surface.canvas, p.swatches[0].hex);
      assert.equal(s.text.default, p.swatches[1].hex);
      assert.equal(s.accent.default, p.dials.primary);
      assert.equal(t.vars["--radius-2"], "0px");
    }
    for (const bg of [s.surface.canvas, s.surface.raised, s.surface.sunken]) {
      assert.ok(contrast(s.text.default, bg) >= AA_TEXT, `${theme} text.default`);
      assert.ok(contrast(s.text.muted, bg) >= AA_TEXT, `${theme} text.muted`);
    }
    for (const bg of [s.surface.canvas, s.surface.raised]) assert.ok(contrast(s.text.subtle, bg) >= AA_TEXT, `${theme} text.subtle`);
    assert.ok(contrast(s.accent.on, s.accent.default) >= AA_TEXT, `${theme} accent.on`);
    // 먹 버튼이 어두운 바탕에 묻히지 않는다
    assert.ok(contrast(s.accent.default, s.surface.canvas) >= 3, `${theme} accent on canvas`);
    assert.ok(contrast(s.accent.secondaryOn, s.accent.secondary) >= AA_TEXT, `${theme} secondary.on`);
    for (const bg of [s.surface.canvas, s.surface.raised, s.accent.soft]) assert.ok(contrast(s.accent.text, bg) >= AA_TEXT, `${theme} accent.text`);
  }
});
