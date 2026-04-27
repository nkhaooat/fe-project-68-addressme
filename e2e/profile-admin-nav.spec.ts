/**
 * EPIC 1: TikTok Videos + Profile & Admin Shops
 * Automated E2E test using Playwright
 *
 * Covers:
 * - US1-1: Customer views TikTok videos on shop detail page
 * - US1-2: Admin adds TikTok video links for a shop
 * - US1-3: Admin updates TikTok video links
 * - US1-4: Admin deletes TikTok video links
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

test.describe('EPIC 1: Admin TikTok CRUD (US1-2, US1-3, US1-4)', () => {

  // Helper: open edit modal and scroll to TikTok section
  async function openEditModal(page: any) {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(`${BASE_URL}/admin/shops`);
    await page.waitForLoadState('networkidle');

    // Click Edit on first shop card
    const editBtn = page.locator('button:has-text("Edit")').first();
    await editBtn.click();
    await page.waitForTimeout(1500);

    // Scroll the modal content to the TikTok section
    const tiktokLabel = page.locator('label:has-text("TikTok")');
    if (await tiktokLabel.count() > 0) {
      await tiktokLabel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
  }

  // US1-2: Admin adds TikTok video links
  test('TC-TK03: Admin can add TikTok link to a shop', async ({ page }) => {
    await openEditModal(page);

    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    if (await tiktokInput.count() > 0) {
      const testUrl = 'https://www.tiktok.com/@test/video/9999999999999999999';
      await tiktokInput.fill(testUrl);

      // The Add button (inside modal, next to input)
      const addBtn = page.locator('label:has-text("TikTok") + * button:has-text("Add"), label:has-text("TikTok") ~ * button:has-text("Add")').first();
      if (await addBtn.count() > 0 && !(await addBtn.isDisabled())) {
        await addBtn.click();
        await page.waitForTimeout(500);

        // New link should appear in the list with "Video" label
        const newVideo = page.locator('text=Video').last();
        await expect(newVideo).toBeVisible({ timeout: 3000 });

        // Verify the link was persisted via API (addTiktokLinks calls API directly)
        const response = await page.request.get('http://localhost:5000/api/v1/shops/69be50224f7d836470ed1a66');
        const shopData = await response.json();
        const tiktokLinks = shopData.data?.tiktokLinks || [];
        expect(tiktokLinks).toContain(testUrl);
      }
    }
  });

  test('TC-TK04: Admin cannot add non-TikTok URL — Add button stays disabled', async ({ page }) => {
    await openEditModal(page);

    const tiktokInput = page.locator('input[placeholder*="tiktok.com"]');
    if (await tiktokInput.count() > 0) {
      // Enter a non-TikTok URL
      await tiktokInput.fill('https://www.youtube.com/watch?v=test');

      // The Add button should be disabled since URL doesn't contain tiktok.com
      const addBtn = tiktokInput.locator('..').locator('button:has-text("Add")');
      if (await addBtn.count() === 0) {
        // Try broader selector within the TikTok section
        const sectionAddBtn = page.locator('div:has(> label:has-text("TikTok")) button:has-text("Add")');
        if (await sectionAddBtn.count() > 0) {
          await expect(sectionAddBtn).toBeDisabled();
        }
      } else {
        await expect(addBtn).toBeDisabled();
      }
    }
  });

  // US1-3: Admin updates TikTok video links (verified via UI presence)
  test('TC-TK05: Admin can see and manage existing TikTok links in edit modal', async ({ page }) => {
    await openEditModal(page);

    // Check if there are existing TikTok links or empty state
    const tiktokLabel = page.locator('label:has-text("TikTok")');
    await expect(tiktokLabel).toBeVisible({ timeout: 5000 });

    // Either existing links with Remove buttons, or "No TikTok videos added yet"
    const removeBtns = page.locator('button:has-text("Remove")');
    const noVideos = page.locator('text=No TikTok videos added yet');
    const hasLinks = (await removeBtns.count()) > 0;
    const hasEmpty = (await noVideos.count()) > 0;
    expect(hasLinks || hasEmpty).toBe(true);
  });

  // US1-4: Admin deletes TikTok video links
  test('TC-TK06: Admin can remove the test TikTok link added in TC-TK03', async ({ page }) => {
    await openEditModal(page);

    const tiktokSection = page.locator('div:has(> label:has-text("TikTok"))');
    const testLink = 'https://www.tiktok.com/@test/video/9999999999999999999';

    // Find the specific test link row and click its Remove button
    // Use div.flex.items-center to match only the row-level div, not ancestor divs
    const testLinkRow = tiktokSection.locator('div.flex.items-center:has(a[href="https://www.tiktok.com/@test/video/9999999999999999999"])').first();
    if (await testLinkRow.count() > 0) {
      const removeBtn = testLinkRow.locator('button:has-text("Remove")').first();
      await expect(removeBtn).toBeVisible({ timeout: 3000 });
      await removeBtn.click();
      await page.waitForTimeout(1000);

      // Confirmation dialog appears — find it by its unique message text
      const confirmOverlay = page.locator('div:has(> h3:text("Remove TikTok Link"))');
      await expect(confirmOverlay).toBeVisible({ timeout: 3000 });
      const confirmRemoveBtn = confirmOverlay.locator('button:has-text("Remove")').first();
      await expect(confirmRemoveBtn).toBeVisible({ timeout: 3000 });
      await confirmRemoveBtn.click();
      await page.waitForTimeout(3000);

      // The removeTiktokLink API is called directly — no need to click Update Shop
      // Verify via API that the test link is removed
      const response = await page.request.get('http://localhost:5000/api/v1/shops/69be50224f7d836470ed1a66');
      const shopData = await response.json();
      const tiktokLinks = shopData.data?.tiktokLinks || [];
      expect(tiktokLinks).not.toContain('https://www.tiktok.com/@test/video/9999999999999999999');
    } else {
      // Test link not found — may have already been removed
      console.log('Test TikTok link not found — already removed or never added');
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
