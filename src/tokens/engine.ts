// 다이얼 -> 원시 -> 의미 -> 컴포넌트 토큰. 결과는 CSS 변수 맵과 보정 기록.
import { AA_TEXT, contrast, hexToOklch, oklchToHex } from "./color.ts";
import { isHiddenApp } from "../hidden.ts";

export type Neutral = "cool" | "neutral" | "warm";
export type Pairing = "geist" | "editorial" | "grotesk" | "funnel" | "mono";
export type Density = "compact" | "regular" | "airy";
export type Motion = "off" | "calm" | "lively";
export type Theme = "light" | "dark";
export type Paper = "tint" | "white";

export type Dials = {
  hue: number; // 0..360
  primary: string | null; // 앱 프리셋의 브랜드 색(hex) 그대로. 있으면 hue 램프 대신 accent.default 가 된다
  secondary: string | null; // 앱 프리셋의 둘째 브랜드 색(hex). 없으면 accent 와 같다
  neutral: Neutral;
  paper: Paper; // 밝은 테마 바탕. tint 는 중립색 50 단계, white 는 순백(카드는 선으로 가른다)
  pairing: Pairing;
  radius: number; // 0..24
  scale: number; // 60..140. 타입 스케일 대비(%). 100 이 손으로 맞춘 기본 단계
  density: Density;
  motion: Motion;
  theme: Theme;
};

// 프리셋 밑바탕: 앱 프리셋은 이 위에 자기 값만 덮는다. 10-14 까지의 기본값(종이 위에 파랑 한 점)이고,
// 브랜드 색 없이 램프만으로 보정 0 건이라 엔진 테스트의 기준점으로도 쓴다.
export const PRESET_BASE: Dials = {
  hue: 264,
  primary: null,
  secondary: null,
  neutral: "warm",
  paper: "tint",
  pairing: "geist",
  radius: 6,
  scale: 100,
  density: "regular",
  motion: "calm",
  theme: "light",
};

// 기본값: Ink 프리셋과 같다(2026-10-14). 흰 종이 + 먹 버튼 + 모노 글자, 색은 초록 하나만 작게.
// 초록은 어떤 색조도 링크 글자(accent.text)가 살짝 밀려야 AA 라 보정 1 건이 정상이다 (테스트가 지킨다).
export const DEFAULT_DIALS: Dials = {
  hue: 157,
  primary: "#0e0e0e",
  secondary: "#1f7a4d",
  neutral: "neutral",
  paper: "white",
  pairing: "mono",
  radius: 0,
  scale: 100,
  density: "regular",
  motion: "calm",
  theme: "light",
};

export const NEUTRALS: Neutral[] = ["cool", "neutral", "warm"];
export const PAIRINGS: Pairing[] = ["geist", "editorial", "grotesk", "funnel", "mono"];
export const DENSITIES: Density[] = ["compact", "regular", "airy"];
export const MOTIONS: Motion[] = ["off", "calm", "lively"];
export const THEMES: Theme[] = ["light", "dark"];
export const PAPERS: Paper[] = ["tint", "white"];

// 모든 스택은 1순위 서체 뒤에 Pretendard Variable 을 한글 대체로 둔다. trackingKo 는 한글 제목용(html[lang=ko])
// leading 은 큰 제목(h1)의 줄간. 글자 폭이 고른 모노는 줄이 길어 보여 조금 벌린다
export const HANGUL = "'Pretendard Variable'";
export const PAIRING_META: Record<Pairing, { label: string; heading: string; body: string; mono: string; weight: number; tracking: string; trackingKo: string; leading: number; italic: boolean }> = {
  geist: {
    label: "Geist + Geist Mono",
    heading: "'Geist Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    body: "'Geist Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'Geist Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    weight: 600,
    tracking: "-0.03em",
    trackingKo: "-0.015em",
    leading: 1.05,
    italic: false,
  },
  editorial: {
    label: "Instrument Serif + Inter",
    heading: "'Instrument Serif', 'Pretendard Variable', ui-serif, Georgia, serif",
    body: "'Inter Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    weight: 400,
    tracking: "-0.01em",
    trackingKo: "-0.01em",
    leading: 1.05,
    italic: true,
  },
  grotesk: {
    label: "Space Grotesk + JetBrains Mono",
    heading: "'Space Grotesk Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    body: "'Space Grotesk Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    weight: 500,
    tracking: "-0.035em",
    trackingKo: "-0.015em",
    leading: 1.05,
    italic: false,
  },
  funnel: {
    label: "Funnel Display + Funnel Sans",
    heading: "'Funnel Display Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    body: "'Funnel Sans Variable', 'Pretendard Variable', ui-sans-serif, system-ui, sans-serif",
    mono: "'Geist Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    weight: 600,
    tracking: "-0.025em",
    trackingKo: "-0.015em",
    leading: 1.05,
    italic: false,
  },
  // 제목·본문 모두 모노. 주석은 JetBrains Mono 로 갈라 본문과 구분한다. 고정폭이라 큰 제목은 자간을 더 조이고 줄간을 벌린다
  mono: {
    label: "Geist Mono + JetBrains Mono",
    heading: "'Geist Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    body: "'Geist Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    mono: "'JetBrains Mono Variable', 'Pretendard Variable', ui-monospace, 'SF Mono', Menlo, monospace",
    weight: 500,
    tracking: "-0.045em",
    trackingKo: "-0.02em",
    leading: 1.12,
    italic: false,
  },
};

