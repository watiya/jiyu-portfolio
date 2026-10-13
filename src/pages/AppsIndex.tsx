// 앱 전체 목록(/apps). 홈 #apps 는 featured 만 세우는 토큰 쇼케이스이고, 여기는 숨김이 아닌 앱 전부를 촘촘한 격자로 둔다.
// 카드는 기존 상세(/apps/<slug>)로 간다. 거르기는 데이터에 있는 kind(앱 종류)만 쓴다.
import { useState } from "react";
import { SectionLabel, Corners } from "../components/Annot.tsx";
import { PhoneFrame } from "../components/PhoneFrame.tsx";
import { useLang } from "../i18n/useLang.ts";
import { getAppDetails, getApps, metaValue } from "../i18n/content.ts";
import { PRESETS } from "../tokens/engine.ts";
import { useTokens } from "../tokens/useTokens.ts";
import { activePresetOf, slugOf } from "../lib.ts";
import { internalClick } from "../router.ts";

export function AppsIndex({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const { dials } = useTokens();
  const [kind, setKind] = useState<string>("all");
  const onClick = internalClick(go);
  const P = t.appsPage;
  const apps = getApps(lang);
  const details = getAppDetails(lang);
  const active = activePresetOf(dials);
  // 종류는 앱 데이터에 실제로 있는 값만, 처음 나온 순서대로. 한 가지뿐이면 거르기를 세우지 않는다
  const kinds = apps.map((a) => a.kind).filter((k, i, all) => all.indexOf(k) === i);
  // 언어를 바꾸면 kind 표기도 바뀐다. 없는 값이면 전체로 본다
  const current = kinds.includes(kind) ? kind : "all";
  const shown = current === "all" ? apps : apps.filter((a) => a.kind === current);
  const featured = apps.filter((a) => a.featured).length;
  // 전부 홈에 있으면 표시가 정보가 아니다. 일부만 홈에 설 때만 단다
  const markHome = featured < apps.length;

  return (
    <section className="container appsidx">
      <SectionLabel index="02" title={t.sections.apps} aside={<>{P.aside(apps.length, featured)}</>} />
      <h1 className="h1">{P.title}</h1>
      <p className="lede">{P.lede}</p>

      {kinds.length > 1 && (
        <div className="wkfilters" role="group" aria-label={P.filter}>
          <button type="button" className="wkfilter" aria-pressed={current === "all"} onClick={() => setKind("all")}>
            {P.all} <span className="mono">{apps.length}</span>
          </button>
          {kinds.map((k) => (
            <button key={k} type="button" className="wkfilter" aria-pressed={current === k} onClick={() => setKind(k)}>
              {k} <span className="mono">{apps.filter((a) => a.kind === k).length}</span>
            </button>
          ))}
        </div>
      )}

      {/* 치수선: 격자 폭 전체를 잰다. 라벨이 지금 보이는 개수다 */}
      <div className="appsidx__rule" aria-hidden="true">
        <i />
        <span className="mono">{P.count(shown.length)}</span>
        <i />
      </div>
      <p className="sr-only" aria-live="polite">
        {P.count(shown.length)}
      </p>

      <ul className="appgrid" role="list">
        {shown.map((app, i) => {
          const slug = slugOf(app.name);
          const detail = details.find((d) => d.slug === slug);
          const preset = PRESETS.find((p) => p.slug === slug);
          const status = (detail && metaValue(detail, "Status")) ?? app.badge;
          const platform = (detail && metaValue(detail, "Platform")) ?? app.note;
          const wearing = active?.slug === slug;
          const n = apps.indexOf(app) + 1;
          return (
            <li key={slug}>
              <a className="appcard" href={`/apps/${slug}`} onClick={onClick} aria-label={`${app.name}: ${app.line}`} data-token="card.bg card.line card.radius">
                <div className="appcard__stage" data-token="surface.sunken radius.2">
                  <Corners />
                  <span className="appcard__no mono" aria-hidden="true">
                    {String(n).padStart(2, "0")}
                  </span>
                  {markHome && app.featured && <span className="appcard__home mono">{P.home}</span>}
                  <PhoneFrame src={app.image} alt={t.apps.screen(app.name)} width={128} priority={i < 4} />
                </div>
                <div className="appcard__body">
                  <span className="appcard__meta mono">
                    <span>{app.kind}</span>
                    <span className="chip" data-current={wearing || undefined} data-token={wearing ? "badge.bg badge.fg" : "chip.bg chip.fg chip.radius"}>
                      {wearing ? t.apps.wearing : app.badge}
                    </span>
                  </span>
                  <h2 className="appcard__name">
                    {app.name}
                    {app.koName && <span className="card__koname"> {app.koName}</span>}
                  </h2>
                  <p className="appcard__line">{app.line}</p>
                  <dl className="spec mono appcard__spec">
                    <dt>{t.apps.platform}</dt>
                    <dd>{platform}</dd>
                    <dt>{t.apps.status}</dt>
                    <dd>{status}</dd>
                  </dl>
                  <div className="appcard__foot">
                    {preset && (
                      <span className="appcard__dots" role="img" aria-label={t.apps.colors(app.name)}>
                        {preset.swatches.map((s) => (
                          <i key={s.hex} style={{ background: s.hex }} title={`${s.label} ${s.hex}`} />
                        ))}
                      </span>
                    )}
                    <span className="appcard__arrow mono" aria-hidden="true">
                      /apps/{slug} →
                    </span>
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
