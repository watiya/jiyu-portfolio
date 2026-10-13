// 재미요소 목록 (/tools). 도구 넷과 원칙 세 줄
import { useLang } from "../i18n/useLang.ts";
import { useReveal } from "../hooks.ts";
import { SectionLabel } from "../components/Annot.tsx";
import { ToolCards } from "./tools/Shell.tsx";

export function Tools({ go }: { go: (href: string) => void }) {
  const { t } = useLang();
  const T = t.toolsPage;
  const ref = useReveal<HTMLElement>();
  return (
    <section className="toolsidx container reveal" ref={ref} aria-labelledby="tools-title">
      <SectionLabel index="01" title={T.title} aside={<>{t.front.fun.aside}</>} />
      <div className="section__head">
        <h1 id="tools-title" className="h1">
          {T.title}
        </h1>
        <p className="lede">{T.lede}</p>
      </div>
      <ToolCards go={go} />
      <ol className="fx__principles mono" role="list">
        {T.principles.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ol>
    </section>
  );
}