// 섹션 번호 전용 픽셀 서체. 글꼴 다이얼과 무관하게 고정이고, 못 불러오면 그때의 모노를 따른다
export const PIXEL_FONT = "'Geist Pixel'";

// ---------- 원시 층 ----------

export const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
// 단계별 밝기. 500 이 색이 가장 진한 자리, 양 끝은 종이/먹에 가깝다.
export const ACCENT_L = [0.975, 0.94, 0.88, 0.8, 0.71, 0.62, 0.55, 0.47, 0.39, 0.31, 0.24];
// 단계별 chroma 비율. gamut 을 넘으면 oklchToHex 가 줄인다.
export const ACCENT_C = [0.02, 0.05, 0.1, 0.15, 0.19, 0.22, 0.22, 0.2, 0.16, 0.12, 0.08];

export function accentScale(hue: number): string[] {
  return ACCENT_STEPS.map((_, i) => oklchToHex({ l: ACCENT_L[i], c: ACCENT_C[i], h: hue }));
}

export const NEUTRAL_STEPS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000] as const;
const NEUTRAL_L = [0.993, 0.965, 0.935, 0.89, 0.81, 0.72, 0.62, 0.53, 0.44, 0.36, 0.29, 0.225, 0.165];
// 온도별 색조. chroma 는 중간에서 가장 크고 양 끝에서 줄여 종이와 먹이 탁해지지 않게 한다.
const NEUTRAL_TEMP: Record<Neutral, { h: number; c: number }> = {
  cool: { h: 250, c: 0.014 },
  neutral: { h: 0, c: 0 },
  warm: { h: 80, c: 0.014 },
};

export function neutralScale(temp: Neutral): string[] {
  const { h, c } = NEUTRAL_TEMP[temp];
  return NEUTRAL_STEPS.map((_, i) => {
    const l = NEUTRAL_L[i];
    // 종이(0)와 먹(1000)은 chroma 를 절반으로
    const edge = i === 0 || i === NEUTRAL_STEPS.length - 1 ? 0.5 : 1;
    return oklchToHex({ l, c: c * edge, h });
  });
}

// 타입 단계. 본문(base) 아래는 주석·메타 글자라 읽히는 하한으로 고정하고, 위 단계만 scale 로 벌리거나 좁힌다.
// 단계 k 의 크기 = base * (기본값/base)^(scale/100). scale 100 이면 손으로 맞춘 값 그대로다
export const TYPE_BASE = 17;
export const TYPE_STEPS = [
  { name: "lg", px: 20 },
  { name: "xl", px: 24 },
  { name: "2xl", px: 32 },
  { name: "3xl", px: 44 },
] as const;
export const SCALE_MIN = 60;
export const SCALE_MAX = 140;
export const typeStep = (px: number, scale: number) => round(TYPE_BASE * Math.pow(px / TYPE_BASE, scale / 100));

const SPACE_MULT: Record<Density, number> = { compact: 0.85, regular: 1, airy: 1.2 };
// 간격 스케일(px, 배수 전). 이 밖의 값은 쓰지 않는다.
export const SPACE_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

const MOTION_META: Record<Motion, { d1: number; d2: number; d3: number; ease: string; emphasis: string }> = {
  off: { d1: 0, d2: 0, d3: 0, ease: "linear", emphasis: "linear" },
  calm: { d1: 120, d2: 200, d3: 320, ease: "cubic-bezier(0.2, 0, 0, 1)", emphasis: "cubic-bezier(0.2, 0, 0, 1)" },
  lively: { d1: 160, d2: 320, d3: 560, ease: "cubic-bezier(0.2, 0, 0, 1)", emphasis: "cubic-bezier(0.34, 1.3, 0.64, 1)" },
};

