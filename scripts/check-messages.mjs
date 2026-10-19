// Fails when messages/{pl,de}.json don't have exactly the keys of en.json,
// or when a translation drops an ICU argument ({name}, {count, plural, …}).
// Run: node scripts/check-messages.mjs
import { readFileSync } from "node:fs";

const SOURCE = "en";
const TARGETS = ["pl", "de"];

const load = (locale) =>
  JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));

function flatten(obj, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, path, out);
    else out.set(path, String(value));
  }
  return out;
}

// Top-level ICU argument names, e.g. "{joined} of {total, plural, …}" → joined,total.
function argNames(message) {
  const names = new Set();
  let depth = 0;
  for (let i = 0; i < message.length; i++) {
    const ch = message[i];
    if (ch === "{") {
      if (depth === 0) {
        const match = /^\{\s*([A-Za-z_][\w]*)/.exec(message.slice(i));
        if (match?.[1]) names.add(match[1]);
      }
      depth++;
    } else if (ch === "}") {
      depth--;
    }
  }
  return names;
}

function bracesBalanced(message) {
  let depth = 0;
  for (const ch of message) {
    if (ch === "{") depth++;
    else if (ch === "}" && --depth < 0) return false;
  }
  return depth === 0;
}

const source = flatten(load(SOURCE));
const problems = [];

for (const locale of [SOURCE, ...TARGETS]) {
  for (const [key, value] of flatten(load(locale))) {
    if (!bracesBalanced(value)) problems.push(`${locale}: unbalanced braces in "${key}"`);
  }
}

for (const locale of TARGETS) {
  const target = flatten(load(locale));
  for (const key of source.keys()) {
    if (!target.has(key)) problems.push(`${locale}: missing "${key}"`);
  }
  for (const [key, value] of target) {
    const sourceValue = source.get(key);
    if (sourceValue === undefined) {
      problems.push(`${locale}: extra key "${key}"`);
      continue;
    }
    if (!value.trim()) problems.push(`${locale}: empty "${key}"`);
    for (const name of argNames(sourceValue)) {
      if (!argNames(value).has(name)) problems.push(`${locale}: "${key}" lost argument {${name}}`);
    }
  }
}

if (problems.length) {
  console.error(`Translation check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`Translations OK: ${source.size} keys in ${[SOURCE, ...TARGETS].join(", ")}.`);
