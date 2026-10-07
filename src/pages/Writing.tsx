import { SectionLabel } from "../components/Annot.tsx";
import { useLang } from "../i18n/useLang.ts";
import { getWriting } from "../i18n/content.ts";
import { internalClick } from "../router.ts";

export function Writing({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const rows = getWriting(lang);
  const onClick = internalClick(go);
  return (
    <section className="container writing">
      <SectionLabel index="03" title={t.sections.writing} aside={<>{t.writing.aside(rows.length)}</>} />
      <h1 className="h1">{t.writing.title}</h1>
      <ul className="rows" role="list">
        {rows.map((w) => (
          <li key={w.slug} className="row">
            <a className="row__title" href={`/cases/${w.slug}`} onClick={onClick}>
              {w.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
