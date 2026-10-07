// 사례 본문 전용 최소 마크다운. v4(portfolio.brainchild.kr) 의 렌더를 그대로 옮겼다.
// 문법 집합이 닫혀 있어 라이브러리를 두지 않는다. 지원하지 않는 문법은 글자로 흘리지 않고 던진다.
// 지원: 문단 · `## 제목` · `- 불릿` · `1. 번호` · `**강조**` · `` `코드` `` · `[글](/내부경로)` · `[글](https://...)`
// 이력서(`extended`)는 문서 모양이 달라 `# 이름` · `### 경력 한 줄` · 표 · `> 주석` · `---` · `<!-- -->` 까지 받는다.

const EXTENDED_ONLY = new Set(["h1", "h3", "quote", "table", "hr"]);
const UNSUPPORTED: Array<[RegExp, string, string?]> = [
  [/^#(?!#)\s/, "h1 은 쓰지 않는다. 제목은 프론트매터의 title 이다", "h1"],
  [/^###\s/, "h3 이하는 지원하지 않는다", "h3"],
  [/^#{4,}\s/, "h4 이하는 지원하지 않는다"],
  [/^>\s/, "인용 블록은 지원하지 않는다", "quote"],
  [/^```/, "코드 블록은 지원하지 않는다"],
  [/^\|/, "표는 지원하지 않는다", "table"],
  [/^(-{3,}|\*{3,}|_{3,})\s*$/, "구분선은 쓰지 않는다", "hr"],
  [/!\[/, "이미지는 본문이 아니라 프론트매터 필드다"],
];

// 링크 주소는 내부 경로나 https 만 받는다. 그 밖은 던진다
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_HREF = /^(\/[A-Za-z0-9/_#-]*|https:\/\/[A-Za-z0-9.-]+(\/[A-Za-z0-9/_#.?=&-]*)?)$/;

const escapeHtml = (raw: string) => raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 인라인은 이스케이프 뒤에 처리한다. 순서를 뒤집으면 태그가 주입된다
export const inline = (raw: string) =>
  escapeHtml(raw)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(LINK, (whole: string, text: string, href: string) =>
      !SAFE_HREF.test(href) ? whole
      : href.startsWith("/") ? `<a href="${href}">${text}</a>` : `<a href="${href}" target="_blank" rel="noreferrer">${text} ↗</a>`,
    );

export function renderMarkdown(source: string, where: string, { extended = false } = {}): string {
  // 주석은 원고 메모라 렌더에 싣지 않는다. 줄 번호가 어긋나지 않게 줄바꿈은 남긴다
  const body = extended ? source.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, "")) : source;
  const lines = body.split("\n");
  lines.forEach((line, i) => {
    for (const [pattern, why, feature] of UNSUPPORTED) {
      if (extended && feature && EXTENDED_ONLY.has(feature)) continue;
      if (pattern.test(line)) throw new Error(`${where}:${i + 1} 지원하지 않는 마크다운. ${why}\n  ${line}`);
    }
    for (const m of line.matchAll(LINK)) {
      if (!SAFE_HREF.test(m[2])) throw new Error(`${where}:${i + 1} 링크 주소는 내부 경로나 https 만 쓴다\n  ${line}`);
    }
  });

  const html: string[] = [];
  let list: { tag: "ul" | "ol"; items: string[] } | null = null;
  let para: string[] = [];
  let quote: string[] = [];
  let table: string[][] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    html.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const flushQuote = () => {
    if (quote.length === 0) return;
    html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };
  // 첫 줄이 머리, 둘째 줄(---)은 구분. 머리 칸이 모두 비면 머리 없는 표다
  const flushTable = () => {
    if (table.length === 0) return;
    const [head, , ...rows] = table;
    const cells = (row: string[], tag: string) => row.map((c) => `<${tag}>${inline(c)}</${tag}>`).join("");
    const thead = head.some((c) => c !== "") ? `<thead><tr>${cells(head, "th")}</tr></thead>` : "";
    html.push(`<table>${thead}<tbody>${rows.map((r) => `<tr>${cells(r, "td")}</tr>`).join("")}</tbody></table>`);
    table = [];
  };
  const flushBlocks = () => {
    flushPara();
    flushList();
    flushQuote();
    flushTable();
  };
  const flushList = () => {
    if (!list) return;
    html.push(`<${list.tag}>${list.items.map((t) => `<li>${inline(t)}</li>`).join("")}</${list.tag}>`);
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      flushBlocks();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushBlocks();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    if (extended && /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushBlocks();
      html.push("<hr>");
      continue;
    }
    if (extended && trimmed.startsWith("|")) {
      flushPara();
      flushList();
      flushQuote();
      table.push(trimmed.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      continue;
    }
    const quoted = extended ? /^>\s?(.*)$/.exec(trimmed) : null;
    if (quoted) {
      flushPara();
      flushList();
      flushTable();
      quote.push(quoted[1]);
      continue;
    }
    const bullet = /^-\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    const marker = bullet ?? numbered;
    if (marker) {
      flushPara();
      const tag = bullet ? "ul" : "ol";
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push(marker[1]);
      continue;
    }
    // 여러 줄에 걸친 목록 항목은 앞 항목에 이어 붙인다
    if (list) {
      list.items[list.items.length - 1] += ` ${trimmed}`;
      continue;
    }
    para.push(trimmed);
  }
  flushBlocks();
  return html.join("\n");
}
