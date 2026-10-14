// brainchild.kr 첫 화면 (2026-10-14 개편). 주인공은 토큰 놀이터: 다이얼을 돌리면 견본 화면과 사이트가 같이 바뀌고,
// 결과를 DESIGN.md·tokens.css·tokens.json 으로 가져간다. 그 아래 재미요소 띠, 그 아래 앱, 맨 끝 연락.
import { useLang } from "../i18n/useLang.ts";
import { getAppDetails, getApps } from "../i18n/content.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { PRESETS } from "../tokens/engine.ts";
import { EXPORTS, download } from "../tokens/export.ts";
import { activePresetOf, slugOf } from "../lib.ts";
import { isHiddenApp } from "../hidden.ts";
import { internalClick } from "../router.ts";
import { useReveal } from "../hooks.ts";
import { Corners, SectionLabel } from "../components/Annot.tsx";
import { DialBoard } from "../components/Dials.tsx";
import { PhoneFrame } from "../components/PhoneFrame.tsx";
import { Radar, Ring } from "../tools/Charts.tsx";
import { ToolCards } from "./tools/Shell.tsx";
import { Contact } from "./Home.tsx";

export function Front({ go }: { go: (href: string) => void }) {
  return (
    <>
      <Playground />
      <Fun go={go} />
      <Apps go={go} />
      <Contact go={go} />
    </>
  );
}

// ---------- 01 토큰 놀이터 ----------

function Playground() {
  const { t } = useLang();
  const F = t.front;
  const { tokens, dials, isDefault, reset, copyLink, toast, history, undo, redo } = useTokens();
  const H = F.history;
  const preset = activePresetOf(dials);
  const source = isDefault ? t.panel.source : preset ? t.panel.preset(preset.name) : t.panel.custom;
  return (
    <section id="play" className="play container" aria-labelledby="play-title">
      <SectionLabel index="01" title={F.kicker} aside={<>{F.aside}</>} />
      <div className="play__head">
        <h1 id="play-title" className="h1">
          {F.h1}
        </h1>
        <p className="lede">{F.lede}</p>
      </div>

      <div className="play__grid">
        <div className="play__side">
          <Sample />
          <div className="take" data-token="card.bg card.line card.radius">
            <div className="take__head mono">
              <span>
                {F.take.label} <span className="take__hint">· {F.take.hint}</span>
              </span>
              <span className="take__source" aria-live="polite">
                {F.take.source}: {source}
              </span>
            </div>
            <div className="take__files">
              {EXPORTS.map((x) => (
                <button
                  key={x.file}
                  type="button"
                  className="btn btn--sm mono"
                  data-token="button.bg button.fg button.radius"
                  onClick={() => {
                    download(x.file, x.build(tokens), x.type);
                    toast(t.toasts.downloaded(x.file));
                  }}
                >
                  {x.file} ↓
                </button>
              ))}
            </div>
            <div className="take__row">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => void copyLink()}>
                {F.take.link}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={reset} disabled={isDefault}>
                {F.take.reset}
              </button>
            </div>
            <div className="take__history mono" role="group" aria-label={H.label}>
              <button type="button" className="iconbtn" onClick={undo} disabled={history.back === 0} aria-label={H.undo} title={`${H.undo} · ⌘Z`}>
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5.5 3L2.5 6l3 3M3 6h6.5a3.5 3.5 0 010 7H7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="iconbtn" onClick={redo} disabled={history.fwd === 0} aria-label={H.redo} title={`${H.redo} · ⇧⌘Z`}>
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M10.5 3l3 3-3 3M13 6H6.5a3.5 3.5 0 000 7H9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span aria-live="polite">{H.steps(history.back)}</span>
            </div>
          </div>
        </div>
        <div className="play__board">
          <DialBoard />
        </div>
      </div>
    </section>
  );
}