// ---------- 의미 층 + 대비 보정 ----------

export type Fix = { token: string; from: string; to: string; reason: string };

export type Semantic = {
  surface: { canvas: string; raised: string; sunken: string; inverse: string };
  text: { default: string; muted: string; subtle: string; inverse: string };
  line: { default: string; strong: string };
  accent: { default: string; on: string; text: string; soft: string; secondary: string; secondaryOn: string };
};

const idx = (steps: readonly number[], step: number) => steps.indexOf(step);

// 밝은 쪽/어두운 쪽으로 걸으며 바탕들에 대해 AA 를 넘는 첫 단계를 찾는다
function walkForContrast(scale: string[], start: number, dir: 1 | -1, against: string[], min = AA_TEXT): number {
  let i = start;
  while (i >= 0 && i < scale.length) {
    if (against.every((bg) => contrast(scale[i], bg) >= min)) return i;
    i += dir;
  }
  return dir === 1 ? scale.length - 1 : 0;
}

// 단계 색을 밝기만 0.01 씩 밀어 모든 바탕에서 AA 를 넘기는 첫 값. 색상과 chroma 는 그대로.
export function nudgeForContrast(hue: number, l: number, c: number, dir: 1 | -1, against: string[], min = AA_TEXT): string {
  let cur = l;
  for (let i = 0; i < 60; i++) {
    const hex = oklchToHex({ l: cur, c, h: hue });
    if (against.every((bg) => contrast(hex, bg) >= min)) return hex;
    cur = Math.min(0.99, Math.max(0.05, cur + dir * 0.01));
  }
  return oklchToHex({ l: dir === 1 ? 0.99 : 0.05, c, h: hue });
}

// 브랜드 색 위의 글자: 흰/먹 중 더 잘 보이는 쪽. 둘 다 AA 미만이면 브랜드 색 밝기를 민다
export function fitOnColor(hex: string, white: string, ink: string): { bg: string; on: string; moved: boolean } {
  const cw = contrast(white, hex);
  const ci = contrast(ink, hex);
  if (Math.max(cw, ci) >= AA_TEXT) return { bg: hex, on: cw >= ci ? white : ink, moved: false };
  const { l, c, h } = hexToOklch(hex);
  // 어두운 쪽이 유리하면 어둡게(흰 글자), 아니면 밝게(먹 글자)
  const bg = ci > cw ? nudgeForContrast(h, l, c, 1, [ink]) : nudgeForContrast(h, l, c, -1, [white]);
  return { bg, on: ci > cw ? ink : white, moved: true };
}

