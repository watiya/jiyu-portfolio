// 다이얼 보드: 토큰 패널과 같은 다이얼을 손으로 돌리는 컨트롤 여섯 개. 상태는 패널과 하나(useTokens().set)라
// 여기서 돌린 값이 곧 :root 의 토큰이고, 페이지 전체와 패널이 함께 바뀐다. 데모용 따로 상태는 두지 않는다.
import { useEffect, useId, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useLang } from "../i18n/useLang.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { DENSITIES, MOTIONS, PRESETS, SCALE_MAX, SCALE_MIN, TYPE_STEPS, type Density } from "../tokens/engine.ts";
import { toCss } from "../tokens/export.ts";
import { activePresetOf } from "../lib.ts";
import { useReveal } from "../hooks.ts";
import { Corners, SectionLabel } from "./Annot.tsx";

type CellId = "hue" | "radius" | "scale" | "density" | "motion" | "css";
const CELLS: { id: CellId; dial: string }[] = [
  { id: "hue", dial: "accent.hue" },
  { id: "radius", dial: "radius.2" },
  { id: "scale", dial: "type.scale" },
  { id: "density", dial: "space.density" },
  { id: "motion", dial: "motion" },
  { id: "css", dial: ":root" },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// 요소 중심에서 포인터까지의 각도. 12시가 0, 시계 방향이 +, 범위 -180..180
function pointerAngle(e: PointerEvent<Element>, el: Element) {
  const r = el.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2);
  const dy = e.clientY - (r.top + r.height / 2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

// 방향키·Home/End·Backspace 를 값으로. 문지르기(Scrub)와 같은 규칙이다
function keyStep(key: string, shift: boolean, value: number, step: number, min: number, max: number, def: number): number | null {
  const mult = shift ? 10 : 1;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return value + step * mult;
    case "ArrowLeft":
    case "ArrowDown":
      return value - step * mult;
    case "PageUp":
      return value + step * 10;
    case "PageDown":
      return value - step * 10;
    case "Home":
      return min;
    case "End":
      return max;
    case "Backspace":
    case "Delete":
      return def;
    default:
      return null;
  }
}

// 포인터를 잡고 놓는 공통 처리. 잡는 동안 문서 커서를 바꾸지 않고, 터치 스크롤은 CSS touch-action 으로 막는다
function usePointerDrag(onPoint: (e: PointerEvent<HTMLElement>) => void) {
  const active = useRef(false);
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 캡처가 안 되는 합성 포인터도 드래그는 계속한다
      }
      active.current = true;
      e.currentTarget.focus({ preventScroll: true });
      onPoint(e);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (active.current) onPoint(e);
    },
    onPointerUp: () => (active.current = false),
    onPointerCancel: () => (active.current = false),
  };
}

export function Dials() {
  const { t } = useLang();
  const D = t.dials;
  const ref = useReveal<HTMLElement>();
  return (
    <section id="dials" className="dials container reveal" ref={ref} aria-labelledby="dials-title">
      <SectionLabel index="03" title={t.sections.dials} aside={<>{D.aside(CELLS.length)}</>} />
      <div className="section__head">
        <h2 id="dials-title" className="h2">
          {D.title}
        </h2>
        <p className="lede">{D.lede}</p>
      </div>
      <DialBoard />
    </section>
  );
}

