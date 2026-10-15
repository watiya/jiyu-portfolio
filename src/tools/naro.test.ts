// Naro 바로가기 링크: 메뉴·생일·시·음력 윤달·두 사람·유형
import { test } from "node:test";
import assert from "node:assert/strict";
import { naroLink } from "./naro.ts";

test("Naro 링크: 메뉴와 해시 경로", () => {
  assert.equal(naroLink("tarot"), "https://akashicrecord.vercel.app/?menu=tarot#/tarot");
  assert.equal(naroLink("mbti", { type: "INFP" }), "https://akashicrecord.vercel.app/?menu=type&type=INFP#/type");
});

test("Naro 링크: 생일·시·달력, 시 모름, 음력 윤달, 두 사람", () => {
  assert.equal(naroLink("saju", { birth: { year: 1978, month: 3, day: 7, hour: 4, minute: 50, calendar: "solar" } }), "https://akashicrecord.vercel.app/?menu=saju&d=1978-03-07&t=04:50&cal=solar#/saju");
  assert.equal(naroLink("saju", { birth: { year: 1990, month: 5, day: 3, calendar: "lunar", leap: true } }), "https://akashicrecord.vercel.app/?menu=saju&d=1990-05-03&cal=lunar&leap=1#/saju");
  const g = new URL(naroLink("gunghap", { birth: { year: 1990, month: 5, day: 17, hour: 14, minute: 0, calendar: "solar" }, partner: { year: 1992, month: 11, day: 3, calendar: "solar" } }));
  assert.equal(g.searchParams.get("menu"), "match");
  assert.equal(g.searchParams.get("d2"), "1992-11-03");
  assert.equal(g.searchParams.get("t2"), null);
  assert.equal(g.hash, "#/match");
});
