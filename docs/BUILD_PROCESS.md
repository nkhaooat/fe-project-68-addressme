# Dungeon Inn Frontend - Build Process Documentation

## Project Overview
**Theme:** Dungeon Inn - Dark fantasy tavern aesthetic
**Tech Stack:** Next.js 14 + TypeScript + Tailwind CSS + Redux + Material UI
**Backend:** https://be-project-68-bitkrub.onrender.com
**Frontend Repo:** https://github.com/nkhaooat/fe-project-68-addressme

---

## Contributors
1. **Oat** <aotmetrasit@gmail.com>
2. **Tonkaw** <chatchapon675@gmail.com>
3. **natthadonwin123** <natthadonwin123@gmail.com>

---

## Sprint 1 - Core Features + AI Chatbot + Password Reset

### Step 1: Project Setup
```bash
npx create-next-app@latest fe-project-68-addressme-folk --typescript --tailwind --eslint --app --src-dir
npm install @reduxjs/toolkit react-redux axios
```

### Step 2: Design System
- Dark theme: `#1A1A1A` bg, `#2B2B2B` cards, `#403A36` borders
- Accent: `#E57A00`
- Text: `#F0E5D8` / `#D4CFC6` / `#A88C6B` / `#8A8177`

### Step 3: EPIC 1 - TikTok Video Display
- Shop detail page (`/shops/[id]`) renders TikTok video links from `MassageShop.tiktokLinks`
- Admin shops page (`/admin/shops`) has TikTok link management (add/edit/delete)

### Step 4: EPIC 2 - AI Chatbot Widget
- Floating widget (`ChatWidget.tsx`) bottom-right
- RAG-based: OpenAI embeddings + vector store
- Shop pinning, booking/cancel/edit action tokens (`[[BOOK:...]]`, `[[CANCEL:...]]`, `[[EDIT:...]]`)
- History summarization (>10 messages), bilingual error messages
- Merchant awareness in system prompt

### Step 5: EPIC 2.5 - Password Management
- `/forgot-password` - request reset email
- `/reset-password?token=...` - set new password (15-min token)
- User dropdown "Change Password" card

---

## Sprint 2 - Promotions + Reviews + QR + Email + Merchant + Scanner

### Step 6: EPIC 3 - Google Places Image Fallback
- Shop images load from Google Places API
- Fallback to `photo` field in MongoDB when API unavailable
- Works on both customer `/shops` and admin `/admin/shops`

### Step 7: EPIC 4 - Promotions + Payment Slips
- `/booking` page: promotion code input with discount calculation
- Payment slip upload after booking
- `/admin/promotions`: CRUD for promotion codes
- `/admin/bookings`: approve/reject uploaded slips

### Step 8: EPIC 5 - Reviews
- Review form on completed bookings (star rating + comment)
- One review per booking enforcement
- `/admin/reviews`: view all reviews, delete inappropriate ones
- Reviews displayed on shop detail page

### Step 9: EPIC 6 - QR Code + Brevo Email
- Booking success modal shows QR code with download button
- `/mybookings`: "Show QR" button for active bookings; inactive/expired state
- Confirmation email with QR image on booking creation
- Completion email with review deep-link (`/review?reservationId=...`)
- Cancellation email + QR void notification

### Step 10: EPIC 6.5 - My Bookings Styling
- Status filter tags (All/Pending/Confirmed/Completed/Cancelled)
- Search bar for easy navigation

### Step 11: EPIC 7 - Merchant Role + Admin Approval
- `/register/merchant`: merchant registration with shop search dropdown
- `/admin/merchants`: approve/reject merchant accounts with status counts
- Merchant-only routes protected by `requireMerchant` middleware
- Merchant registration email notification to admin

### Step 12: EPIC 8 - Merchant Dashboard
- `/merchant`: overview tab with shop stats (total/pending/today reservations)
- `/merchant/shop`: edit shop details (name, address, phone, hours, description)
- `/merchant/services`: CRUD for shop services (add, edit inline, delete with confirm)
- `/merchant` reservations tab: paginated list with status filters
- Sidebar nav: Dashboard, My Shop, Services, Reservations, Scan QR

