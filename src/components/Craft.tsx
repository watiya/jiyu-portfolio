// 크래프트: 이 사이트가 쓰는 부품을 카드 안에서 바로 만져 보는 데모. 새로 만든 것이 아니라 실제 컴포넌트·엔진을 그대로 부른다.
import { useId, useState, type CSSProperties } from "react";
import { useLang } from "../i18n/useLang.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { AA_TEXT, contrast } from "../tokens/color.ts";
import { NEUTRAL_STEPS, PRESETS, buildTokens, fitOnColor, resolveToken } from "../tokens/engine.ts";
import { useReveal } from "../hooks.ts";
import { fuzzyScore } from "../lib.ts";
import { Scrub } from "./Scrub.tsx";
import { Corners, SectionLabel } from "./Annot.tsx";

// 레포는 비공개라 소스는 경로만 적는다. 공개로 바꾸면 이 값을 켠다
const SOURCE_BASE = "https://github.com/watiya/jiyu-portfolio/blob/master/";
const REPO_PUBLIC = true;
const sourceHref = (path: string) => (REPO_PUBLIC ? SOURCE_BASE + path : null);

type DemoId = "scrub" | "hue" | "contrast" | "inspect" | "toast" | "palette";
const DEMOS: { id: DemoId; tokens: string[]; source: string }[] = [
  { id: "scrub", tokens: ["font.size", "font.tracking"], source: "src/components/Scrub.tsx" },
  { id: "hue", tokens: ["accent.default", "accent.on", "button.bg"], source: "src/tokens/engine.ts" },
  { id: "contrast", tokens: ["accent.default", "accent.on"], source: "src/tokens/engine.ts" },
  { id: "inspect", tokens: ["card.bg", "button.bg", "chip.bg", "text.muted"], source: "src/components/Inspector.tsx" },
  { id: "toast", tokens: ["surface.inverse", "text.inverse", "duration.2"], source: "src/components/Toast.tsx" },
  { id: "palette", tokens: ["panel.bg", "panel.line", "accent.soft"], source: "src/components/Palette.tsx" },
];

