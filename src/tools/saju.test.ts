// 사주 계산: 알려진 날짜 세 개와 절기 경계, 공유 코드 왕복, 궁합·성향·타로 코드.
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeSaju, decodeSaju, encodeSaju, validDate, type SajuInput } from "./saju.ts";
import { computeGunghap } from "./gunghap.ts";
import { decodeMbti, encodeMbti, scoreMbti, QUESTIONS, dialsOf } from "./mbti.ts";
import { CARDS, decodeTarot, encodeTarot, summarize } from "./tarot.ts";

const gz = (r: ReturnType<typeof computeSaju>) => [r.pillars.year, r.pillars.month, r.pillars.day, r.pillars.time].map((p) => (p ? p.gan + p.zhi : "-")).join(" ");

test("알려진 날짜 세 개: 2000-01-01 12:00 · 1990-05-17 14:00 · 1988-02-15 23:30", () => {
  assert.equal(gz(computeSaju({ year: 2000, month: 1, day: 1, hour: 12, minute: 0, calendar: "solar" })), "己卯 丙子 戊午 戊午");
  assert.equal(gz(computeSaju({ year: 1990, month: 5, day: 17, hour: 14, minute: 0, calendar: "solar" })), "庚午 辛巳 壬午 丁未");
  // 23시 이후는 기본 유파(자시를 그날로)에서 庚子 일주
  assert.equal(gz(computeSaju({ year: 1988, month: 2, day: 15, hour: 23, minute: 30, calendar: "solar" })), "戊辰 甲寅 庚子 戊子");
});

test("입춘 경계: 2024-02-04 16:27 전은 癸卯년, 후는 甲辰년", () => {
  assert.equal(computeSaju({ year: 2024, month: 2, day: 4, hour: 10, calendar: "solar" }).pillars.year.gan + computeSaju({ year: 2024, month: 2, day: 4, hour: 10, calendar: "solar" }).pillars.year.zhi, "癸卯");
  assert.equal(computeSaju({ year: 2024, month: 2, day: 4, hour: 18, calendar: "solar" }).pillars.year.gan + computeSaju({ year: 2024, month: 2, day: 4, hour: 18, calendar: "solar" }).pillars.year.zhi, "甲辰");
});

test("시 모름이면 시주가 없고 오행 합은 100 근처", () => {
  const r = computeSaju({ year: 1990, month: 5, day: 17, calendar: "solar" });
  assert.equal(r.pillars.time, undefined);
  const sum = Object.values(r.percent).reduce((a, b) => a + b, 0);
  assert.ok(sum >= 98 && sum <= 102, String(sum));
  assert.equal(r.animal.ko, "말");
});

test("음력 입력과 윤달: 1990 윤5월 3일은 양력 1990-06-25", () => {
  const r = computeSaju({ year: 1990, month: 5, day: 3, calendar: "lunar", leap: true });
  assert.equal(r.solar, "1990-06-25");
  assert.equal(validDate({ year: 1991, month: 5, day: 3, calendar: "lunar", leap: true }), false);
  assert.equal(validDate({ year: 2024, month: 2, day: 30, calendar: "solar" }), false);
  assert.equal(validDate({ year: 2024, month: 2, day: 29, calendar: "solar" }), true);
});

test("사주 공유 코드 왕복", () => {
  const cases: SajuInput[] = [
    { year: 1990, month: 5, day: 17, hour: 14, minute: 0, calendar: "solar", leap: false },
    { year: 2000, month: 1, day: 1, calendar: "solar", leap: false },
    { year: 1990, month: 5, day: 3, hour: 7, minute: 30, calendar: "lunar", leap: true },
  ];
  for (const c of cases) assert.deepEqual(decodeSaju(encodeSaju(c)), c);
  assert.equal(encodeSaju(cases[0]), "s19900517.1400");
  assert.equal(encodeSaju(cases[2]), "s19900503.0730L+");
  assert.equal(decodeSaju("s19900517.9900"), null);
  assert.equal(decodeSaju("x"), null);
});

test("궁합: 점수는 20~98, 근거 문장이 세 종류로 나온다", () => {
  const a = computeSaju({ year: 1990, month: 5, day: 17, hour: 14, calendar: "solar" });
  const b = computeSaju({ year: 1992, month: 11, day: 3, hour: 9, calendar: "solar" });
  const g = computeGunghap(a, b, ["A", "B"]);
  assert.ok(g.score >= 20 && g.score <= 98);
  assert.ok(g.notes.length >= 2);
  assert.ok(g.notes.some((n) => n.kind === "fill"));
  assert.ok(g.notes.every((n) => n.text.ko && n.text.en));
  const same = computeGunghap(a, a, ["A", "A"]);
  assert.equal(same.relation, "same");
});

test("성향: 전부 5면 앞 글자, 코드 왕복, 다이얼 매핑", () => {
  const all5 = scoreMbti(QUESTIONS.map((q) => (q.dir === 1 ? 5 : 1)));
  assert.equal(all5.type, "ESTJ");
  const r = scoreMbti(QUESTIONS.map((_, i) => ((i * 7) % 5) + 1));
  assert.deepEqual(decodeMbti(encodeMbti(r)), r);
  assert.equal(decodeMbti("mXXXX.1-2-3-4"), null);
  const d = dialsOf("INFP");
  assert.equal(d.hue, 325);
  assert.equal(d.pairing, "editorial");
  assert.equal(d.motion, "calm");
});

test("타로: 22장, 코드 왕복, 종합 문장", () => {
  assert.equal(CARDS.length, 22);
  assert.deepEqual(
    CARDS.map((c) => c.n),
    Array.from({ length: 22 }, (_, i) => i),
  );
  const d = [
    { n: 0, rev: false },
    { n: 13, rev: true },
    { n: 21, rev: false },
  ];
  assert.equal(encodeTarot(d), "t0u-13r-21u");
  assert.deepEqual(decodeTarot("t0u-13r-21u"), d);
  assert.equal(decodeTarot("t0u-0r-1u"), null);
  assert.equal(decodeTarot("t0u-1u"), null);
  assert.equal(decodeTarot("t22u"), null);
  assert.ok(summarize(d, "ko").includes("죽음"));
  assert.ok(summarize([{ n: 19, rev: false }], "en").includes("The Sun"));
  // em-dash 없음
  const all = JSON.stringify(CARDS);
  assert.ok(!all.includes(String.fromCharCode(0x2014)));
});
