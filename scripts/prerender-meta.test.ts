// 프리렌더 메타: 경로 목록, 치환, 이스케이프, 이미지 크기. 빌드 산출물이 아니라 로직만 본다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { APP_DETAILS } from "../src/appDetails.ts";
import { STRINGS } from "../src/i18n/ui.ts";
import { WORKS } from "../src/works.ts";
import { CANVAS_SLUGS, SITE, applyMeta, buildRobots, buildRoutes, buildSitemap, escapeHtml, imageSize, readEnglishCases, type RouteMeta } from "./prerender-meta.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const sizeOf = (p: string) => imageSize(readFileSync(join(ROOT, "public", p)));
const routes = buildRoutes({ cases: readEnglishCases(ROOT), appDetails: APP_DETAILS, works: WORKS, canvasSlugs: CANVAS_SLUGS, ui: STRINGS.en }, sizeOf);
// 고정 5 + 사례 11 + 앱 6 + 작업 57 + 캔버스 49
const ROUTE_COUNT = 5 + 11 + 6 + WORKS.length + CANVAS_SLUGS.length;

const TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <title>Brainchild-Jiyu</title>
    <meta name="description" content="base" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Brainchild-Jiyu" />
    <meta property="og:title" content="base title" />
    <meta property="og:description" content="base og description" />
    <meta property="og:url" content="https://www.brainchild.kr/" />
    <meta property="og:image" content="https://www.brainchild.kr/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body><div id="root"></div></body>