// 보드만. 홈(/projects)의 다이얼 섹션과 첫 화면의 놀이터가 같이 쓴다
export function DialBoard() {
  const { t } = useLang();
  const D = t.dials;
  const { dials, tokens, isDefault, reset, setPanelOpen } = useTokens();
  const preset = activePresetOf(dials);
  const source = isDefault ? t.panel.source : preset ? t.panel.preset(preset.name) : t.panel.custom;
  const fixes = tokens.fixes.length;
  const head: Record<CellId, string> = {
    hue: `${dials.hue}°`,
    radius: `${dials.radius}px`,
    scale: `×${(dials.scale / 100).toFixed(2)}`,
    density: `unit ${tokens.vars["--space-unit"]}`,
    motion: t.panel.motions[tokens.dials.motion],
    css: `${Object.keys(tokens.vars).length} vars`,
  };

  return (
      <div className="dl-board" data-token="card.radius line.default">
        <div className="dl-bar mono">
          <span className="dl-bar__state" aria-live="polite">
            <span className="dl-bar__source">{source}</span>
            <span className="dl-bar__check" data-fixed={fixes > 0 || undefined}>
              {fixes === 0 ? t.panel.contrastOk : t.panel.contrastFixed(fixes)}
            </span>
          </span>
          <span className="dl-bar__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset} disabled={isDefault}>
              {t.panel.reset}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPanelOpen(true)} aria-controls="token-panel">
              {D.all} →
            </button>
          </span>
        </div>

        {CELLS.map((c, i) => (
          <article key={c.id} className="dl-cell" data-cell={c.id}>
            <header className="dl-cell__head mono">
              <span>
                <span className="dl-cell__idx">d{i + 1}</span> / {c.dial}
              </span>
              <span className="dl-cell__val">{head[c.id]}</span>
            </header>
            <div className="dl-cell__stage">
              <Corners />
              {c.id === "hue" && <HueRing />}
              {c.id === "radius" && <CornerHandle />}
              {c.id === "scale" && <TypeScale />}
              {c.id === "density" && <DensityBellows />}
              {c.id === "motion" && <MotionSwitch />}
              {c.id === "css" && <CssOut />}
            </div>
            <div className="dl-cell__body">
              <h3 className="dl-cell__name">{D.items[c.id].title}</h3>
              <p className="dl-cell__line">{D.items[c.id].line}</p>
              <p className="dl-cell__moves mono">
                <span>{D.affects}</span> {D.items[c.id].affects}
              </p>
            </div>
          </article>
        ))}
      </div>
  );
}

// ---------- 노브: 270도 회전 다이얼. 연속값과 단계(멈춤) 둘 다 ----------

const KC = 66; // viewBox 132 의 중심
const KR = 50; // 트랙 반지름
const A0 = -135;
const SWEEP = 270;
const polar = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: KC + r * Math.sin(rad), y: KC - r * Math.cos(rad) };
};
const arcPath = (a0: number, a1: number, r: number) => {
  const p0 = polar(a0, r);
  const p1 = polar(a1, r);
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
};

type KnobProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  label: string;
  valueText: string;
  display: string;
  detents?: string[];
  onChange: (v: number) => void;
};

function Knob({ value, min, max, step, defaultValue, label, valueText, display, detents, onChange }: KnobProps) {
  const frac = (value - min) / (max - min);
  const angle = A0 + frac * SWEEP;
  const snap = (v: number) => clamp(Math.round((v - min) / step) * step + min, min, max);
  const drag = usePointerDrag((e) => {
    let a = pointerAngle(e, e.currentTarget);
    // 아래쪽 빈 구간에선 지금 값에 가까운 끝으로. 최대에서 최소로 튀지 않게
    if (Math.abs(a) > SWEEP / 2) a = frac > 0.5 ? SWEEP / 2 : -SWEEP / 2;
    const next = snap(min + ((a - A0) / SWEEP) * (max - min));
    if (next !== value) onChange(next);
  });
  const ticks = detents ? detents.map((_, i) => A0 + (i / (detents.length - 1)) * SWEEP) : Array.from({ length: 9 }, (_, i) => A0 + (i * SWEEP) / 8);
  return (
    <span
      className="knob"
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      data-detents={detents ? detents.length : undefined}
      onKeyDown={(e) => {
        const next = keyStep(e.key, e.shiftKey, value, step, min, max, defaultValue);
        if (next === null) return;
        e.preventDefault();
        onChange(snap(next));
      }}
      onDoubleClick={() => onChange(defaultValue)}
      {...drag}
    >
      <svg viewBox="0 0 132 132" aria-hidden="true">
        <path d={arcPath(A0, A0 + SWEEP, KR)} className="knob__track" />
        {frac > 0 && <path d={arcPath(A0, angle, KR)} className="knob__fill" />}
        {ticks.map((a, i) => {
          const p0 = polar(a, KR + 7);
          const p1 = polar(a, KR + 12);
          return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} className="knob__tick" data-on={a <= angle + 0.01 || undefined} />;
        })}
        <g className="knob__cap" style={{ transform: `rotate(${angle}deg)` }}>
          <circle cx={KC} cy={KC} r={36} className="knob__body" />
          <line x1={KC} y1={KC - 33} x2={KC} y2={KC - 23} className="knob__mark" />
        </g>
        <text x={KC} y={KC + 4} textAnchor="middle" className="knob__text">
          {display}
        </text>
      </svg>
      {/* 멈춤 이름은 다이얼 바깥 그 각도에. 누르면 포인터 각도가 곧 그 멈춤이라 따로 클릭 처리가 없다 */}
      {detents?.map((d, i) => {
        const p = polar(ticks[i], 90);
        return (
          <span key={d} className="knob__detent mono" aria-hidden="true" data-on={i === value || undefined} style={{ left: `${(p.x / 132) * 100}%`, top: `${(p.y / 132) * 100}%` }}>
            {d}
          </span>
        );
      })}
    </span>
  );
}