export function buildSemantic(dials: Dials, accent: string[], neutral: string[]): { semantic: Semantic; fixes: Fix[] } {
  const fixes: Fix[] = [];
  const dark = dials.theme === "dark";
  const n = (step: number) => neutral[idx(NEUTRAL_STEPS, step)];
  const a = (step: number) => accent[idx(ACCENT_STEPS, step)];

  const surface = dark
    ? { canvas: n(1000), raised: n(950), sunken: n(900), inverse: n(50) }
    : dials.paper === "white"
      ? { canvas: "#ffffff", raised: "#ffffff", sunken: n(50), inverse: n(1000) }
      : { canvas: n(50), raised: n(0), sunken: n(100), inverse: n(1000) };
  const textDefault = dark ? n(50) : n(1000);
  const textInverse = dark ? n(1000) : n(50);
  const line = dark ? { default: n(900), strong: n(700) } : { default: n(200), strong: n(400) };

  // 본문 글자: 어두운 테마에선 밝은 쪽(인덱스 감소)으로 걷는다
  const toward: 1 | -1 = dark ? -1 : 1;
  const pick = (token: string, nominalStep: number, against: string[]) => {
    const start = idx(NEUTRAL_STEPS, nominalStep);
    const found = walkForContrast(neutral, start, toward, against);
    if (found !== start) fixes.push({ token, from: neutral[start], to: neutral[found], reason: "AA on surfaces" });
    return neutral[found];
  };
  const text = {
    default: textDefault,
    // muted 는 세 바탕 모두, subtle 은 canvas/raised 위에서만 쓴다
    muted: pick("text.muted", dark ? 300 : 700, [surface.canvas, surface.raised, surface.sunken]),
    subtle: pick("text.subtle", dark ? 400 : 600, [surface.canvas, surface.raised]),
    inverse: textInverse,
  };

  // 포인트색 위 글자는 밝은 테마 흰색, 어두운 테마 먹. 안 넘으면 포인트색 밝기를 민다
  const white = neutral[0];
  const ink = neutral[neutral.length - 1];
  let on = dark ? ink : white;
  const accentStep = idx(ACCENT_STEPS, dark ? 400 : 600);
  const accentDir: 1 | -1 = dark ? 1 : -1; // 밝은 테마는 어둡게, 어두운 테마는 밝게
  let accentDefault = a(ACCENT_STEPS[accentStep]);
  // 브랜드 색이 있으면 아래에서 덮어쓰므로 램프 쪽 보정은 하지도 알리지도 않는다
  if (!dials.primary && contrast(on, accentDefault) < AA_TEXT) {
    const fixed = nudgeForContrast(dials.hue, ACCENT_L[accentStep], ACCENT_C[accentStep], accentDir, [on]);
    fixes.push({ token: "accent.default", from: accentDefault, to: fixed, reason: "AA for text on accent" });
    accentDefault = fixed;
  }
  // 프리셋 브랜드 색: 밝기를 누르지 않고 흰/먹 중 잘 보이는 글자를 고른다 (라임 위 먹 글자)
  if (dials.primary) {
    const fit = fitOnColor(dials.primary, white, ink);
    accentDefault = fit.bg;
    on = fit.on;
    if (fit.moved) fixes.push({ token: "accent.default", from: dials.primary, to: fit.bg, reason: "AA for text on accent" });
    // 먹 버튼이 어두운 바탕에 묻히면 글자색으로 뒤집는다 (Ink 의 dark)
    if (dark && contrast(accentDefault, surface.canvas) < 3) {
      fixes.push({ token: "accent.default", from: accentDefault, to: textDefault, reason: "visible on canvas" });
      accentDefault = textDefault;
      on = textInverse;
    }
  }

  // 포인트색 글자(링크·주석 숫자): canvas/raised/soft 위에서 AA
  const soft = dark ? a(950) : a(50);
  const textStep = idx(ACCENT_STEPS, dark ? 300 : 600);
  const textAgainst = [surface.canvas, surface.raised, soft];
  let accentText = a(ACCENT_STEPS[textStep]);
  if (!textAgainst.every((bg) => contrast(accentText, bg) >= AA_TEXT)) {
    const fixed = nudgeForContrast(dials.hue, ACCENT_L[textStep], ACCENT_C[textStep], accentDir, textAgainst);
    fixes.push({ token: "accent.text", from: accentText, to: fixed, reason: "AA on surfaces" });
    accentText = fixed;
  }

  // 둘째 포인트색: 프리셋의 브랜드 색 그대로. 없으면 accent 와 같다
  let secondary = accentDefault;
  let secondaryOn = on;
  if (dials.secondary) {
    const fit = fitOnColor(dials.secondary, white, ink);
    secondary = fit.bg;
    secondaryOn = fit.on;
    if (fit.moved) fixes.push({ token: "accent.secondary", from: dials.secondary, to: fit.bg, reason: "AA for text on secondary" });
  }

  return {
    semantic: { surface, text, line, accent: { default: accentDefault, on, text: accentText, soft, secondary, secondaryOn } },
    fixes,
  };
}

// ---------- 전체 빌드 ----------

export type Tokens = {
  dials: Dials;
  accent: string[];
  neutral: string[];
  semantic: Semantic;
  fixes: Fix[];
  vars: Record<string, string>;
};