export function Craft({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  const ref = useReveal<HTMLElement>();
  const C = t.craft;
  return (
    <section id="craft" className="craft container reveal" ref={ref} aria-labelledby="craft-title">
      <SectionLabel index="04" title={t.sections.craft} aside={<>{C.aside(DEMOS.length)}</>} />
      <div className="section__head">
        <h2 id="craft-title" className="h2">
          {C.title}
        </h2>
        <p className="lede">{C.lede}</p>
      </div>
      <ul className="craft__grid" role="list">
        {DEMOS.map((d) => {
          const href = sourceHref(d.source);
          return (
            <li key={d.id} className="craft__item">
              <article className="craft__card" data-token="card.bg card.line card.radius card.pad">
                <div className="craft__stage" data-token="surface.sunken radius.2">
                  <Corners />
                  {d.id === "scrub" && <ScrubDemo />}
                  {d.id === "hue" && <HueDemo />}
                  {d.id === "contrast" && <ContrastDemo />}
                  {d.id === "inspect" && <InspectDemo />}
                  {d.id === "toast" && <ToastDemo />}
                  {d.id === "palette" && <PaletteDemo go={go} />}
                </div>
                <div className="craft__body">
                  <h3 className="craft__name">{C.items[d.id].title}</h3>
                  <p className="craft__line">{C.items[d.id].line}</p>
                  <dl className="craft__meta mono">
                    <dt>{C.tokens}</dt>
                    <dd>{d.tokens.join(" ")}</dd>
                    <dt>{C.source}</dt>
                    <dd>
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer">
                          {d.source} ↗
                        </a>
                      ) : (
                        d.source
                      )}
                    </dd>
                  </dl>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------- 1 Scrub ----------

function ScrubDemo() {
  const { t } = useLang();
  const C = t.craft.scrub;
  const [size, setSize] = useState(56);
  const [tracking, setTracking] = useState(-0.03);
  return (
    <div className="cr cr--scrub">
      <p className="cr-scrub__sample" style={{ fontSize: size, letterSpacing: `${tracking}em` }} aria-hidden="true">
        {C.sample}
      </p>
      <div className="cr-scrub__row mono">
        <span>
          {C.size}{" "}
          <Scrub value={size} min={24} max={80} step={1} pxPerStep={2} defaultValue={56} label={C.size} unit="px" hint={t.hero.scrubHint} onChange={setSize} />
        </span>
        <span>
          {C.tracking}{" "}
          <Scrub value={tracking} min={-0.08} max={0.08} step={0.005} pxPerStep={4} decimals={3} defaultValue={-0.03} label={C.tracking} unit="em" hint={t.hero.scrubHint} onChange={setTracking} />
        </span>
      </div>
    </div>
  );
}

// ---------- 2 Hue to scale ----------

const HUE_TRACK = `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => `oklch(0.72 0.17 ${i * 30})`).join(", ")})`;

function HueDemo() {
  const { dials } = useTokens();
  const { t } = useLang();
  const C = t.craft.hue;
  const id = useId();
  const [hue, setHue] = useState(dials.hue);
  // 이 카드 안에서만 쓰는 토큰. 사이트의 다이얼은 건드리지 않는다
  const local = buildTokens({ ...dials, hue, secondary: null });
  return (
    <div className="cr cr--hue" style={local.vars as CSSProperties}>
      <div className="cr-hue__card">
        <span className="cr-hue__title">{C.title}</span>
        <span className="cr-hue__text">{C.text}</span>
        <span className="cr-hue__actions">
          <span className="btn btn--sm" aria-hidden="true">
            {C.button}
          </span>
          <span className="chip" data-current aria-hidden="true">
            {C.chip}
          </span>
        </span>
      </div>
      <div className="scale" aria-hidden="true">
        {local.accent.map((hex, i) => (
          <span key={i} className="scale__step" style={{ background: hex }} />
        ))}
      </div>
      <div className="cr-hue__ctl">
        <label htmlFor={id} className="mono cr__label">
          {C.label}
        </label>
        <input id={id} className="range range--hue" type="range" min={0} max={360} step={1} value={hue} style={{ "--track": HUE_TRACK } as CSSProperties} onChange={(e) => setHue(Number(e.target.value))} />
        <span className="mono cr-hue__out">
          {hue}° · {local.semantic.accent.default} · {C.fixed(local.fixes.length)}
        </span>
      </div>
    </div>
  );
}

// ---------- 3 Contrast fit ----------

const BRAND_PICKS = ["#ea1763", "#7557ff", "#d9ff5b", "#00c5c5", "#777777"];

function ContrastDemo() {
  const { tokens } = useTokens();
  const { t } = useLang();
  const C = t.craft.contrast;
  const id = useId();
  const [hex, setHex] = useState("#ea1763");
  const white = tokens.neutral[0];
  const ink = tokens.neutral[NEUTRAL_STEPS.length - 1];
  const fit = fitOnColor(hex, white, ink);
  const ratio = contrast(fit.on, fit.bg);
  return (
    <div className="cr cr--contrast">
      <div className="cr-con__sample" style={{ background: fit.bg, color: fit.on }}>
        <span className="cr-con__text">{C.sample}</span>
        <span className="mono cr-con__ratio">
          {ratio.toFixed(2)}:1 · {ratio >= AA_TEXT ? C.pass : "AA"}
        </span>
      </div>
      <p className="mono cr-con__note" aria-live="polite">
        {fit.moved ? C.moved(hex, fit.bg) : C.kept}
      </p>
      <div className="cr-con__ctl">
        <label htmlFor={id} className="mono cr__label">
          {C.label}
        </label>
        <input id={id} className="cr-con__color" type="color" value={hex} onChange={(e) => setHex(e.target.value)} />
        <span className="cr-con__picks" role="group" aria-label={C.pick}>
          {BRAND_PICKS.map((p) => (
            <button key={p} type="button" className="cr-con__pick" style={{ background: p }} aria-label={p} aria-pressed={p === hex} onClick={() => setHex(p)} />
          ))}
        </span>
      </div>
    </div>
  );
}

// ---------- 4 Token chain ----------

function InspectDemo() {
  const { tokens } = useTokens();
  const { t } = useLang();
  const C = t.craft.inspect;
  const [names, setNames] = useState("card.bg");
  const parts: { name: string; label: string; className: string }[] = [
    { name: "card.bg", label: C.card, className: "cr-ins__card" },
    { name: "button.bg", label: C.button, className: "cr-ins__button" },
    { name: "chip.bg", label: C.chip, className: "cr-ins__chip" },
    { name: "text.muted", label: C.text, className: "cr-ins__text" },
  ];
  const chain = resolveToken(names, tokens);
  const pick = (name: string) => () => setNames(name);
  return (
    <div className="cr cr--inspect">
      <div className="cr-ins__stage">
        {parts.map((p) => (
          <span key={p.name} className={p.className} tabIndex={0} data-token={p.name} data-active={names === p.name || undefined} onPointerEnter={pick(p.name)} onFocus={pick(p.name)}>
            {p.label}
          </span>
        ))}
      </div>
      <p className="mono cr-ins__chain" aria-live="polite">
        {chain ? (
          <>
            {chain.links.map((l, i) => (
              <span key={l.name}>
                {i > 0 && <span className="cr-ins__arrow"> → </span>}
                {l.name}
              </span>
            ))}
            <span className="cr-ins__arrow"> = </span>
            {/^#/.test(chain.value) && <i className="cr-ins__swatch" style={{ background: chain.value }} aria-hidden="true" />}
            <strong>{chain.value}</strong>
          </>
        ) : (
          C.hint
        )}
      </p>
    </div>
  );
}

// ---------- 5 Toast ----------

function ToastDemo() {
  const { toast } = useTokens();
  const { t } = useLang();
  const C = t.craft.toast;
  return (
    <div className="cr cr--toast">
      <button type="button" className="btn btn--sm" onClick={() => toast(C.shown)}>
        {C.show}
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => toast(C.shown, { label: t.toasts.undo, onClick: () => toast(C.undone) })}>
        {C.undo}
      </button>
    </div>
  );
}

// ---------- 6 Command palette ----------

type MiniCmd = { id: string; label: string; hint: string; run: () => void };

function PaletteDemo({ go }: { go: (href: string) => void }) {
  const { applyPreset, set, dials, toast } = useTokens();
  const { t } = useLang();
  const C = t.craft.palette;
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const uid = useId();
  const cmds: MiniCmd[] = [
    { id: "apps", label: t.sections.apps, hint: "/projects#apps", run: () => go("/projects#apps") },
    { id: "cases", label: t.sections.cases, hint: "/cases", run: () => go("/cases") },
    ...PRESETS.slice(0, 3).map((p) => ({ id: `wear-${p.slug}`, label: t.palette.wear(p.name), hint: p.swatches[0].hex, run: () => applyPreset(p.slug, true) })),
    { id: "theme", label: dials.theme === "dark" ? t.palette.toLight : t.palette.toDark, hint: t.palette.hintTheme, run: () => set({ theme: dials.theme === "dark" ? "light" : "dark" }) },
  ];
  const results = cmds.map((c) => ({ c, s: fuzzyScore(q, `${c.label} ${c.hint}`) })).filter((x) => x.s > 0);
  if (q) results.sort((a, b) => b.s - a.s);
  const list = results.map((x) => x.c).slice(0, 4);
  const run = (c: MiniCmd | undefined) => {
    if (!c) return;
    c.run();
    if (!c.id.startsWith("wear-")) toast(C.run(c.label));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (list.length ? (a + 1) % list.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (list.length ? (a - 1 + list.length) % list.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(list[active]);
    }
  };
  const current = list[active] ? `${uid}-${list[active].id}` : undefined;
  return (
    <div className="cr cr--palette">
      <div className="cr-pal">
        <input
          className="cr-pal__input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={current}
          aria-label={C.label}
          placeholder={C.placeholder}
          value={q}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
        />
        <ul id={`${uid}-list`} className="cr-pal__list" role="listbox" aria-label={C.label}>
          {list.length === 0 && <li className="cr-pal__empty mono">{C.empty(q)}</li>}
          {list.map((c, i) => (
            <li key={c.id} id={`${uid}-${c.id}`} role="option" aria-selected={i === active} className="cr-pal__item" onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => run(c)}>
              <span>{c.label}</span>
              <span className="mono cr-pal__hint">{c.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
