// 지원용 이력서 PDF. 사이트와 같은 원고(src/content/resume/<lang>.md)를 같은 렌더로 그리고, 이름만 본명으로 바꿔 크롬 헤드리스로 인쇄한다.
// 본명은 저장소에 두지 않는다. 레포 밖 ../../resume/name.json({"ko": "...", "en": "..."})에서 읽고, PDF 도 그 폴더에 쓴다.
// 사이트의 /resume 를 브라우저에서 인쇄하면 이름이 Jiyu 인 공개판이 나온다(index.css 의 @media print). 이 스크립트는 그 지원용 짝이다.
//   pnpm resume:pdf
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderResume } from "../src/resume/render.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "../../resume");
const SITE = "https://www.brainchild.kr";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const nameFile = join(OUT, "name.json");
if (!existsSync(nameFile)) throw new Error(`${nameFile} 가 없다. {"ko": "본명", "en": "Real Name"} 꼴로 만든다`);
const names = JSON.parse(readFileSync(nameFile, "utf8")) as Record<string, string>;

// 사이트 인쇄 스타일과 같은 A4 판형. 화면용 토큰이 없는 단독 문서라 값을 직접 적는다
const CSS = `
@page { size: A4; margin: 14mm 14mm 16mm; }
body { font-family: "Apple SD Gothic Neo", "Helvetica Neue", Arial, sans-serif; font-size: 9.4pt; line-height: 1.55; color: #16181d; margin: 0; -webkit-font-smoothing: antialiased; }
h1 { font-size: 21pt; margin: 0 0 2pt; letter-spacing: -0.4pt; }
h1 + p { font-size: 11pt; margin: 0 0 3pt; }
h2 { font-size: 12pt; margin: 15pt 0 6pt; padding-bottom: 3pt; border-bottom: 1.2pt solid #16181d; break-after: avoid; }
h3 { font-size: 10.6pt; margin: 12pt 0 1pt; break-after: avoid; }
h3 + p { margin: 0 0 4pt; }
p { margin: 0 0 5pt; }
strong { font-weight: 600; }
a { color: #16181d; text-decoration: none; }
hr { display: none; }
ul { margin: 0 0 6pt; padding-left: 13pt; }
li { margin-bottom: 2.5pt; break-inside: avoid; }
li::marker { color: #9aa0ac; }
table { width: 100%; border-collapse: collapse; margin: 0 0 7pt; font-size: 8.9pt; }
tr { break-inside: avoid; }
td { border-bottom: 0.5pt solid #e2e4ea; padding: 3.2pt 5pt; text-align: left; vertical-align: top; }
td:first-child { width: 20%; color: #4a505c; }
blockquote { margin: 6pt 0 8pt; padding: 5pt 8pt; background: #f7f8fa; border-left: 2pt solid #c3c7d0; font-size: 8.6pt; color: #4a505c; break-inside: avoid; }
blockquote p { margin: 0; }
`;

const tmp = mkdtempSync(join(tmpdir(), "resume-"));
for (const lang of ["ko", "en"] as const) {
  const name = names[lang];
  if (!name) throw new Error(`name.json 에 ${lang} 이름이 없다`);
  const raw = readFileSync(join(ROOT, `src/content/resume/${lang}.md`), "utf8");
  // 사이트 안 링크(/work)는 PDF 에서 갈 데가 없으니 절대 주소로 바꾸고, 화면용 새 창 표시(↗)는 뺀다
  const body = renderResume(raw, `content/resume/${lang}.md`, { name }).replace(/href="\//g, `href="${SITE}/`).replace(/ ↗<\/a>/g, "</a>");
  const html = join(tmp, `${lang}.html`);
  writeFileSync(html, `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${name}</title><style>${CSS}</style></head><body>${body}</body></html>`);
  const pdf = join(OUT, `resume.${lang}.pdf`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${pdf}`, `file://${html}`], { stdio: "ignore" });
  console.log(`resume-pdf: ${pdf}`);
}
