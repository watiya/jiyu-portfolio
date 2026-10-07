// 사례 목록. 아홉 편 모두 이 사이트 안(/cases/:slug)으로 간다. 표지는 작업 색인과 같은 파일을 쓴다.
import { SectionLabel } from "../components/Annot.tsx";
import { useLang } from "../i18n/useLang.ts";
import { getCases } from "../cases/content.ts";
import { internalClick } from "../router.ts";

export function Cases({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const docs = getCases(lang);
  const onClick = internalClick(go);
  return (
    <section className="container cases">
      <SectionLabel index="04" title={t.sections.cases} aside={<>{t.cases.pageAside(docs.length)}</>} />
      <h1 className="h1">{t.cases.title}</h1>
      <p className="lede">{t.cases.pageLede}</p>
      <ol className="cases__list" role="list">
        {docs.map((d, i) => (
          <li key={d.slug} className="case" data-token="card.bg card.line card.radius">
            <a className="case__img" href={`/cases/${d.slug}`} onClick={onClick} aria-hidden="true" tabIndex={-1}>
              <img src={`/work/${d.slug}.webp`} alt="" width={1600} height={900} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
            </a>
            <div className="case__body">
              <span className="mono case__idx">
                {t.cases.caseLabel} {String(d.order).padStart(2, "0")} · {d.tag}
              </span>
              <a className="case__title h3" href={`/cases/${d.slug}`} onClick={onClick}>
                {d.title}
              </a>
              <p className="case__sub">{d.summary}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="cases__more">
        <a href="/work" onClick={onClick}>
          {t.cases.moreOnWork} →
        </a>
      </p>
    </section>
  );
}
