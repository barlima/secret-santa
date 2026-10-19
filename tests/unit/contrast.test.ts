import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// WCAG contrast for the text/background pairs the screens actually use.
// Colours are read from the @theme tokens in globals.css, so a token change
// that breaks readability fails CI.

const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
const tokens = new Map(
  [...css.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]),
);

function token(name: string): string {
  const value = name === "white" ? "#ffffff" : tokens.get(name);
  assert.ok(value, `token --color-${name} exists`);
  return value;
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(token(fg)), luminance(token(bg))].sort((x, y) => y - x);
  return (a! + 0.05) / (b! + 0.05);
}

// [text, background, minimum ratio] — 4.5 for body text, 3 for large/bold UI text.
const PAIRS: Array<[string, string, number]> = [
  ["forest", "snow", 4.5], // body text
  ["moss", "snow", 4.5], // secondary text
  ["pine", "snow", 4.5], // links, eyebrows
  ["error", "snow", 4.5], // error messages
  ["error", "error-soft", 4.5], // error banner
  ["ink", "paper", 4.5], // hint boxes
  ["white", "red", 4.5], // primary buttons
  ["white", "pine", 4.5], // pine buttons, chips
  ["pine", "pine-soft", 4.5], // "Joined" pill
  ["wait", "wait-soft", 4.5], // "Not yet" pill
  ["amber", "amber-soft", 4.5], // draw "Waiting" label
  ["snow", "forest", 4.5], // dark screens
  ["mist", "forest", 4.5], // secondary text on dark
  ["gold", "forest", 4.5], // recipient name, progress number
  ["gold-light", "forest", 4.5], // highlighted names
  ["mist-dim", "forest", 4.5], // "· waiting" suffix
];

for (const [fg, bg, min] of PAIRS) {
  test(`${fg} on ${bg} has contrast ≥ ${min}`, () => {
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= min, `${fg} on ${bg}: ${ratio.toFixed(2)} < ${min}`);
  });
}
