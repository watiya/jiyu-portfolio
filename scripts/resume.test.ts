// 이력서 원고가 확장 마크다운으로 렌더되는지, 공개 원고에 본명이 없는지 본다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { renderResume } from "../src/resume/render.ts";
import { renderMarkdown } from "../src/cases/markdown.ts";

// 본명은 저장소에 적지 않는다. 레포 밖 name.json 이 있는 기계에서만 대조한다
const nameFile = new URL("../../../resume/name.json", import.meta.url);
const realNames: string[] = existsSync(nameFile) ? Object.values(JSON.parse(readFileSync(nameFile, "utf8"))) : [];
const read = (lang: string) => readFileSync(new URL(`../src/content/resume/${lang}.md`, import.meta.url), "utf8");

for (const lang of ["ko", "en"]) {
  test(`이력서 ${lang}: 렌더·본명 없음`, () => {
    const raw = read(lang);
    const html = renderResume(raw, `content/resume/${lang}.md`);
    assert.ok(html.startsWith("<h1>Jiyu</h1>"));
    assert.ok(html.includes("<table>") && html.includes("<blockquote>") && html.includes("<h3>") && html.includes("<hr>"));
    assert.ok(!html.includes("<!--") && !html.includes("휴대폰"));
    for (const name of realNames) for (const part of name.split(/[()]/).map((x) => x.trim()).filter(Boolean)) assert.ok(!raw.includes(part));
    assert.ok(!raw.includes(String.fromCharCode(0x2014)));
  });
}

test("이력서: PDF 용 이름 바꿔 넣기", () => {
  assert.ok(renderResume(read("en"), "en.md", { name: "A B" }).startsWith("<h1>A B</h1>"));
});

test("사례 파서는 여전히 엄격하다", () => {
  assert.throws(() => renderMarkdown("### x", "case.md"), /h3/);
  assert.throws(() => renderMarkdown("| a |", "case.md"), /표/);
});
