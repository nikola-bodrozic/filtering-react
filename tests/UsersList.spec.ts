import { test, expect } from '@playwright/test';
const mockedResponse = {
  "status": "ok",
  "users": [
    { "id": 943996, "name": "mockUser 1762678266008", "email": "user1762678266008@mail.com" },
    { "id": 634188, "name": "User 763023125531", "email": "user33125531@mail.com" },
    { "id": 588807, "name": "User 63041479325", "email": "user63041479325@mail.com" }
  ]
}

function timestamp() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');

  // Format: YYYYMMDD_HH_MM_SS_mmm
  return `${year}${month}${day}_${hours}_${minutes}_${seconds}_${ms}`;
}

test.beforeEach(async ({ page }) => {
  await page.route("https://nikolabodr.com/api.php", async (route: { fulfill: (arg0: { status: number; contentType: string; body: string; }) => any; }) => {
    // Simulate slow API so "Loading..." is visible
    await new Promise((r) => setTimeout(r, 950));
    console.log(mockedResponse.users[0].name);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockedResponse),
    });
  });
});

test("shows loading state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Loading users...")).toBeVisible();

  await page.screenshot({
    path: `screenshots/loading-${timestamp()}.png`,
    fullPage: true,
  });
});

test("has title and list of users", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Context + Reducer: Array of")).toBeVisible();
  await expect(page.getByText(`${mockedResponse.users[0].name}`)).toBeVisible();
  await page.screenshot({
    path: `screenshots/users_list-${timestamp()}.png`,
    fullPage: true,
  });
});
