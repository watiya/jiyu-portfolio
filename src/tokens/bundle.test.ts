// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DIALS, buildTokens, resolveToken } from "./engine.ts";
import { themeLink } from "./export.ts";
import { parseNotes, toAgentBundle, type Note } from "./bundle.ts";

const tokens = buildTokens({ ...DEFAULT_DIALS, hue: 30, theme: "dark" });
const link = themeLink(tokens);
const notes: Note[] = [
  { id: 7, tokens: ["button.bg", "button.radius"], label: 'button.btn "Start"', path: "", body: "Make this rounder\nand louder" },
  { id: 9, tokens: ["card.bg", "nope.missing"], label: "div.take", path: "", body: "  Less contrast  " },
];

test("묶음에는 링크·다이얼·메모가 번호 순서로 들어간다", () => {
  const md = toAgentBundle(tokens, notes, link);
  assert.ok(md.includes(`Theme link: ${link}`));
  assert.ok(md.includes("hue=30"));
  assert.ok(md.includes("theme=dark"));
  assert.ok(md.indexOf('### 1. button.btn "Start"') < md.indexOf("### 2. div.take"));
  assert.ok(md.includes("> Make this rounder\n> and louder"));
  assert.ok(md.includes("> Less contrast\n"));
});

test("토큰 값은 엔진으로 풀어 사슬째 적는다", () => {
  const md = toAgentBundle(tokens, notes, link);
  const chain = resolveToken("button.bg", tokens);
  assert.ok(chain);
  assert.ok(md.includes(`\`${chain.text}\``));
  assert.ok(md.includes("`nope.missing` (not a token in this set)"));
});

test("메모가 없어도 링크와 다이얼은 넘긴다", () => {
  const md = toAgentBundle(tokens, [], link);
  assert.ok(md.includes("No notes."));
  assert.ok(md.includes(link));
  assert.ok(!md.includes(String.fromCharCode(0x2014)));
});

test("세션 메모 파싱: 모양이 틀리거나 본문이 빈 것은 버린다", () => {
  const ok = notes[0];
  const list = parseNotes([ok, { ...ok, id: "x" }, { ...ok, tokens: [1] }, { ...ok, body: "  " }, null, "junk"]);
  assert.deepEqual(list, [ok]);
  assert.deepEqual(parseNotes({}), []);
});
