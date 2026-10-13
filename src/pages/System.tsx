// 시스템(/system). 홈에서 내린 두 섹션, 층 설명(토큰 한 번이 네 층을 지나는 길)과 크래프트를 한 장에 둔다.
// 홈에는 다이얼 보드 하나만 남았고, 여기는 그 다이얼이 안에서 어떻게 도는지 보여 주는 쪽이다.
import { useState } from "react";
import type { Step } from "../data.ts";
import { useLang } from "../i18n/useLang.ts";
import { getSteps } from "../i18n/content.ts";
import { ACCENT_STEPS, NEUTRAL_STEPS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { EXPORTS, download } from "../tokens/export.ts";
import { useReveal } from "../hooks.ts";
import { SectionLabel } from "../components/Annot.tsx";
import { Craft } from "../components/Craft.tsx";

export function System({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  return (
    <>
      <header className="container sysidx">
        <h1 className="h1">{t.systemPage.title}</h1>
        <p className="lede">{t.systemPage.lede}</p>
      </header>
      <Layers />
      <Craft go={go} />
    </>
  );
}

type Layer = "primitive" | "semantic" | "component" | "screen";
const LAYER_IDS: Layer[] = ["primitive", "semantic", "component", "screen"];

function Layers() {
  const { tokens, toast, setPanelOpen } = useTokens();
  const { lang, t } = useLang();
  const steps = getSteps(lang);
  const LAYERS: { id: Layer; name: string; step: Step }[] = LAYER_IDS.map((id, i) => ({ id, name: t.layers.names[id], step: steps[i] }));
  const [hot, setHot] = useState<Layer | null>(null);
  const ref = useReveal<HTMLElement>();
  const s = tokens.semantic;
  const stepOf = (hex: string) => {
    const ai = tokens.accent.indexOf(hex);
    if (ai >= 0) return `accent.${ACCENT_STEPS[ai]}`;
    const ni = tokens.neutral.indexOf(hex);
    if (ni >= 0) return `neutral.${NEUTRAL_STEPS[ni]}`;
    return "adjusted";
  };
  const semanticRows: [string, string][] = [
    ["surface.canvas", s.surface.canvas],
    ["surface.raised", s.surface.raised],
    ["text.default", s.text.default],
    ["text.muted", s.text.muted],
    ["line.default", s.line.default],
    ["accent.default", s.accent.default],
    ["accent.on", s.accent.on],
  ];

  return (
    <section id="system" className="layers container reveal" ref={ref} aria-labelledby="layers-title" data-hot={hot ?? undefined}>
      <SectionLabel index="01" title={t.sections.system} aside={<>{t.layers.aside}</>} />
      <div className="section__head">
        <h2 id="layers-title" className="h2">
          {t.layers.title}
        </h2>
        <p className="lede">{t.layers.lede}</p>
      </div>

      <div className="layers__grid">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.id}
            className="layer"
            data-layer={layer.id}
            tabIndex={0}
            onMouseEnter={() => setHot(layer.id)}
            onMouseLeave={() => setHot(null)}
            onFocus={() => setHot(layer.id)}
            onBlur={() => setHot(null)}
            aria-label={t.layers.layerLabel(layer.name, layer.step.title)}
          >
            <div className="layer__head mono">
              <span>
                <span className="seclabel__index">{String(i + 1).padStart(2, "0")}</span> {layer.name}
              </span>
              {i < LAYERS.length - 1 && <span aria-hidden="true">→</span>}
            </div>

            <div className="layer__body">
              {layer.id === "primitive" && (
                <>
                  <div className="prim">
                    <span className="prim__name mono">accent</span>
                    <div className="scale" aria-hidden="true">
                      {tokens.accent.map((hex, j) => (
                        <span key={ACCENT_STEPS[j]} className="scale__step" style={{ background: hex }} />
                      ))}
                    </div>
                    <span className="mono prim__hex">
                      500 {tokens.accent[5]} · 600 {tokens.accent[6]}
                    </span>
                  </div>
                  <div className="prim">
                    <span className="prim__name mono">neutral</span>
                    <div className="scale scale--13" aria-hidden="true">
                      {tokens.neutral.map((hex, j) => (
                        <span key={NEUTRAL_STEPS[j]} className="scale__step" style={{ background: hex }} />
                      ))}
                    </div>
                    <span className="mono prim__hex">
                      0 {tokens.neutral[0]} · 1000 {tokens.neutral[12]}
                    </span>
                  </div>
                  <div className="prim">
                    <span className="prim__name mono">space</span>
                    <div className="spaces" aria-hidden="true">
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <i key={n} style={{ width: `var(--space-${n})` }} />
                      ))}
                    </div>
                    <span className="mono prim__hex">
                      unit {tokens.vars["--space-unit"]} · radius {tokens.vars["--radius-2"]}
                    </span>
                  </div>
                </>
              )}

              {layer.id === "semantic" && (
                <dl className="sem mono">
                  {semanticRows.map(([name, hex]) => (
                    <div key={name} className="sem__row">
                      <dt>
                        <i style={{ background: hex }} aria-hidden="true" />
                        {name}
                      </dt>
                      <dd>
                        {stepOf(hex)} <span className="sem__hex">{hex}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {layer.id === "component" && (
                <div className="comps">
                  <span className="btn btn--sm" aria-hidden="true">
                    {t.layers.button}
                  </span>
                  <span className="btn btn--ghost btn--sm" aria-hidden="true">
                    {t.layers.ghost}
                  </span>
                  <span className="chip" aria-hidden="true">
                    {t.layers.chip}
                  </span>
                  <span className="chip" data-current aria-hidden="true">
                    {t.layers.badge}
                  </span>
                  <div className="comps__card" aria-hidden="true">
                    <span className="comps__title" />
                    <span className="comps__text" />
                    <span className="comps__text comps__text--short" />
                  </div>
                  <ul className="mono comps__list">
                    <li>button.bg → accent.default</li>
                    <li>card.bg → surface.raised</li>
                    <li>chip.bg → surface.sunken</li>
                  </ul>
                </div>
              )}

              {layer.id === "screen" && <MiniScreen />}
            </div>

            <p className="layer__cap">
              <strong>{layer.step.title}.</strong> {layer.step.body}
            </p>
          </div>
        ))}
      </div>

      <div className="layers__check mono" data-token="accent.text">
        <span className="seclabel__index">05</span> {t.layers.check} · <strong>{steps[4].title}.</strong> {steps[4].body}{" "}
        <span className="layers__check-result" data-fixed={tokens.fixes.length > 0 || undefined}>
          {tokens.fixes.length === 0 ? t.layers.contrastOk : t.layers.contrastFixed(tokens.fixes.length, tokens.fixes.map((f) => f.token).join(", "))}
        </span>
      </div>

      {/* 06 가져가기: 토큰 패널의 내보내기를 섹션 안에서도 보인다 */}
      <div className="layers__take">
        <p className="layers__take-text mono">
          <span className="seclabel__index">06</span> <strong>{t.layers.take}.</strong> {t.layers.takeBody}{" "}
          <button type="button" className="layers__take-dials" onClick={() => setPanelOpen(true)}>
            {t.layers.takeDials} →
          </button>
        </p>
        <div className="layers__take-files">
          {EXPORTS.map((x) => (
            <button
              key={x.file}
              type="button"
              className={`btn btn--sm mono${x.file === "DESIGN.md" ? "" : " btn--ghost"}`}
              onClick={() => {
                download(x.file, x.build(tokens), x.type);
                toast(t.toasts.downloaded(x.file));
              }}
              data-token={x.file === "DESIGN.md" ? "button.bg button.fg button.radius" : "line.strong button.radius"}
            >
              {x.file} ↓
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// 이 사이트의 축소판. 각 조각에 소유 층을 적어 두면 호버 시 그 층이 빛난다
function MiniScreen() {
  return (
    <div className="mini" data-owner="screen" aria-hidden="true">
      <div className="mini__bar" data-owner="semantic">
        <i data-owner="semantic" />
        <b data-owner="component" />
      </div>
      <div className="mini__hero">
        <span className="mini__h" data-owner="semantic primitive" />
        <span className="mini__h mini__h--2" data-owner="semantic primitive" />
        <span className="mini__p" data-owner="semantic" />
        <span className="mini__btn" data-owner="component primitive" />
      </div>
      <div className="mini__cards">
        <span className="mini__card" data-owner="component" />
        <span className="mini__card" data-owner="component" />
        <span className="mini__card" data-owner="component" />
      </div>
    </div>
  );
}

