/**
 * TikTok URL Validation — E2E test
 *
 * Tests strict URL validation when adding TikTok links in /admin/shops
 * to prevent XSS injection and invalid URL acceptance.
 *
 * TC-TK-VAL-01: Valid TikTok URL is accepted
 * TC-TK-VAL-02: URL without https:// is rejected
 * TC-TK-VAL-03: URL with spaces is rejected
 * TC-TK-VAL-04: URL with XSS script tag is rejected
 * TC-TK-VAL-05: URL with XSS quote injection is rejected
 * TC-TK-VAL-06: Non-TikTok URL is rejected
 * TC-TK-VAL-07: Add button is disabled for invalid URLs
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Admin credentials
const ADMIN_EMAIL = 'admin@dungeon.com';
const ADMIN_PASSWORD = 'admin1234';

// Known shop with TikTok data
const SHOP_ID = '69be50224f7d836470ed1a66';

test.describe('TikTok URL Validation (Admin Shops)', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');

    // Navigate to admin shops
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');

    // Open the edit modal for the first shop that has TikTok
    const editBtn = page.locator('button:has-text("Edit")').first();
    await expect(editBtn).toBeVisible({ timeout: 10000 });
    await editBtn.click();
    await page.waitForTimeout(500);

    // Wait for modal to open — look for TikTok section
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    await expect(tiktokInput).toBeVisible({ timeout: 10000 });
  });

  test('TC-TK-VAL-01: Valid TikTok URL is accepted', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Type a valid TikTok URL
    await tiktokInput.fill('https://www.tiktok.com/@test_user/video/9999999999999999999');

    // Add button should be enabled
    await expect(addBtn).toBeEnabled();

    // Click Add — should succeed (no error toast)
    await addBtn.click();
    await page.waitForTimeout(1000);

    // Should NOT show an error toast
    const errorToast = page.locator('[class*="toast"]').filter({ hasText: /invalid|Invalid|failed|Failed/ });
    await expect(errorToast).not.toBeVisible({ timeout: 2000 });

    // The URL should appear in the TikTok links list
    const linkItem = page.locator('div:has(> a[href*="tiktok.com/@test_user"])');
    await expect(linkItem).toBeVisible({ timeout: 3000 });

    // Clean up: remove the test link
    const removeBtn = linkItem.locator('button:has-text("Remove")');
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      const confirmBtn = page.locator('button:has-text("Remove TikTok Link")');
      if (await confirmBtn.isVisible()) await confirmBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('TC-TK-VAL-02: URL without https:// is rejected', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Type URL without https://
    await tiktokInput.fill('tiktok.com/@user/video/123');

    // Add button should be disabled
    await expect(addBtn).toBeDisabled();
  });

  test('TC-TK-VAL-03: URL with spaces is rejected', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Type URL with spaces
    await tiktokInput.fill('Video 1 tiktok.com');

    // Add button should be disabled
    await expect(addBtn).toBeDisabled();

    // Also try space inside URL
    await tiktokInput.fill('https://www.tiktok.com/@user/video 123');
    await expect(addBtn).toBeDisabled();
  });

  test('TC-TK-VAL-04: URL with XSS script tag is rejected', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Type URL with <script> tag
    await tiktokInput.fill('https://www.tiktok.com/@user/video/123<script>alert(1)</script>');

    // Add button should be disabled
    await expect(addBtn).toBeDisabled();

    // Try img onerror variant
    await tiktokInput.fill('https://www.tiktok.com/@user/video/123"><img src=x onerror=alert(1)>');
    await expect(addBtn).toBeDisabled();
  });

  test('TC-TK-VAL-05: URL with XSS quote injection is rejected', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Type URL with double quote injection
    await tiktokInput.fill('https://www.tiktok.com/@user/video/123"onload="alert(1)');

    // Add button should be disabled
    await expect(addBtn).toBeDisabled();

    // Try single quote variant
    await tiktokInput.fill("https://www.tiktok.com/@user/video/123'onclick='alert(1)");
    await expect(addBtn).toBeDisabled();
  });

  test('TC-TK-VAL-06: Non-TikTok URL is rejected', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // YouTube URL
    await tiktokInput.fill('https://www.youtube.com/watch?v=123');
    await expect(addBtn).toBeDisabled();

    // Random URL
    await tiktokInput.fill('https://example.com');
    await expect(addBtn).toBeDisabled();

    // javascript: protocol
    await tiktokInput.fill('javascript:alert(1)');
    await expect(addBtn).toBeDisabled();
  });

  test('TC-TK-VAL-07: Add button enabled/disabled state toggles correctly', async ({ page }) => {
    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    const addBtn = page.locator('button:has-text("Add")').first();

    // Empty input — disabled
    await tiktokInput.fill('');
    await expect(addBtn).toBeDisabled();

    // Invalid — disabled
    await tiktokInput.fill('tiktok.com');
    await expect(addBtn).toBeDisabled();

    // Valid — enabled
    await tiktokInput.fill('https://tiktok.com/@user/video/123');
    await expect(addBtn).toBeEnabled();

    // Back to invalid — disabled
    await tiktokInput.fill('https://youtube.com');
    await expect(addBtn).toBeDisabled();

    // Valid again with www — enabled
    await tiktokInput.fill('https://www.tiktok.com/@user/video/456');
    await expect(addBtn).toBeEnabled();
  });

});