export function buildTokens(dials: Dials): Tokens {
  const accent = accentScale(dials.hue);
  const neutral = neutralScale(dials.neutral);
  const { semantic, fixes } = buildSemantic(dials, accent, neutral);
  const pair = PAIRING_META[dials.pairing];
  const mult = SPACE_MULT[dials.density];
  const m = MOTION_META[dials.motion];
  const r = dials.radius;

  const vars: Record<string, string> = {};
  // 원시
  ACCENT_STEPS.forEach((s, i) => (vars[`--accent-${s}`] = accent[i]));
  NEUTRAL_STEPS.forEach((s, i) => (vars[`--neutral-${s}`] = neutral[i]));
  SPACE_SCALE.forEach((px, i) => (vars[`--space-${i + 1}`] = `${round(px * mult)}px`));
  vars["--space-unit"] = `${round(4 * mult)}px`;
  vars["--radius-1"] = `${round(r * 0.5)}px`;
  vars["--radius-2"] = `${r}px`;
  vars["--radius-3"] = `${round(r * 1.5)}px`;
  vars["--radius-4"] = `${round(r * 2)}px`;
  vars["--radius-full"] = "999px";
  vars["--text-base"] = `${TYPE_BASE}px`;
  TYPE_STEPS.forEach((st) => (vars[`--text-${st.name}`] = `${typeStep(st.px, dials.scale)}px`));
  vars["--font-heading"] = pair.heading;
  vars["--font-body"] = pair.body;
  vars["--font-mono"] = pair.mono;
  vars["--font-pixel"] = `${PIXEL_FONT}, ${pair.mono}`;
  vars["--heading-weight"] = String(pair.weight);
  vars["--heading-tracking-latin"] = pair.tracking;
  vars["--heading-tracking-hangul"] = pair.trackingKo;
  vars["--heading-leading"] = String(pair.leading);
  vars["--heading-style"] = pair.italic ? "italic" : "normal";
  vars["--duration-1"] = `${m.d1}ms`;
  vars["--duration-2"] = `${m.d2}ms`;
  vars["--duration-3"] = `${m.d3}ms`;
  vars["--ease-default"] = m.ease;
  vars["--ease-emphasis"] = m.emphasis;
  // 의미
  vars["--surface-canvas"] = semantic.surface.canvas;
  vars["--surface-raised"] = semantic.surface.raised;
  vars["--surface-sunken"] = semantic.surface.sunken;
  vars["--surface-inverse"] = semantic.surface.inverse;
  vars["--text-default"] = semantic.text.default;
  vars["--text-muted"] = semantic.text.muted;
  vars["--text-subtle"] = semantic.text.subtle;
  vars["--text-inverse"] = semantic.text.inverse;
  vars["--line-default"] = semantic.line.default;
  vars["--line-strong"] = semantic.line.strong;
  vars["--accent-default"] = semantic.accent.default;
  vars["--accent-on"] = semantic.accent.on;
  vars["--accent-text"] = semantic.accent.text;
  vars["--accent-soft"] = semantic.accent.soft;
  vars["--accent-secondary"] = semantic.accent.secondary;
  vars["--accent-secondary-on"] = semantic.accent.secondaryOn;
  vars["--focus-ring"] = "var(--accent-default)";
  // 컴포넌트
  vars["--card-bg"] = "var(--surface-raised)";
  vars["--card-line"] = "var(--line-default)";
  vars["--card-line-hover"] = "var(--line-strong)";
  vars["--card-radius"] = "var(--radius-3)";
  vars["--card-pad"] = "var(--space-5)";
  vars["--button-bg"] = "var(--accent-default)";
  vars["--button-fg"] = "var(--accent-on)";
  vars["--button-radius"] = "var(--radius-2)";
  vars["--chip-bg"] = "var(--surface-sunken)";
  vars["--chip-fg"] = "var(--text-muted)";
  vars["--chip-radius"] = "var(--radius-1)";
  vars["--badge-bg"] = "var(--accent-secondary)";
  vars["--badge-fg"] = "var(--accent-secondary-on)";
  vars["--nav-active"] = "var(--accent-secondary)";
  vars["--selection-bg"] = "var(--accent-secondary)";
  vars["--selection-fg"] = "var(--accent-secondary-on)";
  vars["--annot-color"] = "var(--accent-text)";
  // 글자가 아닌 장식(커서 막대·선·눈금)은 대비 보정 없이 포인트색 그대로. 라임 프리셋이 라임으로 보이게
  vars["--annot-mark"] = "var(--accent-default)";
  vars["--annot-line"] = "var(--line-strong)";
  vars["--panel-bg"] = "var(--surface-raised)";
  vars["--panel-line"] = "var(--line-default)";
  vars["--phone-bezel"] = dials.theme === "dark" ? neutral[idx(NEUTRAL_STEPS, 800)] : neutral[idx(NEUTRAL_STEPS, 1000)];

  return { dials, accent, neutral, semantic, fixes, vars };
}

const round = (v: number) => Math.round(v * 100) / 100;

// ---------- 토큰 사슬 리졸버 (검사 모드) ----------

export type ChainLink = { name: string; value?: string };
export type Chain = { links: ChainLink[]; value: string; text: string };

