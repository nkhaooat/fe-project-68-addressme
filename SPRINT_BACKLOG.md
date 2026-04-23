# 📋 Sprint Backlog — Dungeon Inn Frontend

> **Project:** Dungeon Inn — Next.js Frontend
> **Repo:** fe-project-68-addressme-folk
> **Velocity unit:** man-hours (1 story point ≈ 1 hour for this project)

---

## Sprint 6 — QR Code Display + Email Trigger Integration

**Sprint Goal:** Surface the QR code to the user at every key reservation event. Users see their QR in the booking confirmation UI, in their "My Bookings" page, and receive corresponding emails. QR codes that are no longer valid are visually dimmed/crossed out.

**Duration:** 2 weeks

---

### 📦 Backlog Items

#### EPIC: QR Code UI + Reservation Email Events

---

**FE-S6-01 — QR code display component**
- **Type:** Frontend / Component
- **Description:** Create `src/components/QRCodeDisplay.tsx` — accepts a `token: string` and `active: boolean` prop. Renders a QR image (using `qrcode.react` package) with a greyed-out overlay + "Expired" badge when `active === false`.
- **Acceptance Criteria:**
  - `npm install qrcode.react` added
  - Active state: full-color QR, "Show to shop staff to confirm" label
  - Inactive state: greyscale + red "Expired / Cancelled" badge
  - Accessible: `alt` text on image, ARIA label
- **Estimate:** 3 h
- **Assignee:** Frontend dev

---

**FE-S6-02 — QR display in booking confirmation flow**
- **Type:** Frontend / Page
- **Description:** After a reservation is created via `POST /api/v1/reservations`, display a modal or dedicated success page that shows the QR code and a "Check your email" note.
- **Acceptance Criteria:**
  - Modal or `/booking/success?reservationId=...` page shows QR immediately after booking
  - Uses `QRCodeDisplay` component (FE-S6-01)
  - "Download QR" button: downloads PNG using `canvas.toDataURL()`
  - Smooth animation on appear (Tailwind transition)
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S6-03 — QR display in My Bookings page**
- **Type:** Frontend / Page
- **Description:** In `src/app/mybookings/page.tsx`, add a "Show QR" button per booking card. On click, opens a modal with `QRCodeDisplay`. Automatically renders as inactive when `qrActive === false`.
- **Acceptance Criteria:**
  - Each booking card has a "Show QR" button (hidden if status is `cancelled` or `completed`)
  - Modal overlay with close button
  - `qrActive` field read from API response
  - Cancelled/expired bookings show the expired QR state
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S6-04 — Update reservations lib to include QR fields**
- **Type:** Frontend / API lib
- **Description:** Update `src/libs/reservations.ts` typings and fetch calls to include `qrToken` and `qrActive` in `Reservation` interface.
- **Acceptance Criteria:**
  - `Reservation` interface in `src/interface.ts` updated: `qrToken?: string`, `qrActive?: boolean`
  - No breaking changes to existing booking/edit flows
- **Estimate:** 1 h
- **Assignee:** Frontend dev

---

**FE-S6-05 — Cancelled reservation email UX note**
- **Type:** Frontend / UX copy
- **Description:** When a user cancels a booking (in `EditBookingModal` or confirmation modal), show an inline note: "A cancellation confirmation has been sent to your email. Your QR code is now void."
- **Acceptance Criteria:**
  - Toast or inline alert fires after successful DELETE call
  - Note dismisses after 5 s
- **Estimate:** 1 h
- **Assignee:** Frontend dev

---

**FE-S6-06 — Review deep-link landing**
- **Type:** Frontend / Page
- **Description:** Create `src/app/review/[reservationId]/page.tsx` — deep-link target from the "leave a review" email. Loads the reservation, pre-fills the review modal, and shows a thank-you screen after submission.
- **Acceptance Criteria:**
  - Route `/review/:reservationId` accessible without login → redirects to login with `?next=` param
  - After login, auto-opens `ReviewModal` pre-filled with the reservation
  - Handles "already reviewed" case gracefully (show existing review)
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

### ⏱️ Sprint 6 Estimate Summary

