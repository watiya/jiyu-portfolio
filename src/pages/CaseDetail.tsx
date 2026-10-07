// 사례 상세: 스펙 시트. 왼쪽 고정 메타(영역·역할·수치), 오른쪽 본문(제목·요약·화면·글·도해).
// 본문은 내가 쓴 마크다운을 우리 파서가 통과시킨 HTML 이다. 미지원 문법은 파서가 이미 던졌다.
import { useEffect, useState, type MouseEvent } from "react";
import { useLang } from "../i18n/useLang.ts";
import { getCases, loadFigure, type Figure, type Metric } from "../cases/content.ts";
import type { Lang } from "../i18n/lang.ts";
import { internalClick } from "../router.ts";
import { inline } from "../cases/markdown.ts";
import facts from "../content/cases/facts.json" with { type: "json" };
import { SectionLabel } from "../components/Annot.tsx";
import { NotFound } from "./AppDetail.tsx";

const pad = (n: number) => String(n).padStart(2, "0");

function MetricList({ metrics }: { metrics: Metric[] }) {
  return (
    <ul className="metrics" role="list">
      {metrics.map((m) => (
        <li key={m.label} className="metric">
          <span className="mono metric__label">{m.label}</span>
          <span className="metric__value">{(m.kind === "number" ? m.value : m.total).toLocaleString()}</span>
          {m.kind === "breakdown" && (
            <ul className="metric__items mono" role="list">
              {m.items.map((it) => (
                <li key={it.key}>
                  <span>{it.key}</span>
                  <span>{it.value.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

// 도해는 상세가 열릴 때 그 사례 것만 불러온다. 언어가 바뀌면 같은 id 의 다른 언어 판을 다시 가져온다
function CaseFigure({ id, caption, lang, label }: { id: string; caption: string; lang: Lang; label: string }) {
  const [fig, setFig] = useState<(Figure & { key: string }) | null>(null);
  const key = `${id}-${lang}`;
  useEffect(() => {
    let live = true;
    loadFigure(id, lang).then((f) => live && setFig({ ...f, key }));
    return () => {
      live = false;
    };
  }, [id, lang, key]);
  const ready = fig && fig.key === key ? fig : null;
  return (
    <figure className="casefig" aria-label={label}>
      <div className="casefig__box" data-token="card.bg card.line" aria-busy={!ready}>
        {ready &&
          (ready.svgNarrow ? (
            <>
              <div className="casefig__wide" dangerouslySetInnerHTML={{ __html: ready.svg }} />
              <div className="casefig__narrow" dangerouslySetInnerHTML={{ __html: ready.svgNarrow }} />
            </>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: ready.svg }} />
          ))}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function CaseDetail({ slug, go }: { slug: string; go: (href: string) => void }) {
  const { lang, t } = useLang();
  const docs = getCases(lang);
  const i = docs.findIndex((d) => d.slug === slug);
  const onClick = internalClick(go);
  // 본문 HTML 안의 내부 링크도 라우터로 보낸다
  const proseClick = (e: MouseEvent<HTMLElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!href?.startsWith("/") || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(href);
  };
  if (i === -1) return <NotFound path={`/cases/${slug}`} go={go} />;
  const doc = docs[i];
  const prev = docs[(i + docs.length - 1) % docs.length];
  const next = docs[(i + 1) % docs.length];
  const C = t.cases;

  return (
    <article className="detail casedoc container">
      <SectionLabel
        index={pad(doc.order)}
        title={`${C.caseLabel} · ${doc.tag}`}
        aside={
          <a href="/cases" onClick={onClick} className="seclabel__link">
            ← {C.back}
          </a>
        }
      />
      <div className="detail__grid">
        <aside className="detail__meta" aria-label={t.detail.spec}>
          <dl className="spec mono">
            <div className="spec__row">
              <dt>{C.tag}</dt>
              <dd>{doc.tag}</dd>
            </div>
            <div className="spec__row">
              <dt>{C.role}</dt>
              <dd>{doc.role}</dd>
            </div>
          </dl>
          {doc.metrics.length > 0 && (
            <section className="casedoc__metrics" aria-label={C.inThisCase}>
              <h2 className="mono casedoc__metrics-title">{C.inThisCase}</h2>
              <MetricList metrics={doc.metrics} />
              <p className="mono metrics__basis">{C.metricsBasis(facts.window.first, facts.window.last, facts.totals.repos)}</p>
            </section>
          )}
        </aside>
        <div className="detail__body">
          <h1 className="h1">{doc.title}</h1>
          <p className="lede">{doc.summary}</p>
          {doc.image && (
            <figure className="caseimg" data-token="line.default radius.2">
              <img src={doc.image.src} alt="" width={1440} loading="eager" decoding="async" />
              <figcaption dangerouslySetInnerHTML={{ __html: inline(doc.image.caption) }} onClick={proseClick} />
            </figure>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} onClick={proseClick} />
          {doc.figure && <CaseFigure id={doc.figure.id} caption={doc.figure.caption} lang={lang} label={C.figure} />}
        </div>
      </div>
      <nav className="detail__nav" aria-label={C.back}>
        <a href={`/cases/${prev.slug}`} onClick={onClick}>
          ← {pad(prev.order)} {prev.title}
        </a>
        <a href="/cases" onClick={onClick}>
          {C.back}
        </a>
        <a href={`/cases/${next.slug}`} onClick={onClick}>
          {pad(next.order)} {next.title} →
        </a>
      </nav>
    </article>
  );
}
