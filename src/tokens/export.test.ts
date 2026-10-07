// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DIALS, buildTokens } from "./engine.ts";
import { toCss, toDesignMd, toJson } from "./export.ts";

const tokens = buildTokens(DEFAULT_DIALS);

test("CSS 는 엔진의 변수를 빠짐없이 :root 에 담는다", () => {
  const css = toCss(tokens);
  for (const [k, v] of Object.entries(tokens.vars)) assert.ok(css.includes(`${k}: ${v};`), k);
});

test("JSON 별칭은 실제로 있는 토큰을 가리킨다", () => {
  const json = JSON.parse(toJson(tokens));
  assert.equal(json.surface.raised.$type, "color");
  assert.equal(json.card.bg.$value, "{surface.raised}");
  const aliases = toJson(tokens).match(/"\{[\w.-]+\}"/g) ?? [];
  assert.ok(aliases.length > 10);
  for (const a of aliases) {
    const [g, k] = a.slice(2, -2).split(".");
    assert.ok(json[g]?.[k], a);
  }
});

test("DESIGN.md 는 지금 색을 담고 em-dash 를 쓰지 않는다", () => {
  const md = toDesignMd(buildTokens({ ...DEFAULT_DIALS, hue: 20, theme: "dark" }));
  assert.match(md, /^---\nname: Brainchild-Jiyu\ntheme: dark/);
  assert.ok(md.includes("hue=20"));
  assert.ok(!md.includes("—"));
});
