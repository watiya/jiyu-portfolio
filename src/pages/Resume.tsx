// 이력서. 원고는 content/resume/<lang>.md 하나뿐이고, 인쇄하면 A4 PDF 가 된다(index.css 의 @media print).
// 본명이 든 지원용 PDF 는 `pnpm resume:pdf` 로 로컬에서만 뽑는다.
import type { MouseEvent } from "react";
import { SectionLabel } from "../components/Annot.tsx";
import { useLang } from "../i18n/useLang.ts";
import { renderResume } from "../resume/render.ts";
import ko from "../content/resume/ko.md?raw";
import en from "../content/resume/en.md?raw";

// 원고는 바뀌지 않으므로 모듈이 처음 불릴 때 한 번만 렌더한다
const HTML = { ko: renderResume(ko, "content/resume/ko.md"), en: renderResume(en, "content/resume/en.md") };

export function Resume({ go }: { go: (href: string) => void }) {
  const { lang, t } = useLang();
  // 본문 HTML 안의 내부 링크도 라우터로 보낸다
  const proseClick = (e: MouseEvent<HTMLElement>) => {
    const href = (e.target as HTMLElement).closest("a")?.getAttribute("href");
    if (!href?.startsWith("/") || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(href);
  };
  return (
    <article className="container resume">
      <SectionLabel
        index="cv"
        title={t.nav.resume}
        aside={
          <button type="button" className="resume__print mono" onClick={() => window.print()}>
            {t.resume.print}
          </button>
        }
      />
      <div className="prose resume__doc" dangerouslySetInnerHTML={{ __html: HTML[lang] }} onClick={proseClick} />
    </article>
  );
}
