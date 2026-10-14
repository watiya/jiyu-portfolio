// 실행: pnpm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_DIALS } from "./engine.ts";
import { HISTORY_LIMIT, record, redo, seal, startHistory, undo } from "./history.ts";

const at = (hue: number) => ({ ...DEFAULT_DIALS, hue });

test("드래그 한 번(잇달아 온 변경)은 한 단계로 묶인다", () => {
  let h = startHistory(DEFAULT_DIALS);
  for (let i = 1; i <= 30; i++) h = record(h, at(200 + i), 1000 + i * 16);
  assert.equal(h.past.length, 1);
  assert.equal(h.present.hue, 230);
  h = undo(h);
  assert.equal(h.present.hue, DEFAULT_DIALS.hue);
});

test("손을 떼거나 시간이 지나면 새 단계", () => {
  let h = startHistory(DEFAULT_DIALS);
  h = record(h, at(10), 1000);
  h = seal(h);
  h = record(h, at(20), 1010);
  h = record(h, at(30), 5000);
  assert.deepEqual(h.past.map((d) => d.hue), [DEFAULT_DIALS.hue, 10, 20]);
});

test("같은 값은 기록하지 않고, 출발점으로 돌아온 드래그는 지운다", () => {
  let h = startHistory(DEFAULT_DIALS);
  assert.equal(record(h, { ...DEFAULT_DIALS }, 1000), h);
  h = record(h, at(100), 1000);
  h = record(h, DEFAULT_DIALS, 1100);
  assert.equal(h.past.length, 0);
  h = record(h, at(50), 1200);
  assert.equal(h.past.length, 1);
});

test("되돌리기·다시하기, 새 변경은 다시하기 줄을 비운다", () => {
  let h = startHistory(DEFAULT_DIALS);
  h = record(h, at(10), 1000);
  h = record(h, at(20), 9000);
  h = undo(h);
  assert.equal(h.present.hue, 10);
  assert.equal(h.future.length, 1);
  h = redo(h);
  assert.equal(h.present.hue, 20);
  h = undo(undo(h));
  assert.equal(h.present.hue, DEFAULT_DIALS.hue);
  assert.equal(undo(h), h);
  h = record(h, at(99), 20000);
  assert.equal(h.future.length, 0);
  assert.equal(redo(h), h);
});

test("되돌린 직후의 변경은 묶이지 않는다", () => {
  let h = startHistory(DEFAULT_DIALS);
  h = record(h, at(10), 1000);
  h = record(h, at(20), 9000);
  h = undo(h);
  h = record(h, at(30), 9010);
  assert.deepEqual(h.past.map((d) => d.hue), [DEFAULT_DIALS.hue, 10]);
});

test(`기록은 최근 ${HISTORY_LIMIT}단계까지`, () => {
  let h = startHistory(DEFAULT_DIALS);
  for (let i = 1; i <= 40; i++) h = record(seal(h), at(i), i * 1000);
  assert.equal(h.past.length, HISTORY_LIMIT);
  assert.equal(h.past[0].hue, 20);
});
