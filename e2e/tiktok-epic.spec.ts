/**
 * EPIC 1: TikTok Videos in Shop Detail
 * Automated E2E test using Playwright
 *
 * TC-01: Shop with TikTok data — open /shop/69be50224f7d836470ed1a66
 * TC-02: Shop without TikTok data — open /shop/69be4089241e5d0e203dd93b
 * TC-03: Click on TikTok video link on /shop/69be50224f7d836470ed1a66
 * TC-04: Non-existent shop — /shop/nonexistent-id shows "Shop not found"
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Known shop IDs
const SHOP_WITH_TIKTOK = '69be50224f7d836470ed1a66';
const SHOP_WITHOUT_TIKTOK = '69be4089241e5d0e203dd93b';

test.describe('EPIC 1: TikTok Videos', () => {

  test('TC-01: Shop with TikTok data displays TikTok link', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop/${SHOP_WITH_TIKTOK}`);
    await page.waitForLoadState('networkidle');

    // Page should load with shop content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Click the TikTok button to expand the section
    const tiktokBtn = page.locator('button:has-text("TikTok")').first();
    await expect(tiktokBtn).toBeVisible({ timeout: 5000 });
    await tiktokBtn.click();
    await page.waitForTimeout(500);

    // Now TikTok links should be visible
    const tiktokLink = page.locator('a[href*="tiktok.com"]').first();
    await expect(tiktokLink).toBeVisible({ timeout: 5000 });

    const href = await tiktokLink.getAttribute('href');
    expect(href).toContain('tiktok.com');

    await page.screenshot({ path: 'test-results/tc01-shop-with-tiktok.png' });
  });

  test('TC-02: Shop without TikTok data does not display TikTok section', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop/${SHOP_WITHOUT_TIKTOK}`);
    await page.waitForLoadState('networkidle');

    // Page should load with shop content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // TikTok link should NOT be visible
    const tiktokLink = page.locator('a[href*="tiktok.com"]');
    const count = await tiktokLink.count();
    expect(count).toBe(0);

    await page.screenshot({ path: 'test-results/tc02-shop-without-tiktok.png' });
  });

  test('TC-03: Clicking TikTok link opens video in new tab', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/shop/${SHOP_WITH_TIKTOK}`);
    await page.waitForLoadState('networkidle');

    // Click the TikTok button to expand the section
    const tiktokBtn = page.locator('button:has-text("TikTok")').first();
    await expect(tiktokBtn).toBeVisible({ timeout: 5000 });
    await tiktokBtn.click();
    await page.waitForTimeout(500);

    const tiktokLink = page.locator('a[href*="tiktok.com"]').first();
    await expect(tiktokLink).toBeVisible({ timeout: 5000 });

    // Click the link — it should open in a new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      tiktokLink.click(),
    ]);

    // New tab should navigate to tiktok.com
    await newPage.waitForLoadState('domcontentloaded').catch(() => {});
    const newUrl = newPage.url();
    expect(newUrl).toContain('tiktok.com');

    await newPage.screenshot({ path: 'test-results/tc03-tiktok-opened.png' });
    await newPage.close();
  });

  test('TC-04: Non-existent shop shows "Shop not found" page', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop/nonexistent-id-12345`);
    await page.waitForLoadState('networkidle');

    // Page should show error message
    const bodyText = await page.locator('body').textContent();
    expect(
      bodyText.toLowerCase().includes('not found') ||
      bodyText.toLowerCase().includes('does not exist')
    ).toBeTruthy();

    await page.screenshot({ path: 'test-results/tc04-shop-not-found.png' });
  });

});
