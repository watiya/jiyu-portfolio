// 토큰 패널. 데스크톱은 오른쪽 아래 도크, 모바일은 바텀 시트. 입력은 전부 네이티브라 키보드로 다룰 수 있다.
import { useEffect, useId, useRef } from "react";
import {
  ACCENT_STEPS,
  DENSITIES,
  MOTIONS,
  NEUTRALS,
  PAIRINGS,
  PAIRING_META,
  PRESETS,
  THEMES,
  type Dials,
} from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { EXPORTS, download } from "../tokens/export.ts";
import { useLang } from "../i18n/useLang.ts";

function Segmented<T extends string>({ name, value, options, onChange, labels }: { name: string; value: T; options: readonly T[]; onChange: (v: T) => void; labels: Record<string, string> }) {
  return (
    <div className="seg" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <label key={o} className="seg__item" data-on={o === value || undefined}>
          <input type="radio" name={name} value={o} checked={o === value} onChange={() => onChange(o)} />
          <span>{labels[o] ?? o}</span>
        </label>
      ))}
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <div className="field__head">
        <span className="field__label">{label}</span>
        {value && <span className="mono field__value">{value}</span>}
      </div>
      {children}
    </div>
  );
}

export function TokenPanel() {
  const { dials, tokens, set, reset, applyPreset, copyLink, panelOpen, setPanelOpen, isDefault, toast } = useTokens();
  const { t } = useLang();
  const L = t.panel;
  const ref = useRef<HTMLElement>(null);
  const hueId = useId();
  const radiusId = useId();

  // 열리면 첫 컨트롤로 포커스, Escape 로 닫기
  useEffect(() => {
    if (!panelOpen) return;
    const first = ref.current?.querySelector<HTMLElement>("input, button");
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, setPanelOpen]);

  const activePreset = PRESETS.find((p) => Object.entries(p.dials).every(([k, v]) => dials[k as keyof Dials] === v));
  const source = isDefault ? L.source : activePreset ? L.preset(activePreset.name) : L.custom;
  const hueTrack = `linear-gradient(90deg, ${Array.from({ length: 13 }, (_, i) => `oklch(0.72 0.17 ${i * 30})`).join(", ")})`;
  const fixes = tokens.fixes.length;

  return (
    <>
      <aside id="token-panel" ref={ref} className="panel" data-open={panelOpen || undefined} aria-label={L.label} aria-hidden={!panelOpen} data-token="panel.bg panel.line">
        <div className="panel__grab" aria-hidden="true" />
        <header className="panel__head">
          <div>
            <h2 className="panel__title">{L.title}</h2>
            <span className="mono panel__source">{source}</span>
          </div>
          <button type="button" className="iconbtn" onClick={() => setPanelOpen(false)} aria-label={L.close}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="panel__body">
          <Field label={L.theme}>
            <Segmented name={L.theme} value={dials.theme} options={THEMES} labels={L.themes} onChange={(theme) => set({ theme })} />
          </Field>

          <Field label={L.hue} value={`${dials.hue}°`}>
            <label htmlFor={hueId} className="sr-only">{L.hue}</label>
            <input
              id={hueId}
              className="range range--hue"
              type="range"
              min={0}
              max={360}
              step={1}
              value={dials.hue}
              style={{ "--track": hueTrack } as React.CSSProperties}
              onChange={(e) => set({ hue: Number(e.target.value) })}
            />
            <div className="scale" aria-hidden="true">
              {tokens.accent.map((hex, i) => (
                <span key={ACCENT_STEPS[i]} className="scale__step" style={{ background: hex }} title={`accent.${ACCENT_STEPS[i]} ${hex}`} />
              ))}
            </div>
            <div className="scale__labels mono" aria-hidden="true">
              <span>50</span>
              <span>500</span>
              <span>950</span>
            </div>
          </Field>

          <Field label={L.neutral}>
            <Segmented name={L.neutral} value={dials.neutral} options={NEUTRALS} labels={L.neutrals} onChange={(neutral) => set({ neutral })} />
          </Field>

          <Field label={L.pairing}>
            <div className="pairs" role="radiogroup" aria-label={L.pairing}>
              {PAIRINGS.map((p) => {
                const m = PAIRING_META[p];
                return (
                  <label key={p} className="pair" data-on={p === dials.pairing || undefined}>
                    <input type="radio" name="pairing" value={p} checked={p === dials.pairing} onChange={() => set({ pairing: p })} />
                    <span className="pair__aa" style={{ fontFamily: m.heading, fontWeight: m.weight, fontStyle: m.italic ? "italic" : "normal" }} aria-hidden="true">
                      Aa
                    </span>
                    <span className="pair__name">{m.label}</span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label={L.radius} value={`${dials.radius} px`}>
            <label htmlFor={radiusId} className="sr-only">{L.radius}</label>
            <div className="range-row">
              <input id={radiusId} className="range" type="range" min={0} max={24} step={1} value={dials.radius} onChange={(e) => set({ radius: Number(e.target.value) })} />
              <span className="radius-demo" aria-hidden="true" />
            </div>
          </Field>

          <Field label={L.density}>
            <Segmented name={L.density} value={dials.density} options={DENSITIES} labels={L.densities} onChange={(density) => set({ density })} />
          </Field>

          <Field label={L.motion}>
            <Segmented name={L.motion} value={dials.motion} options={MOTIONS} labels={L.motions} onChange={(motion) => set({ motion })} />
          </Field>

          <Field label={L.wear}>
            <div className="presets">
              {PRESETS.map((p) => (
                <button key={p.slug} type="button" className="preset" data-on={activePreset?.slug === p.slug || undefined} onClick={() => applyPreset(p.slug)}>
                  <span className="preset__dots" aria-hidden="true">
                    {p.swatches.slice(0, 3).map((s) => (
                      <i key={s.hex} style={{ background: s.hex }} />
                    ))}
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <footer className="panel__foot">
          <span className="mono panel__check" data-fixed={fixes > 0 || undefined}>
            {fixes === 0 ? L.contrastOk : L.contrastFixed(fixes)}
          </span>
          <div className="panel__export">
            <span className="mono panel__export-label">
              {L.export} <span>· {L.exportHint}</span>
            </span>
            <div className="panel__export-files">
              {EXPORTS.map((x) => (
                <button
                  key={x.file}
                  type="button"
                  className="btn btn--ghost btn--sm mono"
                  onClick={() => {
                    download(x.file, x.build(tokens), x.type);
                    toast(t.toasts.downloaded(x.file));
                  }}
                >
                  {x.file} ↓
                </button>
              ))}
            </div>
          </div>
          <div className="panel__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={reset} disabled={isDefault}>
              {L.reset}
            </button>
            <button type="button" className="btn btn--sm" onClick={() => void copyLink()} data-token="button.bg button.fg button.radius">
              {L.copy}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