// ---------- d1 색조 링 ----------

const RING = `conic-gradient(${Array.from({ length: 13 }, (_, i) => `oklch(0.72 0.17 ${i * 30}) ${i * 30}deg`).join(", ")})`;

function HueRing() {
  const { dials, tokens, set } = useTokens();
  const { t } = useLang();
  const H = t.dials.hue;
  const drag = usePointerDrag((e) => {
    if ((e.target as Element).closest("button")) return;
    const h = Math.round((pointerAngle(e, e.currentTarget) + 360) % 360);
    if (h !== dials.hue) set({ hue: h });
  });
  return (
    <div className="dl-hue">
      <div
        className="dl-ring"
        role="slider"
        tabIndex={0}
        aria-label={H.label}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={dials.hue}
        aria-valuetext={H.deg(dials.hue)}
        onKeyDown={(e) => {
          const next = keyStep(e.key, e.shiftKey, dials.hue, 1, 0, 360, 264);
          if (next === null) return;
          e.preventDefault();
          // 색조는 원이라 끝에서 반대편으로 넘어간다. Home/End 만 0·360 에 멈춘다
          const wrapped = e.key === "Home" || e.key === "End" ? next : ((next % 360) + 360) % 360;
          set({ hue: wrapped });
        }}
        {...drag}
      >
        <span className="dl-ring__band" style={{ background: RING }} aria-hidden="true" />
        <span className="dl-ring__arm" style={{ transform: `rotate(${dials.hue}deg)` }} aria-hidden="true">
          <i style={{ background: `oklch(0.72 0.17 ${dials.hue})` }} />
        </span>
        <span className="dl-ring__core" data-token="accent.default accent.on" aria-hidden="true">
          <b>{dials.hue}°</b>
          <span className="mono">{tokens.semantic.accent.default}</span>
        </span>
        {PRESETS.map((p) => {
          const h = p.dials.hue ?? 0;
          return (
            <button
              key={p.slug}
              type="button"
              className="dl-ring__app"
              style={{ "--h": `${h}deg`, "--c": `oklch(0.72 0.17 ${h})` } as CSSProperties}
              aria-label={H.pick(p.name)}
              title={`${p.name} · ${h}°`}
              data-on={dials.hue === h || undefined}
              onClick={() => set({ hue: h })}
            />
          );
        })}
      </div>
      <div className="scale dl-hue__scale" aria-hidden="true">
        {tokens.accent.map((hex, i) => (
          <span key={i} className="scale__step" style={{ background: hex }} />
        ))}
      </div>
    </div>
  );
}

// ---------- d2 모서리 핸들 ----------

const ZOOM = 4;

