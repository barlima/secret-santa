import assert from "node:assert/strict";
import { test } from "node:test";
import { firstName, initials, shortNames } from "../../src/lib/names.ts";

test("initials use the first and last word", () => {
  assert.equal(initials("Piotr Wiśniewski"), "PW");
  assert.equal(initials("Anna Maria Kowalska"), "AK");
  assert.equal(initials("ola"), "O");
  assert.equal(initials("  łukasz   żak "), "ŁŻ");
});

test("firstName takes the first word", () => {
  assert.equal(firstName("Piotr Wiśniewski"), "Piotr");
  assert.equal(firstName("  Ola  "), "Ola");
});

test("shortNames uses first names unless one is shared", () => {
  const names = shortNames([
    { id: "1", full_name: "Jan Nowak" },
    { id: "2", full_name: "jan Kowalski" },
    { id: "3", full_name: "Magdalena Nowak" },
  ]);
  assert.equal(names.get("1"), "Jan Nowak");
  assert.equal(names.get("2"), "jan Kowalski");
  assert.equal(names.get("3"), "Magdalena");
});