// 견본 화면: 폰 한 대와 부품 한 장. 전부 :root 의 살아 있는 토큰을 읽어서 다이얼을 돌리면 그 자리에서 바뀐다
function Sample() {
  const { t } = useLang();
  const S = t.front.sample;
  return (
    <div className="sample" aria-label={S.label}>
      <div className="sample__phone" data-token="phone.bezel surface.canvas accent.default">
        <Corners />
        <div className="sample__bar mono">
          <span>9:41</span>
          <span>{S.app}</span>
        </div>
        <p className="sample__greet">{S.greet}</p>
        <div className="sample__stat" data-token="card.bg card.radius">
          <div>
            <span className="mono sample__stat-label">{S.stat}</span>
            <span className="sample__bars" aria-hidden="true">
              {[0.5, 0.8, 0.35, 0.95, 0.6, 0.7, 0.45].map((v, i) => (
                <i key={i} style={{ height: `${v * 100}%` }} data-on={i === 3 || undefined} />
              ))}
            </span>
          </div>
          <Ring value={72} label={S.stat} size={64} />
        </div>
        <ul className="sample__rows" role="list">
          {S.rows.map((r) => (
            <li key={r}>
              <i aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
        <div className="sample__btns">
          <span className="btn btn--sm">{S.cta}</span>
          <span className="btn btn--ghost btn--sm">{S.ghost}</span>
        </div>
      </div>
      <div className="sample__sheet" data-token="surface.raised line.default">
        <p className="sample__heading h2">{S.heading}</p>
        <p className="sample__body">{S.body}</p>
        <div className="sample__row">
          <span className="btn btn--sm">{S.cta}</span>
          <span className="btn btn--ghost btn--sm">{S.ghost}</span>
          <span className="chip">{S.chip}</span>
        </div>
        <label className="sample__field">
          <span className="mono">{S.field}</span>
          <input type="text" placeholder={S.placeholder} data-token="field.bg field.line radius.2" />
        </label>
        <div className="sample__chart">
          <Radar labels={S.axes} series={[{ values: [0.62, 0.4, 0.86, 0.3, 0.55], color: "b", hatch: true }]} size={200} />
          <span className="mono">{S.chart}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- 02 재미요소 ----------

function Fun({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  const F = t.front.fun;
  const ref = useReveal<HTMLElement>();
  return (
    <section id="fun" className="fun container reveal" ref={ref} aria-labelledby="fun-title">
      <SectionLabel
        index="02"
        title={F.kicker}
        aside={
          <a href="/tools" onClick={internalClick(go)} className="seclabel__link">
            {F.aside} · {F.all} →
          </a>
        }
      />
      <div className="section__head">
        <h2 id="fun-title" className="h2">
          {F.title}
        </h2>
        <p className="lede">{F.lede}</p>
      </div>
      <ToolCards go={go} compact />
      <p className="mono fun__note">{F.note}</p>
    </section>
  );
}

// ---------- 03 앱 ----------

function Apps({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const A = t.front.apps;
  const { dials, applyPreset } = useTokens();
  const ref = useReveal<HTMLElement>();
  const onClick = internalClick(go);
  const details = getAppDetails(lang);
  const apps = getApps(lang)
    .map((a) => {
      const slug = slugOf(a.name);
      const detail = details.find((d) => d.slug === slug);
      const preset = PRESETS.find((p) => p.slug === slug);
      return { ...a, slug, preset, shot: detail?.shots[0] ?? a.image };
    })
    .filter((a) => a.preset && !isHiddenApp(a.slug));
  const active = activePresetOf(dials);
  return (
    <section id="apps" className="front-apps container reveal" ref={ref} aria-labelledby="front-apps-title">
      <SectionLabel
        index="03"
        title={A.kicker}
        aside={
          <a href="/apps" onClick={onClick} className="seclabel__link">
            {A.aside(apps.length)} · {A.all} →
          </a>
        }
      />
      <div className="section__head">
        <h2 id="front-apps-title" className="h2">
          {A.title}
        </h2>
        <p className="lede">{A.lede}</p>
      </div>
      <ul className="front-apps__row" role="list">
        {apps.map((app, i) => (
          <li key={app.slug} className="front-app" data-on={active?.slug === app.slug || undefined}>
            <button type="button" className="front-app__phone" aria-pressed={active?.slug === app.slug} aria-label={A.wear(app.name)} onClick={() => applyPreset(app.slug, true)}>
              <PhoneFrame src={app.shot} alt="" width={124} priority={i < 3} />
            </button>
            <a className="front-app__name" href={`/apps/${app.slug}`} onClick={onClick} aria-label={A.open(app.name)}>
              {app.name}
              <span className="front-app__dots" aria-hidden="true">
                {app.preset?.swatches.slice(0, 3).map((sw) => (
                  <i key={sw.hex} style={{ background: sw.hex }} />
                ))}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