function CornerHandle() {
  const { dials, tokens, set } = useTokens();
  const { t } = useLang();
  const R = t.dials.radius;
  const box = useRef<HTMLDivElement>(null);
  const drag = usePointerDrag((e) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    const r = clamp(Math.round((rect.right - e.clientX) / ZOOM), 0, 24);
    if (r !== dials.radius) set({ radius: r });
  });
  return (
    <div className="dl-corner">
      <div className="dl-corner__box" ref={box} data-token="radius.2" style={{ "--zoom": ZOOM } as CSSProperties}>
        <span className="dl-corner__guide" aria-hidden="true" />
        <span className="dl-corner__dim mono" aria-hidden="true">
          <span>
            R {dials.radius} × {ZOOM}
          </span>
        </span>
        <span className="dl-corner__zoom mono" aria-hidden="true">
          {R.zoom}
        </span>
        <span
          className="dl-corner__handle"
          role="slider"
          tabIndex={0}
          aria-label={R.label}
          aria-valuemin={0}
          aria-valuemax={24}
          aria-valuenow={dials.radius}
          aria-valuetext={`${dials.radius} px`}
          onKeyDown={(e) => {
            // 손잡이는 왼쪽으로 끌수록 커진다. 방향키도 화면 방향을 따른다
            const flip = e.key === "ArrowLeft" ? "ArrowRight" : e.key === "ArrowRight" ? "ArrowLeft" : e.key;
            const next = keyStep(flip, e.shiftKey, dials.radius, 1, 0, 24, 6);
            if (next === null) return;
            e.preventDefault();
            set({ radius: clamp(next, 0, 24) });
          }}
          {...drag}
        />
      </div>
      <div className="dl-corner__real" aria-hidden="true">
        <span className="btn btn--sm">1x</span>
        <span className="chip">chip</span>
        <span className="dl-corner__card" />
        <span className="mono dl-corner__vals">
          {["--radius-1", "--radius-2", "--radius-3", "--radius-4"].map((k) => tokens.vars[k].replace("px", "")).join(" · ")} px
        </span>
      </div>
    </div>
  );
}

// ---------- d3 타입 스케일 ----------

