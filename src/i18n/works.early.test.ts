import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { EARLY_WORKS } from "../works.early.ts";
import { WORKS, WORK_CATEGORIES } from "../works.ts";

const hangul = /[ㄱ-힝]/;

test("EARLY_WORKS: 23 cards with unique slugs, covers and both languages", () => {
  assert.equal(EARLY_WORKS.length, 23);
  const slugs = EARLY_WORKS.map((w) => w.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const w of EARLY_WORKS) {
    assert.ok(!WORKS.some((x) => x.slug === w.slug), `${w.slug} collides with WORKS`);
    assert.ok(existsSync(new URL(`../../public/work/early/${w.slug}.webp`, import.meta.url)), `${w.slug} cover missing`);
    assert.ok(WORK_CATEGORIES.includes(w.category), `${w.slug} category`);
    assert.ok(w.name.ko && w.name.en, `${w.slug} name`);
    assert.ok(!hangul.test(w.name.en) && !hangul.test(w.tagline.en) && !hangul.test(w.client?.en ?? ""), `${w.slug} hangul in en`);
  }
});

test("EARLY_WORKS: no em dash", () => {
  const text = JSON.stringify(EARLY_WORKS);
  assert.ok(!text.includes(String.fromCharCode(0x2014)));
});
