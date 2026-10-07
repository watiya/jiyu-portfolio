// 캔버스 프레임 목록. public/canvas/<slug>/(<page>/)<file>.webp 를 훑어 작업마다 src/content/canvas/frames/<slug>.json 을 쓴다.
// 이미지를 넣는 것으로 끝나는 v4 의 규약을 지키되, 1,600장을 번들에 글롭으로 묶지 않고 public 에서 지연 로딩한다.
// 그래서 치수를 여기서 미리 읽는다. 치수를 알아야 그림이 오기 전에 자리가 서고, 자리가 서야 흐름 선이 한 번 재서 맞는다.
//   node scripts/canvas-manifest.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "./prerender-meta.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "public/canvas");
const OUT = join(ROOT, "src/content/canvas");
const IMAGE = /\.(webp|png|jpe?g|avif)$/i;

export type FrameEntry = { id: string; src: string; label: string; w: number; h: number };
export type PageEntry = { key: string; label: string; frames: FrameEntry[] };
export type FramesDoc = { pages: PageEntry[] };

/** `01-top-up.webp` 를 `Top Up` 으로 읽는다. 앞자리 숫자는 순서지 이름이 아니다. 번호뿐인 파일은 번호를 그대로 쓴다 */
export function labelOf(name: string): string {
  const stem = name.replace(/\.\w+$/, "");
  const named = stem.replace(/^\d+[-_]?/, "");
  return (named || stem)
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const images = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => IMAGE.test(f) && statSync(join(dir, f)).isFile()).sort() : []);
const folders = (dir: string) => readdirSync(dir).filter((f) => !f.startsWith(".") && statSync(join(dir, f)).isDirectory()).sort();

/** 한 작업의 페이지 목록. 하위 폴더가 있으면 폴더가 페이지고, 없으면 루트 파일이 한 페이지다. 둘이 섞이면 폴더만 본다 */
export function readFrames(slug: string): FramesDoc {
  const base = join(ASSETS, slug);
  const frame = (page: string, file: string): FrameEntry => {
    const size = imageSize(readFileSync(join(base, page, file)));
    if (!size) throw new Error(`canvas-manifest: 치수를 못 읽었다: ${slug}/${page}/${file}`);
    const id = `${page ? `${page}/` : ""}${file.replace(/\.\w+$/, "")}`;
    return { id, src: `/canvas/${slug}/${page ? `${page}/` : ""}${file}`, label: labelOf(file), w: size.width, h: size.height };
  };
  const pageDirs = folders(base);
  if (pageDirs.length > 0) {
    if (images(base).length > 0) console.warn(`canvas-manifest: ${slug} 는 루트 파일과 폴더가 섞여 있다. 폴더만 쓴다`);
    return { pages: pageDirs.map((key) => ({ key, label: labelOf(key), frames: images(join(base, key)).map((f) => frame(key, f)) })).filter((p) => p.frames.length > 0) };
  }
  return { pages: [{ key: "", label: "", frames: images(base).map((f) => frame("", f)) }] };
}

function main() {
  const framesDir = join(OUT, "frames");
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });
  const index: Record<string, number> = {};
  let total = 0;
  for (const slug of folders(ASSETS)) {
    const doc = readFrames(slug);
    const count = doc.pages.reduce((n, p) => n + p.frames.length, 0);
    if (count === 0) continue;
    index[slug] = count;
    total += count;
    writeFileSync(join(framesDir, `${slug}.json`), JSON.stringify(doc));

    // 문안이 가리키는 프레임·페이지가 실제로 있는지 본다. 없으면 그 문안은 화면에 안 나오므로 여기서 알린다
    const copyFile = join(OUT, "copy", `${slug}.json`);
    if (!existsSync(copyFile)) continue;
    const copy = JSON.parse(readFileSync(copyFile, "utf8")) as { pages?: Record<string, unknown>; frames?: Record<string, unknown>; flow?: [string, string][] };
    const ids = new Set(doc.pages.flatMap((p) => p.frames.map((f) => f.id)));
    const keys = new Set(doc.pages.map((p) => p.key));
    for (const k of Object.keys(copy.pages ?? {})) if (!keys.has(k)) console.warn(`canvas-manifest: ${slug} 문안의 페이지 ${k} 에 폴더가 없다`);
    for (const k of Object.keys(copy.frames ?? {})) if (!ids.has(k)) console.warn(`canvas-manifest: ${slug} 문안의 프레임 ${k} 에 파일이 없다`);
    for (const [a, b] of copy.flow ?? []) if (!ids.has(a) || !ids.has(b)) console.warn(`canvas-manifest: ${slug} 흐름 ${a} → ${b} 의 끝이 없다`);
  }
  writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`canvas-manifest: ${Object.keys(index).length} works, ${total} frames`);
}

if (import.meta.main) main();