function TypeScale() {
  const { dials, tokens, set } = useTokens();
  const { t } = useLang();
  const steps: { name: string; v: string }[] = [{ name: "base", v: "--text-base" }, ...TYPE_STEPS.map((s) => ({ name: s.name, v: `--text-${s.name}` }))];
  const display = `×${(dials.scale / 100).toFixed(2)}`;
  return (
    <div className="dl-type">
      <Knob
        value={dials.scale}
        min={SCALE_MIN}
        max={SCALE_MAX}
        step={5}
        defaultValue={100}
        label={t.dials.scale.label}
        valueText={`${display}, 3xl ${tokens.vars["--text-3xl"]}`}
        display={display}
        onChange={(scale) => set({ scale })}
      />
      <ol className="dl-ladder" aria-hidden="true">
        {steps.map((s) => (
          <li key={s.name} className="dl-ladder__step">
            <b style={{ fontSize: `var(${s.v})` }}>Ag</b>
            <span className="mono">
              {s.name}
              <br />
              {Math.round(parseFloat(tokens.vars[s.v]))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------- d4 간격 밀도 ----------

function DensityBellows() {
  const { dials, tokens, set } = useTokens();
  const { t } = useLang();
  const name = useId();
  const labels = t.panel.densities;
  return (
    <div className="dl-dens">
      <div className="dl-dens__frame" data-token="card.pad">
        <div className="dl-dens__stack">
          <span className="dl-dens__block dl-dens__block--title" />
          <span className="dl-dens__block" />
          <span className="dl-dens__block dl-dens__block--short" />
        </div>
      </div>
      <p className="dl-dens__dims mono" aria-hidden="true">
        pad {tokens.vars["--space-5"]} · gap {tokens.vars["--space-3"]} · section {tokens.vars["--space-9"]}
      </p>
      <div className="seg" role="radiogroup" aria-label={t.panel.density}>
        {DENSITIES.map((o: Density) => (
          <label key={o} className="seg__item" data-on={o === dials.density || undefined}>
            <input type="radio" name={name} value={o} checked={o === dials.density} onChange={() => set({ density: o })} />
            <span>{labels[o] ?? o}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ---------- d5 모션 스위치 ----------

// "cubic-bezier(a, b, c, d)" 를 숫자로. linear 는 대각선
function bezierOf(v: string): [number, number, number, number] {
  const m = v.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return [0, 0, 1, 1];
  const n = m[1].split(",").map(Number);
  return [n[0], n[1], n[2], n[3]];
}

function MotionSwitch() {
  const { dials, tokens, reducedMotion, set } = useTokens();
  const { t } = useLang();
  const M = t.dials.motion;
  const labels = t.panel.motions;
  const idx = MOTIONS.indexOf(dials.motion);
  const live = tokens.dials.motion !== "off";
  const [side, setSide] = useState(false);
  // 점은 가장 긴 지속 시간(duration.3)과 강조 이징으로 오간다. 모션이 꺼져 있으면 서 있다
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setSide((s) => !s);
    }, 1400);
    return () => window.clearInterval(id);
  }, [live]);
  const [x1, y1, x2, y2] = bezierOf(tokens.vars["--ease-emphasis"]);
  // 그래프: 가로 0..1, 세로 -0.1..1.4 (튀어 오르는 이징이 넘치는 자리까지)
  const W = 160;
  const H = 92;
  const px = (x: number) => 8 + x * (W - 16);
  const py = (y: number) => H - 8 - ((y + 0.1) / 1.5) * (H - 16);
  const curve = `M ${px(0)} ${py(0)} C ${px(x1)} ${py(y1)} ${px(x2)} ${py(y2)} ${px(1)} ${py(1)}`;
  return (
    <div className="dl-motion">
      <Knob
        value={idx}
        min={0}
        max={MOTIONS.length - 1}
        step={1}
        defaultValue={1}
        label={M.label}
        valueText={labels[dials.motion]}
        display={tokens.vars["--duration-3"]}
        detents={MOTIONS.map((m) => labels[m])}
        onChange={(i) => set({ motion: MOTIONS[i] })}
      />
      <div className="dl-motion__side">
        <svg className="dl-curve" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <line x1={px(0)} y1={py(1)} x2={px(1)} y2={py(1)} className="dl-curve__guide" />
          <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} className="dl-curve__guide" />
          <line x1={px(0)} y1={py(0)} x2={px(x1)} y2={py(y1)} className="dl-curve__arm" />
          <line x1={px(1)} y1={py(1)} x2={px(x2)} y2={py(y2)} className="dl-curve__arm" />
          <circle cx={px(x1)} cy={py(y1)} r={2.5} className="dl-curve__pt" />
          <circle cx={px(x2)} cy={py(y2)} r={2.5} className="dl-curve__pt" />
          <path d={curve} className="dl-curve__line" />
        </svg>
        <div className="dl-run" data-side={side || undefined} aria-hidden="true">
          <i />
        </div>
        <p className="mono dl-motion__vals">
          {tokens.vars["--duration-1"]} · {tokens.vars["--duration-2"]} · {tokens.vars["--duration-3"]}
        </p>
        {reducedMotion && <p className="mono dl-motion__note">{M.reduced}</p>}
      </div>
    </div>
  );
}

// ---------- d6 CSS 로 가져가기 ----------

const CSS_LINES = ["--accent-default", "--accent-text", "--radius-2", "--text-3xl", "--space-5", "--duration-3", "--ease-emphasis"];

function CssOut() {
  const { tokens, toast, copyLink } = useTokens();
  const { t } = useLang();
  const C = t.dials.css;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toCss(tokens));
      toast(t.toasts.copied("tokens.css"));
    } catch {
      toast(t.toasts.copyFailed);
    }
  };
  return (
    <div className="dl-css">
      <pre className="dl-code mono" aria-label={C.label}>
        <code>
          <span className="dl-code__muted">{":root {"}</span>
          {"\n"}
          {CSS_LINES.map((k) => (
            <CodeLine key={k} name={k} value={tokens.vars[k]} flash={tokens.dials.motion !== "off"} />
          ))}
          <span className="dl-code__muted">{"}"}</span>
        </code>
      </pre>
      <div className="dl-css__btns">
        <button type="button" className="btn btn--sm" onClick={() => void copy()} data-token="button.bg button.fg button.radius">
          {C.copy}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => void copyLink()}>
          {C.link}
        </button>
      </div>
    </div>
  );
}

// 값이 바뀐 줄만 잠깐 칠한다. 첫 그림에서는 칠하지 않는다
function CodeLine({ name, value, flash }: { name: string; value: string; flash: boolean }): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    const el = ref.current;
    if (!flash || !el || typeof el.animate !== "function") return;
    const soft = getComputedStyle(document.documentElement).getPropertyValue("--accent-soft").trim() || "transparent";
    el.animate([{ backgroundColor: soft }, { backgroundColor: "transparent" }], { duration: 900, easing: "ease-out" });
  }, [value, flash]);
  const isColor = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <span ref={ref} className="dl-code__line">
      {"  "}
      <span className="dl-code__key">{name}</span>: {isColor && <i className="dl-code__sw" style={{ background: value }} aria-hidden="true" />}
      <span className="dl-code__val">{value}</span>;{"\n"}
    </span>
  );
}
