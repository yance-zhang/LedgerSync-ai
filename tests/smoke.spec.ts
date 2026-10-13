import { expect, test } from "@playwright/test";

test("login page renders and switches to account creation", async ({ page }, testInfo) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("login.png"), fullPage: false });

  await page.getByRole("button", { name: "Create an account" }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
});

test("protected documents page redirects signed-out users", async ({ page }) => {
  await page.goto("/dashboard/documents");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("extraction endpoint rejects a malformed document ID", async ({ request }) => {
  const response = await request.post("/api/documents/not-a-uuid/extract");
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body).toMatchObject({ error: "Invalid document." });
});