const varToName = (v: string) => v.replace(/^--/, "").replace("-", ".");
const nameToVar = (name: string) => "--" + name.replace(".", "-");

// 원시 색이면 "accent.600" 식 이름을, 보정으로 밀린 색이면 가장 가까운 단계에 * 를 붙인다
function primitiveName(hex: string, t: Tokens): string | null {
  const ai = t.accent.indexOf(hex);
  if (ai >= 0) return `accent.${ACCENT_STEPS[ai]}`;
  const ni = t.neutral.indexOf(hex);
  if (ni >= 0) return `neutral.${NEUTRAL_STEPS[ni]}`;
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
  // 보정된 값: 밝기가 가장 가까운 accent 단계
  const { l, c } = hexToOklch(hex);
  if (c < 0.02) return null;
  let best = 0;
  for (let i = 1; i < ACCENT_L.length; i++) if (Math.abs(ACCENT_L[i] - l) < Math.abs(ACCENT_L[best] - l)) best = i;
  return `accent.${ACCENT_STEPS[best]}*`;
}

function spaceName(value: string, t: Tokens): string | null {
  for (let i = 0; i < SPACE_SCALE.length; i++) if (t.vars[`--space-${i + 1}`] === value) return `space.${i + 1}`;
  for (const k of ["--radius-1", "--radius-2", "--radius-3", "--radius-4"]) if (t.vars[k] === value) return varToName(k);
  return null;
}

// "card.bg" -> card.bg → surface.raised → neutral.0 = #fffcf8
export function resolveToken(name: string, t: Tokens): Chain | null {
  const links: ChainLink[] = [];
  let cur = nameToVar(name);
  let value = t.vars[cur];
  if (value === undefined) return null;
  links.push({ name });
  for (let guard = 0; guard < 8; guard++) {
    const m = value.match(/^var\((--[a-z0-9-]+)\)$/);
    if (!m) break;
    cur = m[1];
    value = t.vars[cur];
    if (value === undefined) return null;
    links.push({ name: varToName(cur) });
  }
  const prim = primitiveName(value, t) ?? spaceName(value, t);
  if (prim && prim !== links[links.length - 1].name) links.push({ name: prim });
  const text = `${links.map((l) => l.name).join(" → ")} = ${value}`;
  return { links, value, text };
}

// ---------- 프리셋 (앱 브랜드 색) ----------

export type Preset = {
  slug: string;
  name: string;
  swatches: { hex: string; label: string }[]; // 알려진 값만. 추정치는 label 에 sampled 로 표시
  dials: Partial<Dials>;
  system?: true; // 앱이 아닌 사이트 자체의 프리셋. "색조가 가까운 앱" 같은 앱 비교에서 뺀다
};

export const hueOf = (hex: string) => Math.round(hexToOklch(hex).h);

