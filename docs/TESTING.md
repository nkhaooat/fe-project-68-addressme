# Testing Guide — Frontend

## Prerequisites

- Node.js 18+
- Backend API running (locally or at `https://be-project-68-bitkrub.onrender.com`)
- Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`

```bash
npm install
npm run dev    # start dev server on :3000
```

---

## 1. E2E Tests (Playwright)

### Install browsers (first time only)

```bash
npx playwright install
```

### Run all tests

```bash
npx playwright test
```

### Test Coverage

| Spec | File | What It Tests |
|------|------|---------------|
| Auth | `auth.spec.ts` | Register, login, logout, protected routes |
| Chatbot | `chatbot.spec.ts` | AI chat widget, streaming responses, booking via chat |
| Google Places & Reviews | `google-places-reviews.spec.ts` | Shop images from Google, review submission & display |
| Merchant | `merchant.spec.ts` | Merchant dashboard, service CRUD, reservation management |
| Profile & Admin Nav | `profile-admin-nav.spec.ts` | Profile page, admin sidebar navigation |
| Promotions & QR | `promotions-qr.spec.ts` | Promo code apply, QR code display & download |
| TikTok | `tiktok-epic.spec.ts` | TikTok video preview button visibility |
| TikTok URL Validation | `tiktok-url-validation.spec.ts` | Valid/invalid TikTok URL handling |

### Run a single spec

```bash
npx playwright test e2e/auth.spec.ts
```

### Run with UI (interactive debug)

```bash
npx playwright test --ui
```

### Run against production

```bash
PLAYWRIGHT_BASE_URL=https://fe-project-68-addressme.vercel.app npx playwright test
```

### View HTML report

```bash
npx playwright show-report
```

---

## 2. Docker Smoke Test

```bash
# Build and start
docker compose up -d --build

# Check it's running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200

# View logs
docker compose logs web

# Tear down
docker compose down
```

---

## 3. Manual Testing Checklist

### Customer Flow
- [ ] Register a new account
- [ ] Login
- [ ] Browse shops — search, filter by area
- [ ] View shop detail — services, TikTok link, reviews
- [ ] Book a service — select date/time, apply promo code
- [ ] Upload payment slip
- [ ] View My Bookings — filter by status
- [ ] Download QR code for a booking
- [ ] Leave a review on a completed booking
- [ ] Chat with AI chatbot — ask for recommendations
- [ ] Change password from profile

### Merchant Flow
- [ ] Register as merchant
- [ ] Login as merchant
- [ ] View dashboard + reservations
- [ ] Edit shop details
- [ ] Add / edit / delete own services
- [ ] Scan customer QR code

### Admin Flow
- [ ] Login as admin
- [ ] Approve/reject payment slips
- [ ] Create / edit / delete shops
- [ ] Create / edit / delete services
- [ ] Create / delete promotion codes
- [ ] Approve/reject merchant registrations
- [ ] Rebuild chatbot embeddings

### Edge Cases
- [ ] Forgot password → reset via email link
- [ ] Try accessing admin/merchant pages as regular user → access denied
- [ ] Cancel a booking within 1-day cutoff → should be blocked
- [ ] Apply expired/invalid promo code → error message
