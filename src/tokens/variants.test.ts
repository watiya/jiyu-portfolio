// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DIALS } from "./engine.ts";
import { MAX_VARIANTS, NAME_MAX, addVariant, nextName, parseVariants, removeVariant, renameVariant, type Variant } from "./variants.ts";

const at = (hue: number) => ({ ...DEFAULT_DIALS, hue });

test("이름은 A·B·C 순서, 지운 자리는 다시 쓴다", () => {
  let list: Variant[] = [];
  for (let i = 0; i < 3; i++) list = addVariant(list, at(i * 10), `id${i}`).list;
  assert.deepEqual(list.map((v) => v.name), ["A", "B", "C"]);
  list = removeVariant(list, "id1");
  assert.equal(nextName(list), "B");
});

test(`같은 조합은 다시 만들지 않고, ${MAX_VARIANTS}개가 끝`, () => {
  let list: Variant[] = [];
  for (let i = 0; i < MAX_VARIANTS; i++) list = addVariant(list, at(i * 10), `id${i}`).list;
  const dup = addVariant(list, at(10), "x");
  assert.equal(dup.status, "exists");
  assert.equal(dup.variant?.name, "B");
  assert.equal(addVariant(list, at(333), "y").status, "full");
  assert.equal(list.length, MAX_VARIANTS);
});

test("이름 바꾸기: 공백 정리, 길이 제한, 빈 이름은 무시", () => {
  const list = addVariant([], DEFAULT_DIALS, "a").list;
  assert.equal(renameVariant(list, "a", "  Night   blue ")[0].name, "Night blue");
  assert.equal(renameVariant(list, "a", "x".repeat(40))[0].name.length, NAME_MAX);
  assert.equal(renameVariant(list, "a", "   ")[0].name, "A");
});

test("저장소 값 파싱: 깨진 항목은 버리고 다이얼은 다시 검증", () => {
  const raw = [
    { id: "a", name: "Mine", dials: { ...DEFAULT_DIALS, hue: 999, theme: "neon" } },
    { id: "a", name: "dup", dials: DEFAULT_DIALS },
    { id: "", dials: DEFAULT_DIALS },
    { id: "b", dials: null },
    "junk",
    { id: "c", name: 5, dials: { radius: 12 } },
  ];
  const list = parseVariants(raw);
  assert.deepEqual(list.map((v) => v.id), ["a", "c"]);
  assert.equal(list[0].dials.hue, 360);
  assert.equal(list[0].dials.theme, DEFAULT_DIALS.theme);
  assert.equal(list[1].name, "A");
  assert.equal(list[1].dials.radius, 12);
  assert.deepEqual(parseVariants(null), []);
  assert.deepEqual(parseVariants({}), []);
  const many = Array.from({ length: 10 }, (_, i) => ({ id: `v${i}`, name: "n", dials: DEFAULT_DIALS }));
  assert.equal(parseVariants(many).length, MAX_VARIANTS);
});
