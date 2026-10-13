// 소개(/about). 무엇인지 한 단락, 화면을 읽는 기준, 앱별 처리방침·지원 모음, 연락.
// 처리방침 주소는 appDetails.ts 의 APP_LINKS 하나에서 읽는다. 앱 상세의 보조 링크와 같은 출처다.
import { EMAIL } from "../data.ts";
import { APP_LINKS } from "../appDetails.ts";
import { getApps } from "../i18n/content.ts";
import { useLang } from "../i18n/useLang.ts";
import { SectionLabel } from "../components/Annot.tsx";

const slugOf = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export function About() {
  const { lang, t } = useLang();
  const A = t.aboutPage;
  const apps = getApps(lang);
  return (
    <>
      <header className="container sysidx">
        <h1 className="h1">{A.title}</h1>
        <p className="lede">{A.lede}</p>
      </header>

      <section className="container about" aria-labelledby="about-read">
        <SectionLabel index="01" title={A.readTitle} />
        <h2 id="about-read" className="sr-only">
          {A.readTitle}
        </h2>
        <dl className="about__read">
          {A.read.map((r) => (
            <div key={r.label} className="about__row">
              <dt className="mono">{r.label}</dt>
              <dd>{r.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container about" aria-labelledby="about-privacy">
        <SectionLabel index="02" title={A.privacyTitle} aside={<>{A.privacyLede}</>} />
        <h2 id="about-privacy" className="sr-only">
          {A.privacyTitle}
        </h2>
        <ul className="about__policies" role="list">
          {apps.map((a) => {
            const links = APP_LINKS[slugOf(a.name)];
            return (
              <li key={a.name} className="about__policy">
                <span className="about__app">{lang === "ko" && a.koName ? a.koName : a.name}</span>
                <span className="about__links">
                  {links?.privacy ? (
                    <a href={links.privacy} target="_blank" rel="noreferrer">
                      {A.privacy} ↗
                    </a>
                  ) : (
                    <span className="mono about__pending">{A.pending}</span>
                  )}
                  {links?.support && (
                    <a href={links.support} target="_blank" rel="noreferrer">
                      {A.support} ↗
                    </a>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container about" aria-labelledby="about-contact">
        <SectionLabel index="03" title={A.contactTitle} />
        <h2 id="about-contact" className="sr-only">
          {A.contactTitle}
        </h2>
        <a className="about__mail" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </section>
    </>
  );
}
