// 앱 전체 목록(/apps). 홈 #apps 와 같은 앱 선반(AppShelf)을 쓰고, 여기만 종류 거르기가 붙는다.
// 거르면 시리즈 묶음 안에서 걸러지고, 빈 묶음은 선반이 알아서 뺀다.
import { useState } from "react";
import { SectionLabel } from "../components/Annot.tsx";
import { AppShelf } from "../components/AppShelf.tsx";
import { useLang } from "../i18n/useLang.ts";
import { getApps } from "../i18n/content.ts";

export function AppsIndex({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  const [kind, setKind] = useState<string>("all");
  const P = t.appsPage;
  const apps = getApps(lang);
  // 종류는 앱 데이터에 실제로 있는 값만, 처음 나온 순서대로. 한 가지뿐이면 거르기를 세우지 않는다
  const kinds = apps.map((a) => a.kind).filter((k, i, all) => all.indexOf(k) === i);
  // 언어를 바꾸면 kind 표기도 바뀐다. 없는 값이면 전체로 본다
  const current = kinds.includes(kind) ? kind : "all";
  const shown = current === "all" ? apps : apps.filter((a) => a.kind === current);

  return (
    <section className="container work appsidx">
      <SectionLabel index="02" title={t.sections.apps} aside={<>{P.aside(apps.length)}</>} />
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

      <AppShelf apps={shown} go={go} level={2} />
    </section>
  );
}
