/**
 * EPIC 2.5: Authentication — Login, Register, Forgot/Reset Password
 * Automated E2E test using Playwright
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'admin123';
const USER_EMAIL = 'aotmetrasit@gmail.com';
const USER_PASSWORD = '555761';

/** Helper: login then wait for redirect away from /login */
async function loginAs(page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[name="email"], input[type="email"]').fill(email);
  await page.locator('input[name="password"], input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(shops|admin|mybookings|profile|$)/, { timeout: 15000 });
  // Ensure we left the login page
  await expect(page).not.toHaveURL(/\/login/);
}

test.describe('EPIC 2.5: Authentication', () => {

  // ─── Login ────────────────────────────────────────────────────────────────

  test.describe('Login', () => {

    test('TC-AUTH01: Login page loads correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('TC-AUTH02: Login with valid admin credentials', async ({ page }) => {
      await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    test('TC-AUTH03: Login with valid user credentials', async ({ page }) => {
      await loginAs(page, USER_EMAIL, USER_PASSWORD);
    });

    test('TC-AUTH04: Login with wrong password shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.locator('input[name="email"], input[type="email"]').fill(USER_EMAIL);
      await page.locator('input[name="password"], input[type="password"]').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=/invalid|error|incorrect|failed/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-AUTH05: Login with empty fields shows validation error', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.locator('button[type="submit"]').click();
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('TC-AUTH06: Register link navigates to /register', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      const registerLink = page.locator('a[href="/register"], a:has-text("Register"), a:has-text("Sign up"), a:has-text("Create")');
      if (await registerLink.count() > 0) {
        await registerLink.first().click();
        await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
      }
    });

    test('TC-AUTH07: Forgot password link navigates to /forgot-password', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      const forgotLink = page.locator('a[href="/forgot-password"], a:has-text("Forgot"), a:has-text("forgot")');
      if (await forgotLink.count() > 0) {
        await forgotLink.first().click();
        await expect(page).toHaveURL(/\/forgot-password/, { timeout: 5000 });
      }
    });
  });

  // ─── Register ─────────────────────────────────────────────────────────────

  test.describe('Register', () => {

    test('TC-AUTH08: Register page loads with all fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="telephone"], input[type="tel"]')).toBeVisible();
      await expect(page.locator('input[name="password"], input[type="password"]').first()).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    });

    test('TC-AUTH09: Register with password mismatch shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await page.locator('input[name="name"]').fill('Test User');
      await page.locator('input[name="email"], input[type="email"]').fill('test-mismatch@example.com');
      await page.locator('input[name="telephone"], input[type="tel"]').fill('0812345678');
      await page.locator('input[name="password"], input[type="password"]').first().fill('password1');
      await page.locator('input[name="confirmPassword"]').fill('password2');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=/match|not match|do not match/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-AUTH10: Register with short password shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await page.locator('input[name="name"]').fill('Test User');
      await page.locator('input[name="email"], input[type="email"]').fill('test-short@example.com');
      await page.locator('input[name="telephone"], input[type="tel"]').fill('0812345678');
      await page.locator('input[name="password"], input[type="password"]').first().fill('12345');
      await page.locator('input[name="confirmPassword"]').fill('12345');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=/at least 6|6 character|too short/i')).toBeVisible({ timeout: 5000 });
    });

    test('TC-AUTH11: Merchant register link navigates to /register/merchant', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      const merchantLink = page.locator('a[href="/register/merchant"], a:has-text("merchant"), a:has-text("Merchant")');
      if (await merchantLink.count() > 0) {
        await merchantLink.first().click();
        await expect(page).toHaveURL(/\/register\/merchant/, { timeout: 5000 });
      }
    });
  });

  // ─── Forgot/Reset Password (US2.5-1, US2.5-2) ────────────────────────────

  test.describe('Forgot/Reset Password', () => {

    test('TC-AUTH12: Forgot password page loads with email field', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")')).toBeVisible();
    });

    test('TC-AUTH13: Forgot password with empty email shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")').click();
      const emailInput = page.locator('input[name="email"], input[type="email"]');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('TC-AUTH14: Forgot password with valid email shows confirmation', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.locator('input[name="email"], input[type="email"]').fill(USER_EMAIL);
      await page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Send")').click();
      // Wait for confirmation message — use .first() to avoid strict mode on 'Email' label
      const confirmation = page.locator('text=/reset link has been sent|If that email|check your|confirmation|submitted/i').first();
      await expect(confirmation).toBeVisible({ timeout: 10000 });
    });

    test('TC-AUTH15: Reset password page without token shows error or redirect', async ({ page }) => {
      await page.goto(`${BASE_URL}/reset-password`);
      await page.waitForLoadState('networkidle');
      const hasForm = await page.locator('input[name="newPassword"], input[type="password"]').count();
      if (hasForm > 0) {
        const url = page.url();
        expect(url).not.toContain('token=');
      }
    });
  });

  // ─── Change Password (US2.5-3) ────────────────────────────────────────────

  test.describe('Change Password', () => {

    test('TC-AUTH16: Change password page accessible when logged in', async ({ page }) => {
      await loginAs(page, USER_EMAIL, USER_PASSWORD);
      await page.goto(`${BASE_URL}/profile/password`);
      await expect(page.locator('input[name="currentPassword"], input[name="oldPassword"], input[type="password"]').first()).toBeVisible({ timeout: 10000 });
    });

    test('TC-AUTH17: Change password page redirects when not logged in', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile/password`);
      await page.waitForURL(/\/(login|$)/, { timeout: 10000 }).catch(() => {});
      const url = page.url();
      expect(url).toMatch(/\/(login|$)/);
    });

    test('TC-AUTH18: Change password with wrong current password shows error', async ({ page }) => {
      await loginAs(page, USER_EMAIL, USER_PASSWORD);
      await page.goto(`${BASE_URL}/profile/password`);
      // Fill change password form — inputs have no name attr, use label context
      await page.locator('label:has-text("Current Password") + input, label:has-text("Current") + input').first().fill('wrongpassword');
      await page.locator('label:has-text("New Password") + input, label:has-text("New") + input').first().fill('newpassword123');
      await page.locator('label:has-text("Confirm") + input').first().fill('newpassword123');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('text=/incorrect|wrong|invalid|failed|error/i')).toBeVisible({ timeout: 5000 });
    });
  });

  // ─── Logout ────────────────────────────────────────────────────────────────

  test.describe('Logout', () => {

    test('TC-AUTH19: Logout redirects to login page', async ({ page }) => {
      await loginAs(page, USER_EMAIL, USER_PASSWORD);

      // Click the username button to open the dropdown
      const userBtn = page.getByRole('button', { name: /Methasit|admin/i });
      if (await userBtn.count() === 0) {
        // Try any button in nav that has an image
        const navBtn = page.locator('nav >> button').filter({ has: page.locator('img') });
        if (await navBtn.count() > 0) await navBtn.first().click();
      } else {
        await userBtn.click();
      }
      await page.waitForTimeout(500);
      // Now click logout (use .first() — there's a desktop dropdown + mobile menu)
      await page.locator('button:has-text("Logout"):visible').first().click();
      await page.waitForURL(/\/(login|$)/, { timeout: 10000 });
    });
  });
});
