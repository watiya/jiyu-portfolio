// 빌드 후 단계. dist/index.html 을 경로별로 복제해 head 의 공유 미리보기 메타만 그 경로 값으로 바꾼다.
// 본문은 그대로 SPA 다. 크롤러는 JS 를 돌리지 않으므로 title·description·og·twitter·canonical 만 미리 박는다.
// 글롭(import.meta.glob)을 쓰는 content.ts 는 node 에서 못 불러서, 사례 md 는 디스크에서 읽어 parse.ts 로 파싱한다.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCase, type CaseDoc } from "../src/cases/parse.ts";
import { APP_DETAILS, type AppDetail } from "../src/appDetails.ts";
import { STRINGS, type UI } from "../src/i18n/ui.ts";
import { WORKS, type Work } from "../src/works.ts";
import canvasIndex from "../src/content/canvas/index.json" with { type: "json" };

export const SITE = "https://www.brainchild.kr";
export const DEFAULT_IMAGE = "/og.png";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export type Size = { width: number; height: number };
type Image = { url: string; size?: Size };
export type RouteMeta = {
  path: string;
  title: string;
  /** og:title 이 title 과 다를 때만. 첫 화면은 기존 og:title 을 지킨다 */
  ogTitle?: string;
  description: string;
  /** 없으면 템플릿의 og:description 을 그대로 둔다 */
  ogDescription?: string;
  image: Image;
};

export type Sources = { cases: CaseDoc[]; appDetails: AppDetail[]; works: Work[]; canvasSlugs: string[]; ui: UI };

/** 캔버스가 있는 작업 슬러그. scripts/canvas-manifest.ts 가 만든 색인에서 읽는다 */
export const CANVAS_SLUGS = Object.keys(canvasIndex);

/** 이미지 경로(/로 시작) → 크기. 모르면 undefined */
export type SizeOf = (publicPath: string) => Size | undefined;

