// 사례 문서가 두 언어 모두 열리고, 가리키는 파일이 디스크에 있는지 확인한다.
// vite build 는 파서를 실행하지 않으므로 잘못된 프론트매터는 여기서 잡는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCase } from "./parse.ts";
import { renderMarkdown } from "./markdown.ts";
import { WORKS } from "../works.ts";

const ROOT = new URL("../..", import.meta.url).pathname;
const CONTENT = join(ROOT, "src/content/cases");
const PUBLIC = join(ROOT, "public");

// content.ts 와 같은 목록. 글롭이 없는 node 에서는 디스크를 직접 읽는다
const CASE_IMAGES: Record<string, string[]> = {
  "entry-without-a-wallet": ["genesis-entry"],
  "design-system-in-code": ["design-system-tokens"],
  "exposure-as-a-build": ["valuation-entry"],
};

const figures: Record<string, string> = Object.fromEntries(readdirSync(join(CONTENT, "figures")).map((f) => [f.replace(/\.svg$/, ""), readFileSync(join(CONTENT, "figures", f), "utf8")]));

function read(lang: "ko" | "en") {
  const dir = join(CONTENT, lang);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => buildCase(readFileSync(join(dir, f), "utf8"), lang, `${lang}/${f}`, (key) => key in figures, (slug, id) => CASE_IMAGES[slug]?.includes(id) ?? false))
    .sort((a, b) => a.order - b.order);
}

const ko = read("ko");
const en = read("en");

test("사례 10편, ko 와 en 의 슬러그·순서가 같다", () => {
  assert.equal(ko.length, 10);
  assert.equal(en.length, 10);
  assert.deepEqual(
    ko.map((d) => d.slug),
    en.map((d) => d.slug),
  );
  assert.deepEqual(
    ko.map((d) => d.order),
    Array.from({ length: 10 }, (_, i) => i + 1),
  );
});

test("모든 사례에 제목·역할·요약·본문·도해(넓은 판과 좁은 판, 두 언어)가 있다", () => {
  for (const d of [...ko, ...en]) {
    assert.ok(d.title && d.role && d.summary, d.slug);
    assert.ok(d.html.includes("<h2>"), `${d.slug} 본문에 절이 없다`);
    assert.ok(d.figure, `${d.slug} 도해`);
    for (const lang of ["ko", "en"]) {
      assert.ok(figures[`${d.figure!.id}-${lang}`]?.startsWith("<svg"), `${d.slug} 도해 ${lang}`);
      assert.ok(figures[`${d.figure!.id}-${lang}-narrow`]?.startsWith("<svg"), `${d.slug} 좁은 도해 ${lang}`);
    }
  }
});

test("이미지 경로의 파일이 public 에 있다", () => {
  for (const d of ko) if (d.image) assert.ok(existsSync(join(PUBLIC, d.image.src)), d.image.src);
  // 반대로, 적어 둔 이미지는 모두 어떤 사례가 쓴다
  for (const [slug, ids] of Object.entries(CASE_IMAGES)) {
    const d = ko.find((x) => x.slug === slug);
    assert.ok(d?.image && ids.includes(d.image.src.split("/").pop()!.replace(".webp", "")), slug);
  }
});

test("도해 SVG 는 v8 토큰 변수만 쓴다", () => {
  const allowed = /^--(text|surface|line|accent)-[a-z-]+$/;
  for (const [name, svg] of Object.entries(figures)) {
    for (const m of svg.matchAll(/var\((--[a-z_-]+)/g)) assert.match(m[1], allowed, `${name}: ${m[1]}`);
  }
});

test("지표는 facts.json 에서 수치로 풀린다", () => {
  const withMetrics = ko.filter((d) => d.metrics.length > 0);
  assert.ok(withMetrics.length >= 3);
  for (const d of withMetrics) for (const m of d.metrics) assert.ok((m.kind === "number" ? m.value : m.total) > 0, `${d.slug} ${m.label}`);
});

test("마크다운 렌더: 문단·절·목록·강조·코드, 미지원은 던진다", () => {
  const html = renderMarkdown("## A\n\nhello **bold** `x`\n\n- one\n- two\n\n1. first\n2. second", "t");
  assert.equal(html, "<h2>A</h2>\n<p>hello <strong>bold</strong> <code>x</code></p>\n<ul><li>one</li><li>two</li></ul>\n<ol><li>first</li><li>second</li></ol>");
  assert.throws(() => renderMarkdown("[a](b)", "t"));
  assert.throws(() => renderMarkdown("# h1", "t"));
  assert.equal(renderMarkdown("<b>x</b>", "t"), "<p>&lt;b&gt;x&lt;/b&gt;</p>");
});

test("작업 57건: 분류가 다섯 중 하나, 표지는 디스크에, 사례 링크는 실제 사례로", () => {
  assert.equal(WORKS.length, 57);
  const slugs = new Set(ko.map((d) => d.slug));
  const seen = new Set<string>();
  for (const w of WORKS) {
    assert.ok(!seen.has(w.slug), `중복 ${w.slug}`);
    seen.add(w.slug);
    assert.ok(["design-system", "app-ui", "product-web", "brand", "concept"].includes(w.category), w.slug);
    assert.equal(existsSync(join(PUBLIC, "work", `${w.slug}.webp`)), !w.noCover, `${w.slug} 표지`);
    if (w.caseSlug) assert.ok(slugs.has(w.caseSlug), `${w.slug} → ${w.caseSlug}`);
  }
  // 사례 9편은 모두 작업 목록에 있다
  for (const s of slugs) assert.ok(WORKS.some((w) => w.slug === s), `작업 목록에 없는 사례 ${s}`);
});

test("em dash 가 없다", () => {
  const dash = String.fromCharCode(0x2014);
  for (const d of [...ko, ...en]) assert.ok(!JSON.stringify(d).includes(dash), d.slug);
  assert.ok(!JSON.stringify(WORKS).includes(dash));
});

test("본문 링크: 내부 경로와 https 만 링크가 되고 그 밖은 던진다", () => {
  assert.equal(renderMarkdown("[사례](/cases/design-system-in-code)", "t"), '<p><a href="/cases/design-system-in-code">사례</a></p>');
  assert.equal(renderMarkdown("[x](https://genesis.starzip.io)", "t"), '<p><a href="https://genesis.starzip.io" target="_blank" rel="noreferrer">x ↗</a></p>');
  assert.throws(() => renderMarkdown("[x](javascript:alert(1))", "t"));
  assert.throws(() => renderMarkdown('[x](/a"onmouseover=1)', "t"));
});
