// 앱 상세. 모든 앱이 같은 순서를 쓴다.
// 머리(시리즈·종류, 두 줄 제목, 한 단락, 주 행동·보조 링크) → 폰 화면 → 쓰는 하루 세 장면 → 이 앱이 입힌 토큰 → 만든 기록 → 같은 묶음 앱
import type { CSSProperties } from "react";
import { useLang } from "../i18n/useLang.ts";
import { getAppDetails, getApps, metaValue } from "../i18n/content.ts";
import { APP_LINKS } from "../appDetails.ts";
import { PRESETS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { internalClick } from "../router.ts";
import { PhoneFrame } from "../components/PhoneFrame.tsx";
import { SectionLabel } from "../components/Annot.tsx";
import { AppShelf } from "../components/AppShelf.tsx";
import { activePresetOf, ctaOf } from "../lib.ts";

export function AppDetail({ slug, go }: { slug: string; go: (href: string) => void }) {
  const { lang, t } = useLang();
  const details = getAppDetails(lang);
  const detail = details.find((d) => d.slug === slug);
  const { applyPreset, dials } = useTokens();
  const onClick = internalClick(go);
  if (!detail) return <NotFound path={`/apps/${slug}`} go={go} />;
  const apps = getApps(lang);
  const app = apps.find((a) => a.name === detail.name);
  // 선반과 같은 묶음(붐치·멘치·그 밖)의 다른 앱. 숨김 앱은 getApps 에서 이미 빠진다
  const group = app?.series ?? "other";
  const siblings = apps.filter((a) => (a.series ?? "other") === group && a !== app);
  const preset = PRESETS.find((p) => p.slug === slug);
  const wearing = activePresetOf(dials)?.slug === slug;
  const cta = ctaOf(detail.name, slug);
  const links = APP_LINKS[slug] ?? {};
  const status = metaValue(detail, "Status") ?? app?.badge;
  const i = details.indexOf(detail);
  const prev = details[(i + details.length - 1) % details.length];
  const next = details[(i + 1) % details.length];
  const D = t.detail;

  return (
    <article className="detail container" style={{ "--app-bg": preset?.swatches[0].hex } as CSSProperties}>
      <SectionLabel index={String(i + 1).padStart(2, "0")} title={app?.koName ? `${detail.name} · ${app.koName}` : detail.name} aside={<>{D.aside(detail.date)}</>} />

      <header className="ad__head">
        <span className="mono ad__kicker">
          {app?.series && <>{t.appsPage.series[app.series]} · </>}
          {app?.kind}
        </span>
        <h1 className="h1 ad__title">{detail.title}</h1>
        <p className="lede">{detail.dek}</p>
        <div className="ad__row">
          <div className="sh__status ad__status">
            <span className="mono sh__label">
              {t.apps.status} · {detail.date}
            </span>
            <strong>{status}</strong>
          </div>
          <div className="ad__actions">
            {cta ? (
              <a className="btn" href={cta.href} target="_blank" rel="noreferrer" data-token="button.bg button.fg button.radius">
                {t.apps.cta[cta.kind]} <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <span className="mono sh__nolink">{t.apps.noLink}</span>
            )}
            {links.privacy && (
              <a className="ad__sub" href={links.privacy} target="_blank" rel="noreferrer">
                {D.privacy} <span aria-hidden="true">↗</span>
              </a>
            )}
            {links.support && (
              <a className="ad__sub" href={links.support} target="_blank" rel="noreferrer">
                {D.support} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="ad__stage" aria-label={D.screens}>
        <div className="shots">
          {detail.shots.map((src, k) => (
            <figure key={src} className="shot">
              <PhoneFrame src={src} alt={D.screenN(detail.name, k + 1)} width={200} />
              <figcaption className="mono">{src.split("/").pop()?.replace(".png", "")}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      {detail.day && (
        <section className="ad__day" aria-labelledby="ad-day">
          <h2 id="ad-day" className="h2">
            {D.day}
          </h2>
          <p className="lede">{D.dayLede}</p>
          <ol className="ad__steps">
            {detail.day.map((s, k) => (
              <li key={s.title} className="ad__step">
                <span className="seclabel__index">{String(k + 1).padStart(2, "0")}</span>
                <h3 className="h3">{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {preset && (
        <section className="ad__tokens" aria-labelledby="ad-tokens" data-token="card.bg card.line card.radius">
          <div className="ad__tokens-text">
            <h2 id="ad-tokens" className="h2">
              {D.tokens}
            </h2>
            <p className="lede">{D.tokensLede}</p>
            <button type="button" className="btn ad__wear" onClick={() => applyPreset(slug, true)} aria-pressed={wearing} data-token="button.bg button.fg button.radius">
              {wearing ? D.wearingSite : D.wearSite}
            </button>
          </div>
          <ul className="ad__swatches" role="list" aria-label={t.apps.colors(detail.name)}>
            {preset.swatches.map((s) => (
              <li key={s.hex} className="ad__swatch">
                <i style={{ background: s.hex }} aria-hidden="true" />
                <span className="mono">{s.hex}</span>
                <span className="mono ad__swatch-label">{s.label}</span>
              </li>
            ))}
          </ul>
          <dl className="spec mono ad__dials" aria-label={D.dials}>
            {Object.entries(preset.dials).map(([k, v]) => (
              <div key={k} className="spec__row">
                <dt>{k}</dt>
                <dd>{k === "hue" ? `${v}°` : String(v)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="ad__notes" aria-labelledby="ad-notes">
        <h2 id="ad-notes" className="h2">
          {D.notes}
        </h2>
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
          </aside>
          <div className="detail__body">
            {detail.sections.map((s) => (
              <section key={s.heading} className="detail__section">
                <h3 className="h3">{s.heading}</h3>
                {s.body.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </section>

      {siblings.length > 0 && (
        <div className="ad__more">
          <AppShelf apps={siblings} go={go} level={2} lead={false} />
        </div>
      )}

      <nav className="detail__nav" aria-label={D.otherApps}>
        <a href={`/apps/${prev.slug}`} onClick={onClick}>
          ← {prev.name}
        </a>
        <a href="/apps" onClick={onClick}>
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
