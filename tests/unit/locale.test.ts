import assert from "node:assert/strict";
import { test } from "node:test";
import { isLocale, negotiateLocale } from "../../src/i18n/config.ts";

test("isLocale accepts only pl, en, de", () => {
  assert.equal(isLocale("pl"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("de"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale("PL"), false);
  assert.equal(isLocale(undefined), false);
});

test("negotiateLocale picks the best supported language", () => {
  assert.equal(negotiateLocale("de-AT,de;q=0.9,en;q=0.8"), "de");
  assert.equal(negotiateLocale("en-GB,en;q=0.9,pl;q=0.8"), "en");
  assert.equal(negotiateLocale("fr-FR,fr;q=0.9,pl;q=0.5,en;q=0.4"), "pl");
});

test("negotiateLocale respects quality values over order", () => {
  assert.equal(negotiateLocale("en;q=0.3,de;q=0.9"), "de");
  assert.equal(negotiateLocale("pl;q=0,en"), "en");
});

test("negotiateLocale returns null when nothing matches", () => {
  assert.equal(negotiateLocale("fr,es;q=0.9"), null);
  assert.equal(negotiateLocale(""), null);
  assert.equal(negotiateLocale(null), null);
  assert.equal(negotiateLocale("*"), null);
});
