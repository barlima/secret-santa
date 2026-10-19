import assert from "node:assert/strict";
import { test } from "node:test";
import { bulbLayout, MAX_BULBS, MIN_BULBS } from "../../src/app/me/lights.ts";

test("one bulb per person within the limits", () => {
  assert.equal(bulbLayout(0, 2).count, MIN_BULBS);
  assert.equal(bulbLayout(0, 8).count, 8);
  assert.equal(bulbLayout(0, 30).count, MAX_BULBS);
});

test("lit bulbs follow progress", () => {
  assert.deepEqual(bulbLayout(5, 8), { count: 8, lit: 5 });
  assert.deepEqual(bulbLayout(15, 30), { count: 12, lit: 6 });
});

test("never dark once someone joined, never full while someone is missing", () => {
  for (let total = 1; total <= 30; total++) {
    for (let joined = 0; joined <= total; joined++) {
      const { count, lit } = bulbLayout(joined, total);
      assert.ok(lit >= 0 && lit <= count, `bounds for ${joined}/${total}`);
      if (joined > 0) assert.ok(lit >= 1, `some light for ${joined}/${total}`);
      if (joined < total) assert.ok(lit < count, `not full for ${joined}/${total}`);
      if (joined === total) assert.equal(lit, count, `full for ${joined}/${total}`);
      if (joined === 0) assert.equal(lit, 0, `dark for 0/${total}`);
    }
  }
});