</html>`;

const count = (html: string, needle: string) => html.split(needle).length - 1;

test("경로 목록: 첫 화면·홈·사례 목록·사례 11·앱 6·작업·작업 상세 57·캔버스 49·이력서", () => {
  const paths = routes.map((r) => r.path);
  assert.equal(paths.length, ROUTE_COUNT);
  assert.equal(WORKS.length, 57);
  assert.equal(CANVAS_SLUGS.length, 49);
  assert.equal(paths.filter((p) => /^\/work\/[a-z0-9-]+$/.test(p)).length, 57);
  assert.equal(paths.filter((p) => p.endsWith("/canvas")).length, 49);
  assert.ok(paths.includes("/work/starground") && paths.includes("/work/starground/canvas"));
  // 캔버스 경로는 전부 작업 상세가 있는 슬러그다
  for (const s of CANVAS_SLUGS) assert.ok(paths.includes(`/work/${s}`), s);
  assert.equal(new Set(paths).size, paths.length);
  for (const p of ["/", "/projects", "/cases", "/work", "/resume"]) assert.ok(paths.includes(p), p);
  assert.equal(paths.filter((p) => p.startsWith("/cases/")).length, 11);
  assert.equal(paths.filter((p) => p.startsWith("/apps/")).length, 6);
  assert.ok(paths.includes("/cases/dex-beta"));
});

test("제목은 앱의 document.title 규칙과 같다", () => {
  const t = STRINGS.en;
  const by = (p: string) => routes.find((r) => r.path === p)!;
  assert.equal(by("/").title, t.landing.title);
  assert.equal(by("/projects").title, t.titles.home);
  assert.equal(by("/cases").title, t.titles.cases);
  assert.equal(by("/work").title, t.titles.work);
  assert.equal(by("/work/starground").title, t.titles.workDetail("스타그라운드"));
  assert.equal(by("/work/starground/canvas").title, t.titles.canvas("스타그라운드"));
  assert.equal(by("/work/starground").description, WORKS.find((w) => w.slug === "starground")!.tagline.en);
  assert.equal(by("/apps/seoul-boom").title, t.titles.app("Seoul Boom"));
  assert.match(by("/cases/dex-beta").title, / \| Brainchild-Jiyu$/);
});

test("og:image: 사례 표지, 앱 첫 화면, 없으면 /og.png. 크기는 실제 파일에서 읽는다", () => {
  const by = (p: string) => routes.find((r) => r.path === p)!;
  assert.equal(by("/cases/design-system-in-code").image.url, `${SITE}/cases/design-system-in-code/design-system-tokens.webp`);
  assert.deepEqual(by("/cases/design-system-in-code").image.size, { width: 1440, height: 1000 });
  assert.equal(by("/cases/dex-beta").image.url, `${SITE}/og.png`);
  assert.deepEqual(by("/cases/dex-beta").image.size, { width: 1200, height: 630 });
  assert.equal(by("/apps/runpop").image.url, `${SITE}/og.png`);
  assert.deepEqual(by("/apps/runpop").image.size, { width: 1200, height: 630 });
  // 작업은 표지, 표지가 없는 작업은 브랜드 카드
  assert.equal(by("/work/starground").image.url, `${SITE}/work/starground.webp`);
  assert.ok(by("/work/starground").image.size, "표지 크기를 읽는다");
  assert.equal(by("/work/marketing-site").image.url, `${SITE}/og.png`);
});

test("applyMeta: 태그마다 하나씩, 값은 그 경로 것", () => {
  const m = routes.find((r) => r.path === "/cases/dex-beta")!;
  const html = applyMeta(TEMPLATE, m);
  for (const tag of ["<title>", 'name="description"', 'property="og:title"', 'property="og:description"', 'property="og:url"', 'property="og:image"', 'property="og:image:width"', 'name="twitter:card"', 'name="twitter:title"', 'name="twitter:description"', 'name="twitter:image"', 'rel="canonical"']) {
    assert.equal(count(html, tag), 1, tag);
  }
  assert.ok(html.includes(`<link rel="canonical" href="${SITE}/cases/dex-beta" />`));
  assert.ok(html.includes(`<meta property="og:url" content="${SITE}/cases/dex-beta" />`));
  assert.ok(!html.includes("base title") && !html.includes("base og description"));
  assert.ok(html.includes("<body><div id=\"root\"></div></body>"));
  assert.equal(applyMeta(html, m), html, "다시 돌려도 같다");
});

test("applyMeta: 기본 경로는 템플릿의 og:description 을 지키고, 크기를 모르면 width/height 를 뺀다", () => {
  const m: RouteMeta = { path: "/work", title: "Work", description: "d", image: { url: `${SITE}/x.gif` } };
  const html = applyMeta(TEMPLATE, m);
  assert.ok(html.includes('content="base og description"'));
  assert.ok(!html.includes("og:image:width") && !html.includes("og:image:height"));
  assert.ok(html.includes('<meta name="twitter:description" content="d" />'));
});

test("이스케이프: 따옴표·꺾쇠·앰퍼샌드, 그리고 $ 치환 패턴이 새지 않는다", () => {
  assert.equal(escapeHtml(`a & "b" <c> 'd'`), "a &amp; &quot;b&quot; &lt;c&gt; &#39;d&#39;");
  const m: RouteMeta = { path: "/work", title: `"A" & <B> $&`, description: `x" onload="y $1`, image: { url: `${SITE}/og.png` } };
  const html = applyMeta(TEMPLATE, m);
  assert.ok(html.includes("<title>&quot;A&quot; &amp; &lt;B&gt; $&amp;</title>"));
  assert.ok(html.includes('content="x&quot; onload=&quot;y $1"'));
  assert.ok(!html.includes('onload="y'));
});

test("본명·em-dash 가 어떤 경로 메타에도 없다", () => {
  const all = JSON.stringify(routes);
  assert.ok(!all.includes(String.fromCharCode(0x2014)));
  assert.ok(!/Jiyu Kim|김지유/.test(all));
});

test("사이트맵·robots", () => {
  const xml = buildSitemap(routes.map((r) => r.path));
  assert.equal(count(xml, "<loc>"), ROUTE_COUNT);
  assert.ok(xml.includes(`<loc>${SITE}/</loc>`) && xml.includes(`<loc>${SITE}/cases/dex-beta</loc>`));
  assert.ok(buildRobots().includes(`Sitemap: ${SITE}/sitemap.xml`));
});

test("vercel redirects 의 옛 주소와 겹치지 않는다", () => {
  const { redirects } = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8")) as { redirects: { source: string; has?: unknown[] }[] };
  // 호스트 조건이 붙은 것(portfolio.brainchild.kr 옛 v4 주소)은 이 사이트 경로와 겹치지 않는다
  const exact = new Set(redirects.filter((r) => !r.has && !r.source.includes(":")).map((r) => r.source));
  for (const r of routes) assert.ok(!exact.has(r.path), r.path);
});

test("imageSize: PNG·WebP 머리말, 모르는 형식은 undefined", () => {
  assert.deepEqual(imageSize(readFileSync(join(ROOT, "public/og.png"))), { width: 1200, height: 630 });
  assert.deepEqual(imageSize(readFileSync(join(ROOT, "public/cases/exposure-as-a-build/valuation-entry.webp"))), { width: 1440, height: 960 });
  assert.equal(imageSize(Buffer.from("GIF89a".padEnd(40, "\0"))), undefined);
});
