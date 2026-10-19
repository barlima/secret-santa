import { expect, test, type Browser, type Page } from "@playwright/test";

/**
 * Full Secret Santa run against a deployed app (preview or production):
 * the admin adds four people and one spouse pair, everyone sets a password,
 * the draw runs, and every person sees exactly one valid name.
 *
 * It writes real data, so it refuses to run unless the admin is alone on the
 * list, and it removes its test people afterwards. Run it before adding the
 * real family, never after.
 *
 *   E2E_BASE_URL=https://… E2E_ADMIN_NAME="Bartłomiej Perucki" \
 *   E2E_ADMIN_PASSWORD=… npm run test:e2e
 */

const ADMIN_NAME = process.env.E2E_ADMIN_NAME ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "";
const PEOPLE = ["E2E Anna Test", "E2E Bruno Test", "E2E Celina Test", "E2E Dawid Test"];
const SPOUSES: [string, string] = ["E2E Anna Test", "E2E Bruno Test"];
const PASSWORD = "e2e-secret-santa";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);

async function englishPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  // Stable English copy for the selectors below.
  await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: process.env.E2E_BASE_URL! }]);
  return context.newPage();
}

async function pickName(page: Page, name: string) {
  await page.goto("/");
  await page.getByRole("link", { name }).click();
  await page.waitForURL(/\/p\//);
}

async function logIn(page: Page, name: string, password: string) {
  await pickName(page, name);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/me$/);
}

async function setPassword(page: Page, name: string) {
  await pickName(page, name);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: "Save password" }).click();
  await page.waitForURL(/\/me$/);
}

/** Accepts the "run a new draw?" sheet or the stale banner, if either shows up. */
async function redrawIfAsked(admin: Page) {
  const sheet = admin.getByRole("dialog", { name: "The group has changed" });
  if (await sheet.isVisible().catch(() => false)) {
    await sheet.getByRole("button", { name: "Yes, draw again" }).click();
    await expect(sheet).toBeHidden();
  }
}

/** Opens the gift on /me and returns the recipient's name. */
async function revealedName(page: Page): Promise<string> {
  await page.goto("/me");
  const gift = page.getByRole("button", { name: "Open your gift" });
  await expect(gift.or(page.getByText("You're buying a gift for"))).toBeVisible({ timeout: 30_000 });
  if (await gift.isVisible()) await gift.click();
  await expect(page.getByText("You're buying a gift for")).toBeVisible();
  return (await page.getByRole("heading", { level: 1 }).innerText()).replace(/\s+/g, " ").trim();
}

test("everyone gets exactly one valid match", async ({ browser }) => {
  test.skip(!ADMIN_NAME || !ADMIN_PASSWORD || !process.env.E2E_BASE_URL, "Set E2E_BASE_URL, E2E_ADMIN_NAME and E2E_ADMIN_PASSWORD.");

  const admin = await englishPage(browser);
  await logIn(admin, ADMIN_NAME, ADMIN_PASSWORD);

  // Guard: only ever run on an empty group.
  await admin.goto("/admin");
  const rows = admin.locator("main ul > li");
  await expect(rows.first()).toBeVisible();
  expect(await rows.count(), "Refusing to run: the list must contain only the admin").toBe(1);

  try {
    // Leftover stale draw from earlier tests: reset it first.
    const banner = admin.getByRole("button", { name: "Run the draw again" });
    if (await banner.isVisible().catch(() => false)) {
      await banner.click();
      await admin.getByRole("dialog").getByRole("button", { name: "Reset draw" }).click();
    }

    // 1. Admin adds people and a spouse pair.
    for (const name of PEOPLE) {
      await admin.getByLabel("Add a person").fill(name);
      await admin.getByRole("button", { name: "Add", exact: true }).click();
      await expect(admin.getByText(name, { exact: true })).toBeVisible();
      await redrawIfAsked(admin);
    }
    await expect(rows).toHaveCount(PEOPLE.length + 1);

    await admin.goto("/admin/spouses");
    await admin.getByLabel("Person", { exact: true }).selectOption({ label: SPOUSES[0] });
    await admin.getByLabel("Their spouse").selectOption({ label: SPOUSES[1] });
    await admin.getByRole("button", { name: "Pair as spouses" }).click();
    await expect(admin.getByRole("heading", { name: "1 pair" })).toBeVisible();

    // 2. Everyone sets a password; the last one triggers the draw.
    const pages = new Map<string, Page>();
    for (const name of PEOPLE) {
      const page = await englishPage(browser);
      await setPassword(page, name);
      pages.set(name, page);
    }

    await admin.goto("/admin/draw");
    await expect(admin.getByText("Everyone has a match")).toBeVisible({ timeout: 30_000 });

    // 3. Each person sees exactly one name: nobody draws themselves or their
    //    spouse, and every name is drawn exactly once.
    const results = new Map<string, string>();
    results.set(ADMIN_NAME, await revealedName(admin));
    for (const [name, page] of pages) results.set(name, await revealedName(page));

    const everyone = [ADMIN_NAME, ...PEOPLE];
    for (const [giver, receiver] of results) {
      expect(everyone, `${giver} drew someone in the group`).toContain(receiver);
      expect(receiver, `${giver} did not draw themselves`).not.toBe(giver);
    }
    expect(results.get(SPOUSES[0])).not.toBe(SPOUSES[1]);
    expect(results.get(SPOUSES[1])).not.toBe(SPOUSES[0]);
    expect(new Set(results.values()).size, "every name drawn exactly once").toBe(everyone.length);

    // 4. Results stay private: the admin's draw tab names nobody once it's done.
    await admin.goto("/admin/draw");
    for (const name of PEOPLE) await expect(admin.getByText(name)).toHaveCount(0);
  } finally {
    // 5. Clean up: remove the test people and reset the draw.
    await admin.goto("/admin");
    for (const name of PEOPLE) {
      const remove = admin.getByRole("button", { name: `Remove ${name}` });
      if (!(await remove.isVisible().catch(() => false))) continue;
      await remove.click();
      await admin.getByRole("dialog").getByRole("button", { name: "Remove" }).click();
      await expect(admin.getByText(name, { exact: true })).toHaveCount(0);
      const sheet = admin.getByRole("dialog", { name: "The group has changed" });
      if (await sheet.isVisible().catch(() => false)) await sheet.getByRole("button", { name: "Not now" }).click();
    }
    await admin.goto("/admin/draw");
    await admin.getByRole("button", { name: "Reset draw…" }).click();
    await admin.getByRole("dialog").getByRole("button", { name: "Reset draw" }).click();
  }
});
