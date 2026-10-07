// 캔버스 색인·프레임 목록·문안이 서로 맞는지. 이미지 경로는 전부 public/canvas 의 실제 파일이어야 한다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WORKS } from "../works.ts";
import index from "../content/canvas/index.json" with { type: "json" };

const ROOT = new URL("../..", import.meta.url).pathname;
const CONTENT = join(ROOT, "src/content/canvas");
type Frame = { id: string; src: string; label: string; w: number; h: number };
type Doc = { pages: { key: string; label: string; frames: Frame[] }[] };
type Copy = { pages?: Record<string, { ko: string; en: string }>; frames?: Record<string, { title?: { ko: string; en: string }; desc?: { ko: string; en: string } }>; flow?: [string, string][] };

const slugs = Object.keys(index);
const docs = new Map(slugs.map((s) => [s, JSON.parse(readFileSync(join(CONTENT, "frames", `${s}.json`), "utf8")) as Doc]));

test("색인: 캔버스 49, 전부 works.ts 의 작업이고 장수가 프레임 목록과 같다", () => {
  assert.equal(slugs.length, 49);
  for (const s of slugs) {
    assert.ok(WORKS.some((w) => w.slug === s), `작업 목록에 없는 캔버스 ${s}`);
    const n = docs.get(s)!.pages.reduce((a, p) => a + p.frames.length, 0);
    assert.equal(n, (index as Record<string, number>)[s], s);
  }
  assert.equal(slugs.reduce((a, s) => a + (index as Record<string, number>)[s], 0), 1664);
});

test("프레임: 경로는 실제 파일, 치수는 양수, id 는 페이지 안에서 고유", () => {
  let missing = 0;
  for (const [s, doc] of docs) {
    for (const p of doc.pages) {
      const ids = new Set<string>();
      for (const f of p.frames) {
        assert.ok(f.src.startsWith(`/canvas/${s}/`), f.src);
        if (!existsSync(join(ROOT, "public", f.src))) missing++;
        assert.ok(f.w > 0 && f.h > 0, f.src);
        assert.ok(!ids.has(f.id), `${s} 중복 ${f.id}`);
        ids.add(f.id);
      }
    }
  }
  assert.equal(missing, 0, `없는 파일 ${missing}`);
  // 디스크의 그림은 전부 목록에 있다
  const listed = new Set([...docs.values()].flatMap((d) => d.pages.flatMap((p) => p.frames.map((f) => f.src))));
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
  const onDisk = walk(join(ROOT, "public/canvas")).filter((f) => /\.(webp|png|jpe?g|avif)$/i.test(f)).map((f) => f.slice(join(ROOT, "public").length));
  assert.equal(onDisk.length, listed.size);
  for (const f of onDisk) assert.ok(listed.has(f), `목록에 없는 파일 ${f}`);
});

test("문안: 흐름의 끝은 실제 프레임, 문안은 두 언어, em dash 없음", () => {
  const dash = String.fromCharCode(0x2014);
  const copies = readdirSync(join(CONTENT, "copy")).filter((f) => f.endsWith(".json"));
  assert.equal(copies.length, 34);
  for (const file of copies) {
    const slug = file.replace(/\.json$/, "");
    const doc = docs.get(slug);
    assert.ok(doc, `캔버스 없는 문안 ${slug}`);
    const raw = readFileSync(join(CONTENT, "copy", file), "utf8");
    assert.ok(!raw.includes(dash), `${slug} em dash`);
    const copy = JSON.parse(raw) as Copy;
    const ids = new Set(doc.pages.flatMap((p) => p.frames.map((f) => f.id)));
    for (const [a, b] of copy.flow ?? []) assert.ok(ids.has(a) && ids.has(b), `${slug} 흐름 ${a} → ${b}`);
    for (const [id, c] of Object.entries(copy.frames ?? {})) {
      assert.ok(ids.has(id), `${slug} 문안의 프레임 ${id}`);
      for (const text of [c.title, c.desc]) if (text) assert.ok(text.ko && text.en, `${slug} ${id} 두 언어`);
    }
    for (const [k, text] of Object.entries(copy.pages ?? {})) assert.ok(text.ko && text.en, `${slug} 페이지 ${k}`);
  }
});
