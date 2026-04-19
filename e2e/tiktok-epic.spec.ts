/**
 * EPIC 1: TikTok Videos in Shop Detail
 * Automated E2E test using Playwright
 * 
 * Test Cases:
 * TC-01: View shop detail page and verify TikTok section exists
 * TC-02: Click TikTok link and verify it opens correct URL
 * TC-03: Verify TikTok section shows message when no videos available
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('EPIC 1: TikTok Videos', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to shops page
    await page.goto(`${BASE_URL}/shops`);
    // Wait for shops to load
    await page.waitForSelector('[data-testid="shop-card"]', { timeout: 10000 });
  });

  test('TC-01: Shop detail page displays TikTok section', async ({ page }) => {
    // Click on first shop
    const firstShop = page.locator('[data-testid="shop-card"]').first();
    await firstShop.click();
    
    // Wait for shop detail page to load
    await page.waitForURL(/\/shop\//, { timeout: 10000 });
    
    // Verify TikTok section exists
    const tiktokSection = page.locator('[data-testid="tiktok-section"]').or(
      page.getByText(/TikTok|tiktok/i)
    );
    await expect(tiktokSection).toBeVisible({ timeout: 5000 });
    
    // Take screenshot for documentation
    await page.screenshot({ path: 'test-results/tc01-tiktok-section.png' });
  });

  test('TC-02: TikTok link opens correct URL', async ({ page, context }) => {
    // Click on first shop
    const firstShop = page.locator('[data-testid="shop-card"]').first();
    await firstShop.click();
    
    await page.waitForURL(/\/shop\//, { timeout: 10000 });
    
    // Look for TikTok link
    const tiktokLink = page.locator('a[href*="tiktok.com"]').first();
    
    // If TikTok link exists, verify it
    if (await tiktokLink.isVisible().catch(() => false)) {
      const href = await tiktokLink.getAttribute('href');
      expect(href).toContain('tiktok.com');
      
      // Click and verify new tab opens
      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        tiktokLink.click(),
      ]);
      
      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('tiktok.com');
      await newPage.close();
    } else {
      // No TikTok links — this is valid if shop has no videos
      test.info().annotations.push({ type: 'info', description: 'No TikTok links found for this shop' });
    }
    
    await page.screenshot({ path: 'test-results/tc02-tiktok-link.png' });
  });

  test('TC-03: Verify TikTok videos display correctly', async ({ page }) => {
    // Click on first shop
    const firstShop = page.locator('[data-testid="shop-card"]').first();
    await firstShop.click();
    
    await page.waitForURL(/\/shop\//, { timeout: 10000 });
    
    // Check for TikTok video embeds or links
    const tiktokElements = page.locator('[data-testid="tiktok-video"], a[href*="tiktok.com"]').all();
    
    // Either we have TikTok content or a "no videos" message
    const hasTiktokContent = (await tiktokElements).length > 0;
    const hasNoVideosMessage = await page.getByText(/no.*video|ไม่มี.*วิดีโอ/i).isVisible().catch(() => false);
    
    expect(hasTiktokContent || hasNoVideosMessage).toBeTruthy();
    
    await page.screenshot({ path: 'test-results/tc03-tiktok-display.png' });
  });

});
