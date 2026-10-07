// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLang } from "./lang.ts";

test("lang: URL beats storage beats default", () => {
  assert.equal(resolveLang("ko", "en"), "ko");
  assert.equal(resolveLang("en", "ko"), "en");
  assert.equal(resolveLang(null, "ko"), "ko");
  assert.equal(resolveLang(null, "en"), "en");
});

test("lang: first visit is Korean", () => {
  assert.equal(resolveLang(null, null), "ko");
  assert.equal(resolveLang(undefined, undefined), "ko");
});

test("lang: unknown values fall through", () => {
  assert.equal(resolveLang("jp", "fr"), "ko");
  assert.equal(resolveLang("jp", "en"), "en");
  assert.equal(resolveLang("", "en"), "en");
});
