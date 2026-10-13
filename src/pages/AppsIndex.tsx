// 앱 전체 목록(/apps). /work 와 같은 머리말·거르기·격자(wk-grid)·카드(wk) 리듬으로 선 독립 페이지다.
// 홈 #apps 는 featured 만 세우는 토큰 쇼케이스이고, 여기는 숨김이 아닌 앱 전부. 카드는 상세(/apps/<slug>)로 간다.
// 표지만 /work 와 다르다: 표지 사진 대신 그 앱 화면 세 장이 폰째로 바닥에서 올라온다.
import { useState } from "react";
import { SectionLabel } from "../components/Annot.tsx";
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
    <section className="container work appsidx">
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
          <span className="mono wkfilters__count" aria-live="polite">
            {P.count(shown.length)}
          </span>
        </div>
      )}

      <ul className="wk-grid" role="list">
        {shown.map((app, i) => {
          const slug = slugOf(app.name);
          const href = `/apps/${slug}`;
          const detail = details.find((d) => d.slug === slug);
          const preset = PRESETS.find((p) => p.slug === slug);
          const status = (detail && metaValue(detail, "Status")) ?? app.badge;
          const platform = (detail && metaValue(detail, "Platform")) ?? app.note;
          const wearing = active?.slug === slug;
          const n = apps.indexOf(app) + 1;
          // 가운데는 카드 화면, 양옆은 상세 화면 둘째·셋째 장(첫 장은 대개 카드 화면과 같다). 세로로 긴 캡처만
          const sides = (detail?.shots ?? []).slice(1, 3);
          const phones = sides.length === 2 ? [sides[0], app.image, sides[1]] : [app.image];
          return (
            <li key={slug} className="wk apptile" data-token="card.bg card.line card.radius">
              <a className="wk__cover apptile__cover" href={href} onClick={onClick} aria-label={app.name} data-token="surface.sunken radius.2">
                <span className="apptile__no mono" aria-hidden="true">
                  {String(n).padStart(2, "0")}
                </span>
                {app.series && <span className="apptile__series mono">{P.series[app.series]}</span>}
                <span className="apptile__phones" data-count={phones.length}>
                  {phones.map((src, k) => (
                    <PhoneFrame key={src} src={src} alt={k === (phones.length - 1) / 2 ? t.apps.screen(app.name) : ""} width={120} priority={i < 3} />
                  ))}
                </span>
              </a>
              <div className="wk__body">
                <span className="mono wk__meta">
                  {app.kind} · {platform}
                  {markHome && app.featured && <span className="apptile__home"> · {P.home}</span>}
                </span>
                <a className="wk__name" href={href} onClick={onClick}>
                  {app.name}
                  {app.koName && <span className="card__koname"> {app.koName}</span>} <span aria-hidden="true">→</span>
                </a>
                <p className="wk__tag">{app.line}</p>
                <div className="apptile__foot">
                  {preset && (
                    <span className="apptile__dots" role="img" aria-label={t.apps.colors(app.name)}>
                      {preset.swatches.map((s) => (
                        <i key={s.hex} style={{ background: s.hex }} title={`${s.label} ${s.hex}`} />
                      ))}
                    </span>
                  )}
                  <span className="apptile__status mono" title={status}>
                    {status}
                  </span>
                  <span className="chip" data-current={wearing || undefined} data-token={wearing ? "badge.bg badge.fg" : "chip.bg chip.fg chip.radius"}>
                    {wearing ? t.apps.wearing : app.badge}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
