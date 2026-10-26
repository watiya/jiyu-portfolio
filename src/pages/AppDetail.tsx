// 앱 상세. 모든 앱이 같은 순서를 쓴다.
// 머리(글 칸 + 앱 색 판에 대표 화면 하나) → 쓰는 하루(장면을 읽는 동안 옆의 폰이 그 장면 화면으로 바뀜) → 다른 화면
// → 이 앱이 입힌 토큰 → 만든 기록 → 같은 묶음 앱. 장면이 없는 앱은 예전처럼 화면 줄 하나를 쓴다
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AppDetail as Detail } from "../appDetails.ts";
import type { UI } from "../i18n/ui.ts";
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
  const cover = detail.shots[0];
  // 장면 옆에서 이미 보인 화면은 빼고, 남은 화면만 아래 줄에 모은다
  const used = new Set(detail.day ? walkShots(detail) : detail.shots);
  const extra = detail.shots.filter((src) => !used.has(src));

  return (
    <article className="detail container" style={{ "--app-bg": preset?.swatches[0].hex } as CSSProperties}>
      <SectionLabel index={String(i + 1).padStart(2, "0")} title={app?.koName ? `${detail.name} · ${app.koName}` : detail.name} aside={<>{D.aside(detail.date)}</>} />

      <div className="ad__hero" data-cover={cover ? "" : undefined} data-walk={used.size > 0 && detail.day ? "" : undefined}>
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

        {cover && (
          <div className="ad__cover" aria-hidden="true">
            <PhoneFrame src={cover} alt="" width={232} priority />
          </div>
        )}
      </div>

      {detail.day ? (
        <DayWalk key={detail.slug} detail={detail} D={D} />
      ) : (
        detail.shots.length > 0 && (
          <div className="ad__stage" aria-label={D.screens}>
            <Shots shots={detail.shots} name={detail.name} D={D} width={200} />
          </div>
        )
      )}

      {extra.length > 0 && (
        <section className="ad__extra" aria-labelledby="ad-extra">
          <h2 id="ad-extra" className="mono ad__extra-title">
            {D.moreScreens}
          </h2>
          <Shots shots={extra} name={detail.name} D={D} width={160} offset={detail.shots.length - extra.length} />
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

// 장면마다 띄울 화면. 이어 둔 화면이 없으면 shots 의 같은 자리
const walkShots = (detail: Detail) => (detail.day ?? []).map((s, k) => s.shot ?? detail.shots[k]).filter((src): src is string => Boolean(src));

function Shots({ shots, name, D, width, offset = 0 }: { shots: string[]; name: string; D: UI["detail"]; width: number; offset?: number }) {
  return (
    <div className="shots">
      {shots.map((src, k) => (
        <figure key={src} className="shot">
          <PhoneFrame src={src} alt={D.screenN(name, offset + k + 1)} width={width} />
          <figcaption className="mono">{src.split("/").pop()?.replace(".png", "")}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const reducedMotion = () =>
  document.documentElement.dataset.motion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// 쓰는 하루. 넓은 화면은 왼쪽 장면을 읽어 내려가는 동안 오른쪽에 붙은 폰이 그 장면 화면으로 바뀐다.
// 좁은 화면은 장면마다 글 아래 화면을 바로 둔다(붙는 폰 없음)
function DayWalk({ detail, D }: { detail: Detail; D: UI["detail"] }) {
  const steps = (detail.day ?? []).map((s, k) => ({ ...s, shot: s.shot ?? detail.shots[k] }));
  const hasShots = steps.some((s) => s.shot);
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const total = steps.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    const els = refs.current.filter((el): el is HTMLLIElement => el !== null);
    if (!("IntersectionObserver" in window) || els.length === 0) return;
    // 화면 세로 가운데 띠를 지나는 장면이 지금 장면
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [total]);

  const goTo = (k: number) => refs.current[k]?.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });

  return (
    <section className="ad__walk" aria-labelledby="ad-day">
      <div className="ad__walk-head">
        <h2 id="ad-day" className="h2">
          {D.day}
        </h2>
        <p className="lede">{D.dayLede}</p>
      </div>
      <div className="ad__walk-grid" data-phone={hasShots ? "" : undefined}>
        <ol className="ad__walk-steps">
          {steps.map((s, k) => (
            <li
              key={s.title}
              ref={(el) => {
                refs.current[k] = el;
              }}
              data-step={k}
              className="ad__walk-step"
              data-active={k === active ? "" : undefined}
            >
              <span className="mono ad__walk-index">
                {pad(k + 1)} / {pad(total)}
                <i aria-hidden="true" />
              </span>
              <h3 className="h3">{s.title}</h3>
              <p>{s.body}</p>
              {s.shot && (
                <div className="ad__walk-inline">
                  <PhoneFrame src={s.shot} alt={D.screenN(detail.name, k + 1)} width={208} />
                </div>
              )}
            </li>
          ))}
        </ol>
        {hasShots && (
          <div className="ad__walk-stage">
            <div className="ad__walk-pin" data-token="card.radius">
              <div className="ad__walk-phones">
                {steps.map((s, k) =>
                  s.shot ? (
                    <span key={s.title} className="ad__walk-phone" data-active={k === active ? "" : undefined} aria-hidden={k !== active}>
                      <PhoneFrame src={s.shot} alt={D.screenN(detail.name, k + 1)} width={248} />
                    </span>
                  ) : null,
                )}
              </div>
              <div className="ad__walk-ctl">
                <span className="mono ad__walk-now" aria-hidden="true">
                  {pad(active + 1)} · {steps[active]?.title}
                </span>
                <span className="ad__walk-ticks">
                  {steps.map((s, k) => (
                    <button
                      key={s.title}
                      type="button"
                      className="ad__walk-tick"
                      aria-label={`${D.sceneN(k + 1, total)}: ${s.title}`}
                      aria-current={k === active ? "step" : undefined}
                      onClick={() => goTo(k)}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
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
