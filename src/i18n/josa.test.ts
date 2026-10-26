// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { josa } from "./josa.ts";

test("josa: 한글 받침으로 고른다", () => {
  assert.equal(josa("나무", "이/가"), "가");
  assert.equal(josa("불", "이/가"), "이");
  assert.equal(josa("무", "과/와"), "와");
  assert.equal(josa("축", "과/와"), "과");
  assert.equal(josa("바보", "은/는"), "는");
  assert.equal(josa("바보(역방향)", "은/는"), "은");
});

test("josa: 으로/로는 ㄹ 받침을 받침 없음처럼 본다", () => {
  assert.equal(josa("물", "으로/로"), "로");
  assert.equal(josa("흙", "으로/로"), "으로");
  assert.equal(josa("A", "으로/로"), "로");
});

test("josa: 영문과 숫자는 읽는 소리로 고른다", () => {
  assert.equal(josa("tokens.css", "을/를"), "를");
  assert.equal(josa("tokens.json", "을/를"), "을");
  assert.equal(josa("DESIGN.md", "을/를"), "를");
  assert.equal(josa("#3a5f80", "으로/로"), "으로");
  assert.equal(josa("#3a5f87", "으로/로"), "로");
});
