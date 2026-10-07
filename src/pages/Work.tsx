// 작업 색인. v4(portfolio.brainchild.kr) 의 작업 56건을 표지와 메타로 세우고, 그 뒤에 2019 이전 작업 23건(works.early.ts)을 잇는다.
// 항목을 열면 이 사이트의 작업 상세(/work/<slug>)로 간다. 상세에서 사례·캔버스·라이브로 갈린다. 이전 작업은 v4 에 상세가 없어 표지 이미지가 열린다.
import { useState } from "react";
import { SectionLabel } from "../components/Annot.tsx";
import { useLang } from "../i18n/useLang.ts";
import { internalClick } from "../router.ts";
import { WORKS, WORK_CATEGORIES, type WorkCategory } from "../works.ts";
import { EARLY_WORKS } from "../works.early.ts";

export function Work({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const [cat, setCat] = useState<WorkCategory | "all">("all");
  const onClick = internalClick(go);
  const W = t.work;
  // 실제로 있는 분류만 필터로 세운다. 필터는 이전 작업에도 같이 걸린다
  const all = [...WORKS, ...EARLY_WORKS];
  const present = WORK_CATEGORIES.filter((c) => all.some((w) => w.category === c));
  const shown = cat === "all" ? WORKS : WORKS.filter((w) => w.category === cat);
  const shownEarly = cat === "all" ? EARLY_WORKS : EARLY_WORKS.filter((w) => w.category === cat);
  return (
    <section className="container work">
      <SectionLabel index="v4" title={t.sections.work} aside={<>{W.aside(all.length)}</>} />
      <h1 className="h1">{W.title}</h1>
      <p className="lede">{W.lede}</p>
      <div className="wkfilters" role="group" aria-label={W.filter}>
        <button type="button" className="wkfilter" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
          {W.all} <span className="mono">{all.length}</span>
        </button>
        {present.map((c) => (
          <button key={c} type="button" className="wkfilter" aria-pressed={cat === c} onClick={() => setCat(c)}>
            {W.categories[c]} <span className="mono">{all.filter((w) => w.category === c).length}</span>
          </button>
        ))}
        <span className="mono wkfilters__count" aria-live="polite">
          {W.count(shown.length + shownEarly.length)}
        </span>
      </div>
      <ul className="wk-grid" role="list">
        {shown.map((w, i) => {
          const open = { href: `/work/${w.slug}`, onClick };
          return (
          <li key={w.slug} id={w.slug} className="wk" data-token="card.bg card.line card.radius">
            <a className="wk__cover" {...open} aria-label={w.name}>
              {w.noCover ? (
                <span className="wk__cover-empty mono" aria-hidden="true">
                  {W.noCover}
                </span>
              ) : (
                <img src={`/work/${w.slug}.webp`} alt="" loading={i < 6 ? "eager" : "lazy"} decoding="async" />
              )}
            </a>
            <div className="wk__body">
              <span className="mono wk__meta">
                {w.year} · {W.categories[w.category]}
                {w.client ? ` · ${w.client}` : ""}
              </span>
              <a className="wk__name" {...open}>
                {w.name} <span aria-hidden="true">→</span>
              </a>
              {w.tagline[lang] && <p className="wk__tag">{w.tagline[lang]}</p>}
              {w.caseSlug && (
                <a className="wk__case" href={`/cases/${w.caseSlug}`} onClick={onClick}>
                  {W.caseLink} →
                </a>
              )}
            </div>
          </li>
          );
        })}
      </ul>
      {shownEarly.length > 0 && (
        <div className="wk-early">
          <h2 className="h2">{W.earlyTitle}</h2>
          <p className="wk__tag">{W.earlyNote}</p>
          <ul className="wk-grid" role="list">
            {shownEarly.map((w) => (
              <li key={w.slug} id={w.slug} className="wk" data-token="card.bg card.line card.radius">
                <a className="wk__cover" href={`/work/early/${w.slug}.webp`} target="_blank" rel="noreferrer" aria-label={`${w.name[lang]} · ${W.openImage}`}>
                  <img src={`/work/early/${w.slug}.webp`} alt="" loading="lazy" decoding="async" />
                </a>
                <div className="wk__body">
                  <span className="mono wk__meta">
                    {w.year} · {W.categories[w.category]}
                    {w.client ? ` · ${w.client[lang]}` : ""}
                  </span>
                  <span className="wk__name">{w.name[lang]}</span>
                  {w.tagline[lang] && <p className="wk__tag">{w.tagline[lang]}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