| ID | Story | Est. (h) |
|----|-------|----------|
| FE-S6-01 | QR code display component | 3 |
| FE-S6-02 | QR on booking confirmation | 4 |
| FE-S6-03 | QR in My Bookings | 4 |
| FE-S6-04 | Reservation interface + lib update | 1 |
| FE-S6-05 | Cancel UX copy / toast | 1 |
| FE-S6-06 | Review deep-link page | 4 |
| **Total** | | **17 h** |

---

---

## Sprint 7 — Merchant Portal + QR Scanner

**Sprint Goal:** Build a separate Merchant-facing section of the app where approved merchant accounts can manage their shop, view reservations, and scan user QR codes using the browser camera to confirm sessions.

**Duration:** 2 weeks

---

### 📦 Backlog Items

#### EPIC: Merchant Self-Registration + Onboarding

---

**FE-S7-01 — Merchant registration page**
- **Type:** Frontend / Page
- **Description:** Create `src/app/merchant/register/page.tsx` — a form for merchant self-registration. Fields: name, email, telephone, password, shop selector (dropdown from `GET /api/v1/shops`), proof URL (link to document). Submits to `POST /api/v1/auth/register/merchant`.
- **Acceptance Criteria:**
  - Form validates all required fields client-side
  - Shop dropdown fetches live from API
  - On success: show "Your application is under review" screen
  - Link to this page is the target of the Linktree merchant entry
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S7-02 — Merchant pending / rejected state screen**
- **Type:** Frontend / UX
- **Description:** After merchant login with `merchantStatus !== 'approved'`, redirect to `src/app/merchant/status/page.tsx` showing pending/rejected status and instructions.
- **Acceptance Criteria:**
  - Pending screen: friendly "We're reviewing your application" with estimated time
  - Rejected screen: "Application rejected — contact support" with reason if available
  - Regular user routes inaccessible while in these states
- **Estimate:** 2 h
- **Assignee:** Frontend dev

---

#### EPIC: Merchant Dashboard

---

**FE-S7-03 — Merchant layout + nav**
- **Type:** Frontend / Layout
- **Description:** Create `src/app/merchant/layout.tsx` with a sidebar nav: Dashboard, My Shop, Services, Reservations, Scan QR. Protected by merchant role + approved status check. Separate from regular user TopMenu.
- **Acceptance Criteria:**
  - Merchant users going to `/merchant/*` see the merchant sidebar
  - Non-merchant users get 403 redirect
  - Mobile-responsive (collapsible sidebar or bottom nav)
- **Estimate:** 3 h
- **Assignee:** Frontend dev

---

**FE-S7-04 — Merchant: Edit own shop page**
- **Type:** Frontend / Page
- **Description:** `src/app/merchant/shop/page.tsx` — loads shop details from `GET /api/v1/merchant/shop`, renders editable form (name, description, address, open/close time, image URL), submits to `PUT /api/v1/merchant/shop`.
- **Acceptance Criteria:**
  - Form pre-filled from current shop data
  - Optimistic UI or loading state on submit
  - Success toast on save
  - Cannot change `shopId` or ownership
- **Estimate:** 3 h
- **Assignee:** Frontend dev

---

**FE-S7-05 — Merchant: Manage services**
- **Type:** Frontend / Page
- **Description:** `src/app/merchant/services/page.tsx` — table of services with Add / Edit / Delete actions. CRUD via merchant API routes.
- **Acceptance Criteria:**
  - Inline edit rows or modal editor
  - Delete requires confirmation dialog
  - Empty state: "No services yet — add one"
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S7-06 — Merchant: View shop reservations**
- **Type:** Frontend / Page
- **Description:** `src/app/merchant/reservations/page.tsx` — table of all reservations for the merchant's shop. Filter by status and date. Shows user name, service, time, status.
- **Acceptance Criteria:**
  - Status filter tabs: All / Pending / Confirmed / Completed / Cancelled
  - Date picker filter
  - Pagination (20 per page)
  - Row click → expand to show full detail
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

#### EPIC: QR Scanner (Browser Camera)

---

