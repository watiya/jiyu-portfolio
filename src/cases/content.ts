// 사례 문서 로더. 번들러가 md 를 걷고(?raw), 파싱은 모듈이 처음 불릴 때 한 번 일어난다.
// 도해 SVG(36개, 250KB)는 본 번들에 넣지 않고 상세가 열릴 때 그 사례 것만 불러온다.
// 공개 이미지(public/cases)는 글롭으로 걷히지 않으므로 목록을 여기 적어 둔다. 테스트가 디스크와 대조한다.
import { buildCase, byBasename, type CaseDoc } from "./parse.ts";
import type { Lang } from "../i18n/lang.ts";

export const CASE_IMAGES: Record<string, string[]> = {
  "entry-without-a-wallet": ["genesis-entry"],
  "design-system-in-code": ["design-system-tokens"],
  "exposure-as-a-build": ["valuation-entry"],
  starground: ["picks"],
};
export const hasCaseImage = (slug: string, id: string) => CASE_IMAGES[slug]?.includes(id) ?? false;

const FIGURE_LOADERS = byBasename(import.meta.glob("../content/cases/figures/*.svg", { import: "default", query: "?raw" }) as Record<string, () => Promise<string>>);
const hasFigure = (key: string) => key in FIGURE_LOADERS;

export type Figure = { svg: string; svgNarrow?: string };
export async function loadFigure(id: string, lang: Lang): Promise<Figure> {
  const wide = FIGURE_LOADERS[`${id}-${lang}`];
  const narrow = FIGURE_LOADERS[`${id}-${lang}-narrow`];
  if (!wide) throw new Error(`figure '${id}' 의 ${lang} 파일이 없다`);
  const [svg, svgNarrow] = await Promise.all([wide(), narrow ? narrow() : Promise.resolve(undefined)]);
  return { svg, svgNarrow };
}

const SOURCES: Record<Lang, Record<string, string>> = {
  ko: import.meta.glob("../content/cases/ko/*.md", { eager: true, import: "default", query: "?raw" }) as Record<string, string>,
  en: import.meta.glob("../content/cases/en/*.md", { eager: true, import: "default", query: "?raw" }) as Record<string, string>,
};

function readCases(lang: Lang): CaseDoc[] {
  return Object.entries(SOURCES[lang])
    .map(([path, raw]) => buildCase(raw, lang, `content/cases/${lang}/${path.slice(path.lastIndexOf("/") + 1)}`, hasFigure, hasCaseImage))
    .sort((a, b) => a.order - b.order);
}

// 문서는 바뀌지 않으므로 언어마다 한 번만 읽는다
const CASES: Record<Lang, CaseDoc[]> = { ko: readCases("ko"), en: readCases("en") };

export const getCases = (lang: Lang) => CASES[lang];
export const getCase = (lang: Lang, slug: string) => CASES[lang].find((d) => d.slug === slug);
export type { CaseDoc, Metric } from "./parse.ts";