const ALL_PRESETS: Preset[] = [
  // 앱이 아닌 사이트 프리셋. 순백 바탕 + 먹 + 모노 글자 + 각진 모서리. 버튼도 먹이고, 색은 초록 하나만 작게(번호·디더 비탈).
  // 회색은 색조 없는 neutral. 먹은 그 중립 1000 단계(text.default) 그대로라 견본·버튼도 그 값을 적는다
  {
    slug: "ink",
    name: "Ink",
    swatches: [
      { hex: "#ffffff", label: "paper" },
      { hex: "#0e0e0e", label: "ink" },
      { hex: "#1f7a4d", label: "signal" },
    ],
    dials: { hue: hueOf("#1f7a4d"), primary: "#0e0e0e", secondary: "#1f7a4d", neutral: "neutral", paper: "white", radius: 0, theme: "light", pairing: "mono" },
    system: true,
  },
  {
    slug: "seoul-boom",
    name: "Seoul Boom",
    swatches: [
      { hex: "#d9ff5b", label: "lime" },
      { hex: "#7557ff", label: "violet" },
      { hex: "#f5f4ef", label: "paper" },
    ],
    dials: { hue: hueOf("#7557ff"), secondary: "#d9ff5b", neutral: "warm", radius: 20, theme: "light", pairing: "geist" },
  },
  {
    slug: "runpop",
    name: "Runpop",
    swatches: [
      { hex: "#fa114f", label: "pink" },
      { hex: "#2ee6d6", label: "teal" },
      { hex: "#ff9f0a", label: "orange" },
      { hex: "#7b5cff", label: "violet" },
    ],
    dials: { hue: hueOf("#fa114f"), secondary: "#2ee6d6", neutral: "cool", radius: 14, theme: "dark", pairing: "grotesk" },
  },
  {
    slug: "ttokuoka",
    name: "Ttokuoka",
    swatches: [
      { hex: "#ffa9c4", label: "mentai" },
      { hex: "#e8456b", label: "mentai deep" },
    ],
    dials: { hue: hueOf("#e8456b"), secondary: "#ffa9c4", neutral: "warm", radius: 16, theme: "light", pairing: "geist" },
  },
  {
    slug: "carenote",
    name: "Carenote",
    swatches: [
      { hex: "#2f3fbf", label: "indigo" },
      { hex: "#2f9e6b", label: "normal" },
      { hex: "#f5f4f0", label: "paper" },
    ],
    dials: { hue: hueOf("#2f3fbf"), secondary: "#2f9e6b", neutral: "warm", radius: 18, theme: "light", pairing: "geist" },
  },
  {
    slug: "ppopjido",
    name: "Ppopjido",
    swatches: [
      { hex: "#8f78f7", label: "violet, sampled" },
      { hex: "#d8f070", label: "lime, sampled" },
      { hex: "#f8f8f0", label: "paper, sampled" },
    ],
    dials: { hue: hueOf("#8f78f7"), secondary: "#d8f070", neutral: "neutral", radius: 12, theme: "light", pairing: "grotesk" },
  },
  {
    slug: "tory",
    name: "Tory",
    swatches: [
      { hex: "#1b1b1a", label: "ink" },
      { hex: "#c94a33", label: "vermilion" },
    ],
    dials: { hue: hueOf("#c94a33"), secondary: "#1b1b1a", neutral: "neutral", radius: 10, theme: "light", pairing: "editorial" },
  },
  {
    slug: "bapsim",
    name: "Bapsim",
    swatches: [
      { hex: "#f8875f", label: "orange, sampled" },
      { hex: "#f5e9c8", label: "cream, sampled" },
      { hex: "#121212", label: "night, sampled" },
    ],
    dials: { hue: hueOf("#f8875f"), secondary: "#f5e9c8", neutral: "warm", radius: 22, theme: "dark", pairing: "geist" },
  },
  {
    slug: "wishrun",
    name: "Wishrun",
    swatches: [
      { hex: "#ff1715", label: "red" },
      { hex: "#172021", label: "ink" },
      { hex: "#f6f6f6", label: "muted" },
    ],
    dials: { hue: hueOf("#ff1715"), secondary: "#172021", neutral: "neutral", radius: 24, theme: "light", pairing: "geist" },
  },
  {
    slug: "finishline",
    name: "Finishline",
    swatches: [
      { hex: "#75fc96", label: "lime" },
      { hex: "#161618", label: "ink" },
      { hex: "#f6f6f6", label: "muted" },
    ],
    dials: { hue: hueOf("#75fc96"), primary: "#75fc96", secondary: "#161618", neutral: "neutral", radius: 24, theme: "light", pairing: "geist" },
  },
  // 붐치·멘치 시리즈 새 앱. 색은 각 앱 :root 변수 그대로(hangul-boom·puzzle-lounge src/styles.css, menchi-kana·menchi-voca src/index.css)
  // 한글붐: 라임 타일 + 먹색 버튼이 주, 바이올렛은 로마자·강조에만. 라임이 주색이라 primary 로 그대로
  {
    slug: "hangul-boom",
    name: "Hangul Boom",
    swatches: [
      { hex: "#d9ff5b", label: "lime" },
      { hex: "#10131a", label: "ink" },
      { hex: "#7557ff", label: "violet" },
      { hex: "#f5f4ef", label: "paper" },
    ],
    dials: { hue: hueOf("#7557ff"), primary: "#d9ff5b", secondary: "#10131a", neutral: "warm", radius: 22, theme: "light", pairing: "geist" },
  },
  // 멘치카나: 명란 핑크 키 컬러가 주. 둘째는 진한 명란
  {
    slug: "menchi-kana",
    name: "Menchi Kana",
    swatches: [
      { hex: "#ffa9c4", label: "mentai" },
      { hex: "#e8456b", label: "mentai deep" },
      { hex: "#10131a", label: "ink" },
    ],
    dials: { hue: hueOf("#e8456b"), primary: "#ffa9c4", secondary: "#e8456b", neutral: "warm", radius: 22, theme: "light", pairing: "geist" },
  },
  // 멘치보카: 멘치카나와 같은 토큰. 버튼·배지에 더 자주 쓰는 진한 명란(accent)을 주로, 글자색(accent-ink)을 둘째로
  {
    slug: "menchi-voca",
    name: "Menchi Voca",
    swatches: [
      { hex: "#e8456b", label: "mentai deep" },
      { hex: "#ffa9c4", label: "mentai" },
      { hex: "#b8264c", label: "mentai ink" },
    ],
    dials: { hue: hueOf("#e8456b"), primary: "#e8456b", secondary: "#b8264c", neutral: "warm", radius: 22, theme: "light", pairing: "geist" },
  },
  // 퍼즐 라운지: 「붐 아케이드 나이트」. 허브·결과의 먹색 무대 위 라임이 얼굴이라 어두운 테마에 라임 primary
  {
    slug: "puzzle-lounge",
    name: "Puzzle Lounge",
    swatches: [
      { hex: "#151826", label: "stage" },
      { hex: "#d9ff5b", label: "lime" },
      { hex: "#7557ff", label: "violet" },
    ],
    dials: { hue: hueOf("#7557ff"), primary: "#d9ff5b", secondary: "#7557ff", neutral: "cool", radius: 18, theme: "dark", pairing: "geist" },
  },
];