**FE-S7-07 — QR scanner component (browser camera)**
- **Type:** Frontend / Component
- **Description:** Create `src/components/QRScanner.tsx` using `@zxing/browser` or `html5-qrcode` library. Requests camera permission, streams video, decodes QR in real-time, fires `onScan(token)` callback.
- **Acceptance Criteria:**
  - `npm install html5-qrcode` (or `@zxing/browser`) added
  - Camera permission prompt handled gracefully (permission denied → friendly message)
  - Works on Chrome/Safari mobile and desktop
  - Decodes the QR token format from Sprint 6 (`{token, reservationId}` JSON or raw token string)
  - Stops camera stream when component unmounts
- **Estimate:** 5 h
- **Assignee:** Frontend dev

---

**FE-S7-08 — QR scan page + confirmation result UI**
- **Type:** Frontend / Page
- **Description:** `src/app/merchant/scan/page.tsx` — full-screen camera view with `QRScanner`. On successful decode, calls `GET /api/v1/reservations/verify-qr/:token`. Shows result: user name, service, date, status chip (confirmed / already confirmed / invalid).
- **Acceptance Criteria:**
  - Full-screen scanner view on mobile
  - Overlay: green flash + "✅ Session Confirmed" on valid scan
  - Red flash + error message on invalid/expired QR
  - "Scan another" button resets scanner
  - Supports both front and back camera toggle
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S7-09 — Camera permission & HTTPS note**
- **Type:** Frontend / DevOps / Docs
- **Description:** Document camera permission requirements (HTTPS required, no HTTP). Add a runtime check: if `window.isSecureContext === false`, show a banner "QR scanning requires a secure connection (HTTPS)".
- **Acceptance Criteria:**
  - Banner shown on non-HTTPS contexts
  - `MERCHANT_SCANNER.md` documents the HTTPS requirement for deployment
- **Estimate:** 1 h
- **Assignee:** Frontend dev / DevOps

---

**FE-S7-10 — Admin panel: merchant approval UI**
- **Type:** Frontend / Admin Page
- **Description:** `src/app/admin/merchants/page.tsx` — list of pending merchant applications. Shows name, email, shop name, proof URL link. Approve / Reject buttons. Status tabs: Pending / Approved / Rejected.
- **Acceptance Criteria:**
  - Admin-only route (redirects non-admins)
  - Approve/Reject buttons call respective API endpoints
  - Optimistic status update in UI
  - Proof URL opens in new tab
- **Estimate:** 4 h
- **Assignee:** Frontend dev

---

**FE-S7-11 — Redux / auth slice: support merchant role**
- **Type:** Frontend / State
- **Description:** Update `src/redux/features/authSlice.ts` to store `role`, `merchantStatus`, and `merchantShop` from the auth response. Add `isMerchant` and `isApprovedMerchant` selectors.
- **Acceptance Criteria:**
  - `isMerchant` = `role === 'merchant'`
  - `isApprovedMerchant` = `role === 'merchant' && merchantStatus === 'approved'`
  - Used by layout guards (FE-S7-03) and merchant registration flow
- **Estimate:** 2 h
- **Assignee:** Frontend dev

---

### ⏱️ Sprint 7 Estimate Summary

| ID | Story | Est. (h) |
|----|-------|----------|
| FE-S7-01 | Merchant registration page | 4 |
| FE-S7-02 | Pending / rejected state screens | 2 |
| FE-S7-03 | Merchant layout + nav | 3 |
| FE-S7-04 | Edit own shop page | 3 |
| FE-S7-05 | Manage services | 4 |
| FE-S7-06 | View shop reservations | 4 |
| FE-S7-07 | QR scanner component | 5 |
| FE-S7-08 | Scan page + result UI | 4 |
| FE-S7-09 | Camera permission docs + HTTPS check | 1 |
| FE-S7-10 | Admin: merchant approval UI | 4 |
| FE-S7-11 | Auth slice merchant support | 2 |
| **Total** | | **36 h** |

---

## 📊 Combined Velocity Overview

| Sprint | Focus | Total Est. |
|--------|-------|-----------|
| Sprint 6 | QR display + email UX | 17 h |
| Sprint 7 | Merchant portal + QR scanner | 36 h |
| **Grand Total** | | **53 h** |
