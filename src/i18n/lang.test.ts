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

test("lang: first visit is English", () => {
  assert.equal(resolveLang(null, null), "en");
  assert.equal(resolveLang(undefined, undefined), "en");
});

test("lang: unknown values fall through", () => {
  assert.equal(resolveLang("jp", "fr"), "en");
  assert.equal(resolveLang("jp", "ko"), "ko");
  assert.equal(resolveLang("", "ko"), "ko");
});
