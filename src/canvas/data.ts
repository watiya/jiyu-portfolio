// 캔버스 데이터. 프레임 목록(scripts/canvas-manifest.ts 가 만든 frames/<slug>.json)과 v4 문안(copy/<slug>.json)을 작업을 열 때 합친다.
// 색인(index.json)만 번들에 들어가고 나머지는 그 작업을 열 때 가져온다. 1,670장의 목록을 모든 화면이 들고 다닐 이유가 없다.
import type { Lang } from "../i18n/lang.ts";
import index from "../content/canvas/index.json" with { type: "json" };

export type Text = Record<Lang, string>;

export type CanvasFrame = {
  /** 문안과 흐름이 가리키는 이름. 슬러그 아래 경로에서 확장자를 뗀 것 */
  id: string;
  /** public 경로 */
  src: string;
  /** 파일 이름에서 뽑은 이름표. 문안이 없을 때 그대로 보인다 */
  label: string;
  w: number;
  h: number;
  title?: Text;
  desc?: Text;
};

export type CanvasPage = {
  /** 하위 폴더 이름. 폴더를 안 쓴 작업은 빈 문자열 */
  key: string;
  label: string;
  title?: Text;
  frames: CanvasFrame[];
};

/** 화면에서 화면으로 가는 선. 같은 페이지 안의 프레임 둘만 잇는다 */
export type Edge = [string, string];

export type CanvasDoc = { pages: CanvasPage[]; flow: Edge[] };

type FramesJson = { pages: { key: string; label: string; frames: Omit<CanvasFrame, "title" | "desc">[] }[] };
type CopyJson = { pages?: Record<string, Text>; frames?: Record<string, { title?: Text; desc?: Text }>; flow?: Edge[] };

/** 캔버스가 있는 작업과 그 장수 */
export const CANVAS_COUNT: Record<string, number> = index;
export const hasCanvas = (slug: string) => Object.hasOwn(CANVAS_COUNT, slug);

const FRAMES = import.meta.glob("../content/canvas/frames/*.json", { import: "default" }) as Record<string, () => Promise<FramesJson>>;
const COPY = import.meta.glob("../content/canvas/copy/*.json", { import: "default" }) as Record<string, () => Promise<CopyJson>>;

const pick = <T>(map: Record<string, () => Promise<T>>, slug: string) => Object.entries(map).find(([p]) => p.endsWith(`/${slug}.json`))?.[1];

export async function loadCanvas(slug: string): Promise<CanvasDoc | null> {
  const frames = pick(FRAMES, slug);
  if (!frames) return null;
  const [doc, copy] = await Promise.all([frames(), pick(COPY, slug)?.() ?? Promise.resolve<CopyJson>({})]);
  const pages: CanvasPage[] = doc.pages.map((p) => ({ ...p, title: copy.pages?.[p.key], frames: p.frames.map((f) => ({ ...f, ...(copy.frames?.[f.id] ?? {}) })) }));
  return { pages, flow: copy.flow ?? [] };
}

/** 한 페이지 안의 선. 끝이 둘 다 그 페이지에 있는 것만 남긴다. 없는 이름은 선이 안 그려지는 것으로 드러난다 */
export function flowOf(doc: CanvasDoc, pageKey: string): Edge[] {
  const ids = new Set((doc.pages.find((p) => p.key === pageKey)?.frames ?? []).map((f) => f.id));
  return doc.flow.filter(([a, b]) => ids.has(a) && ids.has(b));
}
