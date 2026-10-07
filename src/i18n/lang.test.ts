// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLang } from "./lang.ts";

test("lang: URL beats storage beats navigator beats default", () => {
  assert.equal(resolveLang("ko", "en", "en-US"), "ko");
  assert.equal(resolveLang("en", "ko", "ko-KR"), "en");
  assert.equal(resolveLang(null, "ko", "en-US"), "ko");
  assert.equal(resolveLang(null, "en", "ko-KR"), "en");
  assert.equal(resolveLang(null, null, "ko-KR"), "ko");
  assert.equal(resolveLang(null, null, "ko"), "ko");
  assert.equal(resolveLang(null, null, "en-GB"), "en");
  assert.equal(resolveLang(null, null, null), "en");
});

test("lang: unknown values fall through", () => {
  assert.equal(resolveLang("jp", "fr", "de-DE"), "en");
  assert.equal(resolveLang("jp", null, "ko-KR"), "ko");
  assert.equal(resolveLang("", "ko", null), "ko");
  // "kok" 같은 다른 언어 코드는 ko 로 보지 않는다
  assert.equal(resolveLang(null, null, "kok-IN"), "en");
});