export const PRESETS: Preset[] = ALL_PRESETS.filter((p) => !isHiddenApp(p.slug));

export const presetBySlug = (slug: string) => PRESETS.find((p) => p.slug === slug);

// ---------- URL 직렬화 ----------

const KEYS: (keyof Dials)[] = ["hue", "primary", "secondary", "neutral", "paper", "pairing", "radius", "scale", "density", "motion", "theme"];
const QUERY_KEY: Record<keyof Dials, string> = { hue: "hue", primary: "pri", secondary: "sec", neutral: "neutral", paper: "paper", pairing: "pairing", radius: "radius", scale: "scale", density: "density", motion: "motion", theme: "theme" };

export function dialsToQuery(d: Dials): string {
  const q = new URLSearchParams();
  for (const k of KEYS) {
    if (d[k] === DEFAULT_DIALS[k]) continue;
    if (k === "secondary") q.set("sec", (d.secondary ?? "").replace("#", ""));
    else if (k === "primary") q.set("pri", (d.primary ?? "").replace("#", ""));
    else q.set(QUERY_KEY[k], String(d[k]));
  }
  return q.toString();
}

const clampNum = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// 알 수 없는 값은 버리고 기본값으로. 부분 입력도 받는다.
export function parseDials(input: URLSearchParams | Record<string, unknown> | null | undefined, base: Dials = DEFAULT_DIALS): Dials {
  const get = (k: string): unknown =>
    input instanceof URLSearchParams ? input.get(k) ?? undefined : input ? (input as Record<string, unknown>)[k] : undefined;
  const out: Dials = { ...base };
  const hue = Number(get("hue"));
  if (get("hue") !== undefined && Number.isFinite(hue)) out.hue = clampNum(Math.round(hue), 0, 360);
  const radius = Number(get("radius"));
  if (get("radius") !== undefined && Number.isFinite(radius)) out.radius = clampNum(Math.round(radius), 0, 24);
  const scale = Number(get("scale"));
  if (get("scale") !== undefined && Number.isFinite(scale)) out.scale = clampNum(Math.round(scale), SCALE_MIN, SCALE_MAX);
  for (const [k, q] of [["secondary", "sec"], ["primary", "pri"]] as const) {
    const v = get(input instanceof URLSearchParams ? q : k);
    if (v === null || v === "") out[k] = null;
    else if (typeof v === "string") {
      const hex = v.startsWith("#") ? v : `#${v}`;
      if (/^#[0-9a-f]{6}$/i.test(hex)) out[k] = hex.toLowerCase();
    }
  }
  const pickEnum = <T extends string>(k: keyof Dials, allowed: readonly T[]) => {
    const v = get(k);
    if (typeof v === "string" && (allowed as readonly string[]).includes(v)) (out as unknown as Record<string, unknown>)[k] = v;
  };
  pickEnum("neutral", NEUTRALS);
  pickEnum("pairing", PAIRINGS);
  pickEnum("density", DENSITIES);
  pickEnum("motion", MOTIONS);
  pickEnum("theme", THEMES);
  pickEnum("paper", PAPERS);
  return out;
}

export const sameDials = (a: Dials, b: Dials) => KEYS.every((k) => a[k] === b[k]);
