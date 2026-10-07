// 모든 콘텐츠 항목에 en 과 ko 가 둘 다 있는지
import { test } from "node:test";
import assert from "node:assert/strict";
import { APPS, JOURNEY, NOW, STEPS, WRITING } from "../data.ts";
import { APPS_KO, JOURNEY_KO, NOW_KO, STEPS_KO, WRITING_KO } from "../data.ko.ts";
import { APP_DETAILS } from "../appDetails.ts";
import { APP_DETAILS_KO } from "../appDetails.ko.ts";
import { formatDay, getAppDetails, getApps, getJourney, getNow, getRecentWriting } from "./content.ts";
import { STRINGS } from "./ui.ts";
import { HIDDEN_APPS } from "../hidden.ts";

const hangul = /[가-힣]/;
const nonEmpty = (s: string) => typeof s === "string" && s.trim().length > 0;

test("APPS: every app has a ko entry with all fields", () => {
  for (const a of APPS) {
    const k = APPS_KO[a.name];
    assert.ok(k, `missing ko for app ${a.name}`);
    for (const f of ["koName", "badge", "kind", "note", "line"] as const) assert.ok(nonEmpty(k[f]), `${a.name}.${f} empty`);
    assert.ok(hangul.test(k.line), `${a.name}.line has no Hangul`);
  }
  // 숨긴 앱(src/hidden.ts)은 한국어판을 남겨 둔다. 되살릴 때 다시 쓰지 않도록
  assert.equal(Object.keys(APPS_KO).length, APPS.length + HIDDEN_APPS.size, "ko map has extra apps");
});

test("APP_DETAILS: every slug has a ko entry with same section count", () => {
  for (const d of APP_DETAILS) {
    const k = APP_DETAILS_KO[d.slug];
    assert.ok(k, `missing ko for detail ${d.slug}`);
    assert.ok(nonEmpty(k.title) && nonEmpty(k.dek) && nonEmpty(k.date), `${d.slug} title/dek/date`);
    assert.equal(k.meta.length, d.meta.length, `${d.slug} meta count`);
    assert.equal(k.sections.length, d.sections.length, `${d.slug} section count`);
    k.sections.forEach((s, i) => {
      assert.equal(s.body.length, d.sections[i].body.length, `${d.slug} section ${i} paragraph count`);
      for (const p of s.body) assert.ok(hangul.test(p), `${d.slug} section ${i} paragraph without Hangul`);
    });
  }
  assert.equal(Object.keys(APP_DETAILS_KO).length, APP_DETAILS.length + HIDDEN_APPS.size);
  // 앱 이름은 두 언어에서 같다
  for (const d of getAppDetails("ko")) assert.ok(APPS.some((a) => a.name === d.name), `${d.slug} name changed in ko`);
});

test("JOURNEY, STEPS, WRITING: both languages present", () => {
  for (const j of JOURNEY) assert.ok(JOURNEY_KO[j.company] && nonEmpty(JOURNEY_KO[j.company].role) && nonEmpty(JOURNEY_KO[j.company].period), `journey ${j.company}`);
  assert.equal(STEPS_KO.length, STEPS.length);
  for (const w of WRITING) assert.ok(WRITING_KO[w.slug] && nonEmpty(WRITING_KO[w.slug].title), `writing ${w.slug}`);
  assert.equal(Object.keys(JOURNEY_KO).length, JOURNEY.length);
  assert.equal(Object.keys(WRITING_KO).length, WRITING.length);
});

test("localized views keep ids and counts", () => {
  assert.deepEqual(getApps("ko").map((a) => a.name), APPS.map((a) => a.name));
  assert.deepEqual(getJourney("ko").map((j) => j.year), JOURNEY.map((j) => j.year));
  assert.ok(getApps("ko").every((a) => hangul.test(a.line)));
  assert.ok(getApps("en").every((a) => !hangul.test(a.line)));
});

test("UI strings: ko mirrors en keys and the ko hero headline carries Hangul", () => {
  const keys = (o: object, p = ""): string[] => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
  assert.deepEqual(keys(STRINGS.ko), keys(STRINGS.en));
  assert.ok(hangul.test(STRINGS.ko.hero.headline));
  assert.ok(!JSON.stringify(STRINGS).includes(String.fromCharCode(0x2014)), "no em dash in UI strings");
});

test("NOW: ko mirrors en, and the date is not older than the newest app entry", () => {
  assert.equal(NOW_KO.length, NOW.items.length);
  assert.ok(NOW_KO.every((s) => hangul.test(s)));
  assert.deepEqual(getNow("ko").items, NOW_KO);
  assert.match(NOW.asOf, /^\d{4}-\d{2}-\d{2}$/);
  // 갱신일은 NOW.asOf 를 따른다. 앱 상세에 더 늦은 달이 생기면 목록을 다시 확인하라는 신호로 여기서 깨진다
  const newest = Math.max(...APP_DETAILS.map((d) => Date.parse(`1 ${d.date}`)));
  const asOfMonth = Date.parse(`${NOW.asOf.slice(0, 7)}-01`);
  assert.ok(asOfMonth >= newest, `NOW.asOf ${NOW.asOf} is older than the newest app entry`);
});

test("formatDay and getRecentWriting", () => {
  assert.equal(formatDay("2026-10-07", "en"), "Oct 7, 2026");
  assert.equal(formatDay("2026-10-07", "ko"), "2026. 10. 7.");
  const en = getRecentWriting("en", 3);
  assert.equal(en.length, 3);
  assert.deepEqual(en.map((w) => w.slug), ["dials-to-design-md", "wording-as-risk", "delivery-operations"]);
  assert.deepEqual(getRecentWriting("ko", 3).map((w) => w.slug), en.map((w) => w.slug));
  assert.ok(getRecentWriting("ko", 3).every((w) => hangul.test(w.title)));
});
