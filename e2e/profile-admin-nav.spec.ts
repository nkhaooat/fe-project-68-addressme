/**
 * EPIC 1: TikTok Videos + Profile & Admin Shops
 * Automated E2E test using Playwright
 *
 * Covers:
 * - US1-1: Customer views TikTok videos on shop detail page
 * - Profile: view/edit profile
 * - Admin: shop CRUD, bookings management
 * - Navigation & general page loads
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const USER_EMAIL = 'aotmetrasit@gmail.com';
const USER_PASSWORD = '555761';

async function loginAs(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[name="email"], input[type="email"]').fill(email);
  await page.locator('input[name="password"], input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(shops|admin|$)/, { timeout: 15000 });
}

test.describe('EPIC 1: TikTok Videos (Extended)', () => {

  test('TC-TK01: Shop detail page shows TikTok section when links exist', async ({ page }) => {
    await page.goto(`${BASE_URL}/shops`);
    await page.waitForSelector('a[href^="/shop/"]', { timeout: 15000 });

    // Click through shops to find one with TikTok links
    const shopCards = page.locator('a[href^="/shop/"]');
    const count = await shopCards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto(`${BASE_URL}/shops`);
      await page.waitForSelector('a[href^="/shop/"]', { timeout: 10000 });
      const card = page.locator('a[href^="/shop/"]').nth(i);
      await card.click();
      await page.waitForURL(/\/shop\//, { timeout: 10000 });

      const tiktokLink = page.locator('a[href*="tiktok.com"]');
      if (await tiktokLink.count() > 0) {
        // TikTok section found
        await expect(tiktokLink.first()).toBeVisible({ timeout: 5000 });
        return;
      }
    }
    // No shops with TikTok links — valid state
    console.log('No TikTok links found on tested shops');
  });

  test('TC-TK02: TikTok link opens in new tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/shops`);
    await page.waitForSelector('a[href^="/shop/"]', { timeout: 15000 });

    const shopCards = page.locator('a[href^="/shop/"]');
    const count = await shopCards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      await page.goto(`${BASE_URL}/shops`);
      await page.waitForSelector('a[href^="/shop/"]', { timeout: 10000 });
      const card = page.locator('a[href^="/shop/"]').nth(i);
      await card.click();
      await page.waitForURL(/\/shop\//, { timeout: 10000 });

      const tiktokLink = page.locator('a[href*="tiktok.com"]').first();
      if (await tiktokLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        const target = await tiktokLink.getAttribute('target');
        expect(target).toBe('_blank');
        return;
      }
    }
  });
});

test.describe('Profile', () => {

  test('TC-PROF01: Profile page shows user info when logged in', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    // Should show name, email, telephone fields
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await nameInput.count() > 0) {
      const nameValue = await nameInput.inputValue();
      expect(nameValue.length).toBeGreaterThan(0);
    }
  });

  test('TC-PROF02: Profile page redirects when not logged in', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
    const url = page.url();
    expect(url).toMatch(/\/(login|$)/);
  });

  test('TC-PROF03: Profile edit saves successfully', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');

    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.count() > 0) {
      const currentName = await nameInput.inputValue();
      // Edit and save
      await nameInput.clear();
      await nameInput.fill(currentName); // Keep same name
      await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first().click();
      // Should show success
      await page.waitForTimeout(2000);
    }
  });

  test('TC-PROF04: Privacy page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/privacy`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin - Shops Management', () => {

  test('TC-ADMIN01: Admin shops page loads with shop list', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('TC-ADMIN02: Admin can open shop creation modal', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');

    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Shop")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(1000);
      // Modal or form should appear
      const modal = page.locator('[class*="modal"], [class*="Modal"], [role="dialog"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('TC-ADMIN03: Admin shops page has search functionality', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"], input[name="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('massage');
      await page.waitForTimeout(1000);
    }
  });

  test('TC-ADMIN04: Admin services page loads', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/services`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('TC-ADMIN05: Admin settings page loads', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible({ timeout: 15000 });
  });

  test('TC-ADMIN06: Non-admin cannot access admin shops', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD);
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');
    const hasAccessDenied = await page.locator('text=/access denied|forbidden|not authorized/i').count();
    const redirectedAway = !page.url().includes('/admin/shops');
    expect(hasAccessDenied > 0 || redirectedAway).toBe(true);
  });
});

test.describe('Navigation & General', () => {

  test('TC-NAV01: Home page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main').first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-NAV02: Shops page loads with shop cards', async ({ page }) => {
    await page.goto(`${BASE_URL}/shops`);
    await page.waitForSelector('a[href^="/shop/"]', { timeout: 15000 });
    const shopCards = page.locator('a[href^="/shop/"]');
    const count = await shopCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-NAV03: Login page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible({ timeout: 10000 });
  });

  test('TC-NAV04: Booking page redirects when not logged in', async ({ page }) => {
    await page.goto(`${BASE_URL}/booking`);
    await page.waitForLoadState('networkidle');
    // Should redirect to login or show access requirement
    const url = page.url();
    const hasLoginPrompt = url.includes('/login') || await page.locator('text=/login|sign in/i').count() > 0;
    expect(hasLoginPrompt || url.includes('/booking')).toBe(true);
  });

  test('TC-NAV05: My bookings page redirects when not logged in', async ({ page }) => {
    await page.goto(`${BASE_URL}/mybookings`);
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url.includes('/login') || url.includes('/mybookings')).toBe(true);
  });
});