### Step 13: EPIC 9 - QR Scanner (Browser Camera)
- `/merchant/scan`: camera-based QR scanning using `html5-qrcode`
- Rear camera preferred; friendly permission denied message
- Green overlay "Session Confirmed" on valid scan
- Red overlay with error on invalid/expired QR
- "Scan another" reset button
- HTTPS required for camera access (see `docs/MERCHANT_SCANNER.md`)

---

## API Endpoints (Backend)

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/v1/shops` | GET, POST | List/create shops |
| `/api/v1/shops/:id` | GET, PUT, DELETE | Shop CRUD |
| `/api/v1/services` | GET, POST | List/create services |
| `/api/v1/services/:id` | GET, PUT, DELETE | Service CRUD |
| `/api/v1/auth` | POST /register, /login, /logout | Auth |
| `/api/v1/auth/me` | GET | Current user (with merchantShop populate) |
| `/api/v1/auth/forgotpassword` | POST | Request reset email |
| `/api/v1/auth/resetpassword` | PUT | Reset with token |
| `/api/v1/auth/updatepassword` | PUT | Change password |
| `/api/v1/reservations` | GET, POST | List/create reservations |
| `/api/v1/reservations/:id` | GET, PUT, DELETE | Reservation CRUD |
| `/api/v1/chat` | POST | AI chatbot (RAG) |
| `/api/v1/chat/rebuild` | POST | Rebuild vector store |
| `/api/v1/reviews` | GET, POST | List/create reviews |
| `/api/v1/reviews/:id` | GET, DELETE | Review detail/delete |
| `/api/v1/promotions` | GET, POST | List/create promotions |
| `/api/v1/promotions/:id` | PUT, DELETE | Promotion update/delete |
| `/api/v1/qr/verify/:token` | GET | Verify QR token |
| `/api/v1/qr/:token` | GET | QR code page |
| `/api/v1/admin/merchants` | GET, PATCH | List/approve/reject merchants |
| `/api/v1/merchant/dashboard` | GET | Merchant dashboard stats |
| `/api/v1/merchant/shop` | PUT | Update own shop |
| `/api/v1/merchant/services` | GET, POST | List/create own services |
| `/api/v1/merchant/services/:id` | PUT, DELETE | Update/delete own service |
| `/api/v1/merchant/reservations` | GET | List own shop reservations |
| `/api/v1/merchant/qr/scan` | POST | Scan and verify QR |

---

## Frontend Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/shops` | Shop listing with search |
| `/shops/[id]` | Shop detail + TikTok videos + reviews |
| `/booking` | Create reservation + promo code + slip upload |
| `/mybookings` | User bookings with status filters + QR |
| `/login` | Login |
| `/register` | Customer registration |
| `/register/merchant` | Merchant registration |
| `/forgot-password` | Request password reset |
| `/reset-password` | Reset password with token |
| `/review` | Leave review (deep-link from email) |
| `/qr/[token]` | QR code display page |
| `/admin/shops` | Admin shop management |
| `/admin/services` | Admin service management |
| `/admin/bookings` | Admin booking/slip verification |
| `/admin/merchants` | Admin merchant approval |
| `/admin/promotions` | Admin promotion management |
| `/merchant` | Merchant dashboard (overview/reservations/scan tabs) |
| `/merchant/shop` | Edit own shop |
| `/merchant/services` | Manage own services |
| `/merchant/scan` | QR scanner (camera) |

---

## Project Structure
```
src/
  app/
    admin/          # Admin pages
    booking/        # Reservation creation
    login/          # Auth pages
    register/
    forgot-password/
    reset-password/
    merchant/       # Merchant pages
      shop/
      services/
      scan/
    mybookings/     # User bookings
    qr/[token]/     # QR display
    review/         # Review deep-link
    shops/[id]/     # Shop detail
  components/
    ChatWidget.tsx  # AI chatbot floating widget
    ReviewModal.tsx # Review form modal
    TopMenu.tsx     # Navigation
  libs/
    auth.ts         # API functions
    config.ts       # API_URL
  redux/
    store.ts
    authSlice.ts
```