export function buildRoutes({ cases, appDetails, works, canvasSlugs, ui }: Sources, sizeOf: SizeOf): RouteMeta[] {
  const image = (path: string): Image => ({ url: SITE + path, size: sizeOf(path) });
  const generic = (path: string, title: string, ogTitle?: string): RouteMeta => ({
    path,
    title,
    ogTitle,
    description: ui.metaDescription,
    image: image(DEFAULT_IMAGE),
  });

  return [
    // 첫 화면 제목은 앱의 document.title 과 같고, 공유 제목만 기존 값(홈 제목)을 쓴다
    generic("/", ui.landing.title, ui.titles.home),
    generic("/projects", ui.titles.home),
    generic("/cases", ui.titles.cases),
    ...cases.map((c): RouteMeta => ({
      path: `/cases/${c.slug}`,
      title: ui.titles.case(c.title),
      description: c.summary,
      ogDescription: c.summary,
      image: image(c.image?.src ?? DEFAULT_IMAGE),
    })),
    ...appDetails.map((d): RouteMeta => ({
      path: `/apps/${d.slug}`,
      title: ui.titles.app(d.name),
      description: d.dek,
      ogDescription: d.dek,
      // 앱 화면은 세로라 가로 카드에서 잘린다. 브랜드 카드로 둔다
      image: image(DEFAULT_IMAGE),
    })),
    generic("/work", ui.titles.work),
    // 작업 상세와 캔버스. 슬러그는 v4 와 1:1 이다. 표지가 있으면 표지, 없으면 브랜드 카드
    ...works.map((w): RouteMeta => ({
      path: `/work/${w.slug}`,
      title: ui.titles.workDetail(w.name),
      description: w.tagline.en,
      ogDescription: w.tagline.en,
      image: image(w.noCover ? DEFAULT_IMAGE : `/work/${w.slug}.webp`),
    })),
    ...works
      .filter((w) => canvasSlugs.includes(w.slug))
      .map((w): RouteMeta => ({
        path: `/work/${w.slug}/canvas`,
        title: ui.titles.canvas(w.name),
        description: w.tagline.en,
        ogDescription: w.tagline.en,
        image: image(w.noCover ? DEFAULT_IMAGE : `/work/${w.slug}.webp`),
      })),
    generic("/writing", ui.titles.writing),
    generic("/resume", ui.titles.resume),
  ];
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const must = (html: string, re: RegExp, what: string) => {
  if (!re.test(html)) throw new Error(`prerender-meta: 템플릿에서 ${what} 를 찾지 못했다`);
};

/** 템플릿 head 의 메타를 한 경로의 값으로 바꾼다. 같은 입력에 몇 번을 돌려도 같은 결과다 */
export function applyMeta(template: string, m: RouteMeta): string {
  const e = escapeHtml;
  const url = SITE + (m.path === "/" ? "/" : m.path);
  const ogTitle = m.ogTitle ?? m.title;
  const titleRe = /<title>[\s\S]*?<\/title>/;
  const descRe = /<meta name="description"[^>]*>/;
  const siteNameRe = /<meta property="og:site_name"[^>]*>/;
  must(template, titleRe, "<title>");
  must(template, descRe, 'meta name="description"');
  must(template, siteNameRe, "og:site_name");

  // 갈아끼울 태그는 먼저 걷고, og:site_name 뒤에 한 덩어리로 다시 쓴다. og:description 은 기본값을 지킬 수 있게 따로 둔다
  const keptOgDescription = template.match(/<meta property="og:description"[^>]*>/)?.[0];
  const stripped = template
    .replace(/[ \t]*<meta property="og:(title|description|url|image|image:width|image:height)"[^>]*>\n?/g, "")
    .replace(/[ \t]*<meta name="twitter:[a-z:]+"[^>]*>\n?/g, "")
    .replace(/[ \t]*<link rel="canonical"[^>]*>\n?/g, "");

  const ogDescription = m.ogDescription === undefined ? keptOgDescription : `<meta property="og:description" content="${e(m.ogDescription)}" />`;
  const twitterDescription = m.ogDescription ?? m.description;
  const block = [
    `<meta property="og:title" content="${e(ogTitle)}" />`,
    ogDescription,
    `<meta property="og:url" content="${e(url)}" />`,
    `<meta property="og:image" content="${e(m.image.url)}" />`,
    ...(m.image.size ? [`<meta property="og:image:width" content="${m.image.size.width}" />`, `<meta property="og:image:height" content="${m.image.size.height}" />`] : []),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${e(ogTitle)}" />`,
    `<meta name="twitter:description" content="${e(twitterDescription)}" />`,
    `<meta name="twitter:image" content="${e(m.image.url)}" />`,
    `<link rel="canonical" href="${e(url)}" />`,
  ]
    .filter((l): l is string => Boolean(l))
    .map((l) => `    ${l}`)
    .join("\n");

  return stripped
    .replace(titleRe, () => `<title>${e(m.title)}</title>`)
    .replace(descRe, () => `<meta name="description" content="${e(m.description)}" />`)
    .replace(siteNameRe, (site) => `${site}\n${block}`);
}

export function buildSitemap(paths: string[]): string {
  const urls = paths.map((p) => `  <url><loc>${escapeHtml(SITE + p)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const buildRobots = () => `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;

/** PNG·WebP 머리말에서 가로세로를 읽는다. 다른 형식이거나 깨졌으면 undefined */
export function imageSize(b: Buffer): Size | undefined {
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47 && b.toString("ascii", 12, 16) === "IHDR") return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8 " && b[23] === 0x9d && b[24] === 0x01 && b[25] === 0x2a) return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L" && b[20] === 0x2f) {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
    if (kind === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  }
  return undefined;
}

/* ── 디스크에서 모으기 ── */

export function readEnglishCases(root: string): CaseDoc[] {
  const dir = join(root, "src/content/cases/en");
  const figures = new Set(readdirSync(join(root, "src/content/cases/figures")).map((f) => f.replace(/\.svg$/, "")));
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) =>
      buildCase(readFileSync(join(dir, f), "utf8"), "en", `content/cases/en/${f}`, (key) => figures.has(key), (slug, id) => existsSync(join(root, "public/cases", slug, `${id}.webp`))),
    )
    .sort((a, b) => a.order - b.order);
}

function main() {
  const dist = join(ROOT, "dist");
  const template = readFileSync(join(dist, "index.html"), "utf8");
  const sizeOf: SizeOf = (p) => {
    const file = join(ROOT, "public", p);
    return existsSync(file) ? imageSize(readFileSync(file)) : undefined;
  };
  const routes = buildRoutes({ cases: readEnglishCases(ROOT), appDetails: APP_DETAILS, works: WORKS, canvasSlugs: CANVAS_SLUGS, ui: STRINGS.en }, sizeOf);

  for (const m of routes) {
    const out = join(dist, m.path === "/" ? "" : m.path, "index.html");
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, applyMeta(template, m));
  }

  const paths = routes.map((r) => r.path);
  const wrote = [`${routes.length} routes`];
  if (!existsSync(join(ROOT, "public/sitemap.xml"))) {
    writeFileSync(join(dist, "sitemap.xml"), buildSitemap(paths));
    wrote.push("sitemap.xml");
  }
  if (!existsSync(join(ROOT, "public/robots.txt"))) {
    writeFileSync(join(dist, "robots.txt"), buildRobots());
    wrote.push("robots.txt");
  }
  console.log(`prerender-meta: ${wrote.join(", ")}`);
}

if (import.meta.main) main();
