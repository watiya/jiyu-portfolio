// 사례 문서 파서. 프론트매터(부분집합)와 본문을 CaseDoc 으로 만든다.
// 번들러 API 를 쓰지 않아 node 테스트가 같은 코드를 돌린다. 글롭은 content.ts 가 맡는다.
import { renderMarkdown } from "./markdown.ts";
import facts from "../content/cases/facts.json" with { type: "json" };

export type Metric =
  | { kind: "number"; label: string; value: number }
  | { kind: "breakdown"; label: string; total: number; items: Array<{ key: string; value: number }> };

export type CaseDoc = {
  slug: string;
  order: number;
  tag: string;
  title: string;
  role: string;
  summary: string;
  metrics: Metric[];
  /** 실제 화면. src 는 /cases/<slug>/<id>.webp */
  image?: { src: string; caption: string };
  /** 설명 도해의 id. 파일은 figures/<id>-<lang>.svg 와 -narrow. 내용은 화면이 열릴 때 따로 불러온다(번들 분리) */
  figure?: { id: string; caption: string };
  html: string;
};

/* ── 지표 ─────────────────────────────────────────────
   수치는 문서에 적히지 않는다. 문서는 facts.json 의 경로만 갖고 값은 여기서 꽂는다 */

function resolve(dotted: string, where: string): unknown {
  const found = dotted.split(".").reduce<unknown>((node, key) => (node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined), facts);
  if (found === undefined) throw new Error(`${where}: facts.json 에 '${dotted}' 경로가 없다`);
  return found;
}

function toMetric(dotted: string, label: string, where: string): Metric {
  const value = resolve(dotted, where);
  if (typeof value === "number") return { kind: "number", label, value };
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const items = Object.entries(value as Record<string, unknown>)
      .filter((e): e is [string, number] => typeof e[1] === "number")
      .map(([key, v]) => ({ key, value: v }))
      .sort((a, b) => b.value - a.value);
    if (items.length === 0) throw new Error(`${where}: '${dotted}' 아래에 셀 수 있는 값이 없다`);
    return { kind: "breakdown", label, total: items.reduce((s, i) => s + i.value, 0), items };
  }
  throw new Error(`${where}: '${dotted}' 는 지표로 쓸 수 없는 형태다`);
}

/* ── 프론트매터 ───────────────────────────────────────
   YAML 전체가 아니라 이 문서들이 쓰는 부분집합만 읽는다. 스칼라, 그리고 `metrics` 아래의 객체 리스트 */

type RawFront = Record<string, string | Array<Record<string, string>>>;

export function parseFrontMatter(raw: string, where: string): [RawFront, string] {
  if (!raw.startsWith("---\n")) throw new Error(`${where}: 프론트매터가 없다`);
  const end = raw.indexOf("\n---", 3);
  if (end === -1) throw new Error(`${where}: 프론트매터가 닫히지 않았다`);
  const head = raw.slice(4, end);
  const body = raw.slice(end + 4).replace(/^\n+/, "");

  const front: RawFront = {};
  let listKey: string | null = null;
  let current: Record<string, string> | null = null;

  for (const [i, line] of head.split("\n").entries()) {
    if (line.trim() === "") continue;
    const indented = /^\s+/.test(line);
    const item = /^\s+-\s+([a-zA-Z]+):\s*(.*)$/.exec(line);
    const nested = /^\s+([a-zA-Z]+):\s*(.*)$/.exec(line);
    const scalar = /^([a-zA-Z]+):\s*(.*)$/.exec(line);
    if (item && listKey) {
      current = { [item[1]]: item[2].trim() };
      (front[listKey] as Array<Record<string, string>>).push(current);
    } else if (indented && nested && current) {
      current[nested[1]] = nested[2].trim();
    } else if (!indented && scalar) {
      const [, key, value] = scalar;
      if (value.trim() === "") {
        listKey = key;
        current = null;
        front[key] = [];
      } else {
        listKey = null;
        current = null;
        front[key] = value.trim();
      }
    } else {
      throw new Error(`${where}: 프론트매터 ${i + 1}행을 읽을 수 없다\n  ${line}`);
    }
  }
  return [front, body];
}

const text = (front: RawFront, key: string, where: string) => {
  const v = front[key];
  if (typeof v !== "string" || v === "") throw new Error(`${where}: 프론트매터에 '${key}' 가 없다`);
  return v;
};

/** 도해 파일이 있는지. 키는 `<figureId>-<lang>` */
export type HasFigure = (key: string) => boolean;

export function buildCase(raw: string, lang: string, where: string, hasFigure: HasFigure, hasImage: (slug: string, id: string) => boolean): CaseDoc {
  const [front, body] = parseFrontMatter(raw, where);
  const slug = text(front, "slug", where);
  const rawMetrics = Array.isArray(front.metrics) ? front.metrics : [];

  let image: CaseDoc["image"];
  const imageId = typeof front.image === "string" ? front.image : null;
  if (imageId) {
    if (!hasImage(slug, imageId)) throw new Error(`${where}: image '${imageId}' 의 파일이 없다 (public/cases/${slug}/${imageId}.webp)`);
    image = { src: `/cases/${slug}/${imageId}.webp`, caption: text(front, "imageCaption", where) };
  }

  let figure: CaseDoc["figure"];
  const figureId = typeof front.figure === "string" ? front.figure : null;
  if (figureId) {
    if (!hasFigure(`${figureId}-${lang}`)) throw new Error(`${where}: figure '${figureId}' 의 ${lang} 파일이 없다`);
    figure = { id: figureId, caption: text(front, "figureCaption", where) };
  }

  return {
    slug,
    order: Number(text(front, "order", where)),
    tag: text(front, "tag", where),
    title: text(front, "title", where),
    role: text(front, "role", where),
    summary: text(front, "summary", where),
    metrics: rawMetrics.map((m) => toMetric(m.path, m.label, where)),
    image,
    figure,
    html: renderMarkdown(body, where),
  };
}

/** 글롭 결과(경로 → 내용)를 파일명 기준으로 슬러그 맵으로 만든다 */
export function byBasename<T>(entries: Record<string, T>): Record<string, T> {
  const map: Record<string, T> = {};
  for (const [path, value] of Object.entries(entries)) map[path.slice(path.lastIndexOf("/") + 1).replace(/\.\w+$/, "")] = value;
  return map;
}
