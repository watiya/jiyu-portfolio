// 앱 상세: 스펙 시트. 왼쪽 고정 메타, 오른쪽 본문, 폰 프레임 갤러리.
import { useLang } from "../i18n/useLang.ts";
import { getAppDetails, getApps } from "../i18n/content.ts";
import { PRESETS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { internalClick } from "../router.ts";
import { PhoneFrame } from "../components/PhoneFrame.tsx";
import { SectionLabel } from "../components/Annot.tsx";
import { activePresetOf } from "../lib.ts";

export function AppDetail({ slug, go }: { slug: string; go: (href: string) => void }) {
  const { lang, t } = useLang();
  const details = getAppDetails(lang);
  const detail = details.find((d) => d.slug === slug);
  const { applyPreset, dials } = useTokens();
  const onClick = internalClick(go);
  if (!detail) return <NotFound path={`/apps/${slug}`} go={go} />;
  const app = getApps(lang).find((a) => a.name === detail.name);
  const preset = PRESETS.find((p) => p.slug === slug);
  const wearing = activePresetOf(dials)?.slug === slug;
  const i = details.indexOf(detail);
  const prev = details[(i + details.length - 1) % details.length];
  const next = details[(i + 1) % details.length];
  const D = t.detail;

  return (
    <article className="detail container">
      <SectionLabel index={String(i + 1).padStart(2, "0")} title={app?.koName ? `${detail.name} · ${app.koName}` : detail.name} aside={<>{D.aside(detail.date)}</>} />
      <div className="detail__grid">
        <aside className="detail__meta" aria-label={D.spec}>
          <dl className="spec mono">
            {detail.meta.map((m) => (
              <div key={m.label} className="spec__row">
                <dt>{m.label}</dt>
                <dd>{m.value}</dd>
              </div>
            ))}
            <div className="spec__row">
              <dt>{D.stack}</dt>
              <dd>{detail.stack.join(" · ")}</dd>
            </div>
          </dl>
          {preset && (
            <div className="swatches" aria-label={t.apps.colors(detail.name)}>
              {preset.swatches.map((s) => (
                <span key={s.hex} className="swatch mono" title={s.label}>
                  <i style={{ background: s.hex }} aria-hidden="true" />
                  {s.hex}
                </span>
              ))}
            </div>
          )}
          <div className="detail__actions">
            {preset && (
              <button type="button" className="btn btn--sm" onClick={() => applyPreset(slug, true)} aria-pressed={wearing} data-token="button.bg button.fg">
                {wearing ? D.wearing : D.wear}
              </button>
            )}
            {app && (
              <a className="btn btn--ghost btn--sm" href={app.href} target="_blank" rel="noreferrer">
                {D.open}
              </a>
            )}
          </div>
        </aside>
        <div className="detail__body">
          <h1 className="h1">{detail.title}</h1>
          <p className="lede">{detail.dek}</p>
          {detail.sections.map((s) => (
            <section key={s.heading} className="detail__section">
              <h2 className="h3">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </section>
          ))}
          <div className="shots" aria-label={D.screens}>
            {detail.shots.map((src, k) => (
              <figure key={src} className="shot">
                <PhoneFrame src={src} alt={D.screenN(detail.name, k + 1)} width={200} />
                <figcaption className="mono">{src.split("/").pop()?.replace(".png", "")}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
      <nav className="detail__nav" aria-label={D.otherApps}>
        <a href={`/apps/${prev.slug}`} onClick={onClick}>
          ← {prev.name}
        </a>
        <a href="/projects#apps" onClick={onClick}>
          {D.all}
        </a>
        <a href={`/apps/${next.slug}`} onClick={onClick}>
          {next.name} →
        </a>
      </nav>
    </article>
  );
}

export function NotFound({ path, go }: { path: string; go: (href: string) => void }) {
  const { t } = useLang();
  return (
    <section className="container notfound">
      <SectionLabel index="404" title={t.sections.notFound} aside={<span className="mono">{path}</span>} />
      <h1 className="h1">{t.notFound.title}</h1>
      <a className="btn" href="/projects" onClick={internalClick(go)}>
        {t.notFound.back}
      </a>
    </section>
  );
}
