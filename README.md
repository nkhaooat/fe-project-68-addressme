# 🕯️ Dungeon Inn — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux" alt="Redux">
</p>

<p align="center">
  <em>A dark, atmospheric massage reservation system with AI chatbot, QR workflow, promotions, and merchant dashboard.</em>
</p>

---

## 🌐 Live Demo

| Environment | URL |
|-------------|-----|
| **Frontend** | https://fe-project-68-addressme.vercel.app/ |
| **Backend API** | https://be-project-68-bitkrub.onrender.com |
| **Figma Prototype** | [View on Figma](https://www.figma.com/proto/RyVeACUvZUCR9E9dsmbOSk/Message_addressMe?node-id=0-1&t=ZXDyNDPP7iw5JdW6-1) |

---

## ✨ Features

### Customer Features
- 🔐 **Register / Login** — JWT-based authentication
- 🔑 **Forgot / Reset Password** — email link via Brevo
- 🔒 **Change Password** — from profile page
- 👤 **User Profile** — view and update profile info
- 🏪 **Browse Shops** — search, filter, view TikTok previews, Google Places images
- 💆 **Book Services** — reserve massage sessions with service selection
- 🎟️ **Promotion Codes** — apply discount before payment, see price breakdown
- 💳 **Payment Slip Upload** — upload slip image for admin verification
- 📋 **My Bookings** — status filter tabs, search, QR display, edit, cancel
- ⭐ **Leave Reviews** — star rating + comment on completed bookings
- 🔲 **QR Code** — view/download QR for each booking, hosted QR page
- 🤖 **AI Chatbot** — get recommendations and book via natural language (streaming)

### Merchant Features
- 📝 **Merchant Registration** — request service account for a shop
- 📊 **Merchant Dashboard** — sidebar navigation with route protection
- 🏪 **My Shop** — edit shop details
- 💆 **My Services** — CRUD (add, edit, delete) own services
- 📋 **My Reservations** — filter by status, update status (confirm/complete/cancel)
- 📷 **QR Scanner** — browser camera to scan customer QR codes
- ✅ **Scan Result** — green overlay (confirmed) / red overlay (invalid)

### Admin Features
- 👑 **Manage Bookings** — view, approve/reject payment slips
- 🏪 **Manage Shops** — create, update, delete shops + TikTok links
- 💆 **Manage Services** — create, update, delete services
- 🎟️ **Manage Promotions** — create, delete promotion codes
- 👥 **Manage Merchants** — approve/reject merchant registrations
- 🤖 **Rebuild Chatbot** — refresh AI knowledge base from admin panel

---

## 🎨 Theme

**Dungeon Inn** — a cozy, fire-lit tavern aesthetic

| Element | Color | Usage |
|---------|-------|-------|
| Primary Header | `#2C1E18` | Navigation background |
| Page Background | `#1A1A1A` | Canvas |
| Surface | `#2B2B2B` | Cards, modals |
| Accent | `#E57A00` | Buttons, highlights |
| Heading Text | `#F0E5D8` | Titles |
| Body Text | `#D4CFC6` | Paragraphs |
| Muted Text | `#8A8177` | Labels, hints |

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Redux Toolkit
- **Auth:** JWT (stored in Redux + sessionStorage)
- **QR:** qrcode.react + browser camera (html5-qrcode/jsQR)
- **Hosting:** Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/nkhaooat/fe-project-68-addressme.git
cd fe-project-68-addressme
npm install
```

### Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://be-project-68-bitkrub.onrender.com/api/v1
```

Or for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Run

```bash
npm run dev     # development on http://localhost:3000
npm run build   # production build
npm start       # production server
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (shop)/
│   │   ├── shops/              # Shop listing page
│   │   └── shop/[id]/          # Shop detail + reviews + QR
│   ├── admin/
│   │   ├── bookings/           # Admin booking + slip verification
│   │   ├── merchants/          # Admin merchant management
│   │   ├── promotions/         # Admin promotion CRUD
│   │   ├── services/           # Admin service management
│   │   ├── settings/           # Rebuild Embedding button
│   │   └── shops/              # Admin shop management
│   ├── booking/                # Create reservation + promo code
│   ├── merchant/
│   │   ├── page.tsx            # Merchant dashboard + reservations
│   │   ├── shop/               # Edit own shop
│   │   └── services/           # CRUD own services
│   ├── mybookings/             # User's reservations + QR + reviews
│   ├── privacy/                # Privacy policy page
│   ├── profile/                # User profile
│   │   └── password/           # Change password
│   ├── qr/[token]/             # Hosted QR code page
│   ├── register/
│   │   └── merchant/           # Merchant registration
│   ├── login/                  # Login page
│   ├── register/               # Register page
│   ├── forgot-password/        # Forgot password page
│   ├── reset-password/         # Reset password page
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   ├── layout.tsx              # Root layout (TopMenu + ChatWidget)
│   └── page.tsx                # Home page
├── components/
│   ├── TopMenu.tsx             # Navigation + user dropdown
│   ├── ChatWidget.tsx          # Floating AI chatbot (streaming)
│   ├── ReviewModal.tsx         # Star rating + review form
│   ├── EditBookingModal.tsx    # Edit reservation modal
│   ├── ShopImage.tsx           # Google Places image + fallback
│   ├── QRCodeDisplay.tsx       # QR code render + download
│   ├── QrScanner.tsx          # Browser camera QR scanner
│   ├── Pagination.tsx          # Shared pagination component
│   ├── SearchFilterBar.tsx     # Status filter + search
│   ├── ConfirmDialog.tsx       # Reusable confirm dialog
│   ├── AccessDenied.tsx        # 403 page for unauthorized
│   ├── ErrorBanner.tsx         # Shared error display
│   ├── Loading.tsx             # Shared loading spinner
│   ├── Skeletons.tsx           # Skeleton loaders with shimmer animation
│   ├── ToastContext.tsx         # Toast notification provider
│   ├── Footer.tsx              # Site footer
│   ├── admin/
│   │   ├── BookingCard.tsx     # Booking card with slip approve/reject
│   │   ├── ServiceCard.tsx     # Service card
│   │   ├── ServiceModal.tsx    # Service create/edit modal
│   │   ├── ShopCard.tsx        # Shop card
│   │   └── ShopModal.tsx       # Shop create/edit modal
│   └── merchant/
│       └── MerchantReservationCard.tsx  # Merchant reservation card
├── hooks/
│   └── useDebounce.ts          # Debounce hook for search
├── libs/
│   ├── api.ts                  # Shared API client
│   ├── auth.ts                 # Auth API calls
│   ├── shops.ts                # Shop API calls
│   ├── reservations.ts          # Reservation API calls
│   ├── services.ts             # Service API calls
│   ├── promotions.ts           # Promotion API calls
│   ├── reviews.ts              # Review API calls
│   └── config.ts               # API URL config
├── types/
│   ├── api.ts                  # Shared API types
│   ├── reservation.ts          # Reservation types
│   ├── review.ts               # Review types
│   ├── service.ts              # Service types
│   ├── shop.ts                 # Shop types
│   └── user.ts                 # User types
├── utils/
│   ├── chatActions.ts          # Chat action helpers
│   ├── reservationStatus.ts    # Status label/color utils
│   └── shopHours.ts            # Shop hours utils
├── redux/
│   ├── store.ts
│   ├── ReduxProvider.tsx
│   └── features/authSlice.ts
├── interface.ts                # Legacy TypeScript interfaces
└── globals.css                 # Tailwind + custom styles
```

---

## 🔌 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with featured shops |
| `/shops` | Browse all massage shops |
| `/shop/[id]` | Shop detail with services, TikTok links, reviews |
| `/booking` | Create a reservation + apply promotion code |
| `/mybookings` | View and manage own reservations + QR codes |
| `/qr/[token]` | Hosted QR code page |
| `/privacy` | Privacy policy |
| `/profile` | User profile |
| `/profile/password` | Change password |
| `/login` | Login |
| `/register` | Register |
| `/register/merchant` | Register as merchant |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password via token |
| `/admin/bookings` | Admin — all reservations + slip verification |
| `/admin/shops` | Admin — shop management |
| `/admin/services` | Admin — service management |
| `/admin/promotions` | Admin — promotion code management |
| `/admin/merchants` | Admin — approve/reject merchants |
| `/admin/settings` | Admin — rebuild embedding |
| `/merchant` | Merchant — dashboard + reservations + QR scanner |
| `/merchant/shop` | Merchant — edit own shop |
| `/merchant/services` | Merchant — CRUD own services |

---

## 🧪 Testing

### Playwright (E2E)
```bash
npx playwright test
```

Covers: authentication, shop listing, shop detail, TikTok button visibility, Google Places images, reviews, promotions, QR workflow, merchant dashboard, chatbot, profile & admin navigation.

---

## 👥 Contributors

| GitHub | Name |
|--------|------|
| [@nkhaooat](https://github.com/nkhaooat) | Methasit Phanawongwat |
| [@anupatcu111](https://github.com/anupatcu111) | Anupat Tubsri |
| [@TeerapatSardsud](https://github.com/TeerapatSardsud) | Teerapat Sardsud |
| [@wachiraphantisanthia](https://github.com/wachiraphantisanthia) | Wachiraphan Tisanthia |
| [@UpDowLR](https://github.com/UpDowLR) | Chatchapon Malayapun |
| [@wanderer5090](https://github.com/wanderer5090) | Natthadon Chairuangsirikul |
| [@Dziiit](https://github.com/Dziiit) | Itthipat Wongnoppawich |
| [@cppccpcp](https://github.com/cppccpcp) | Sarana Thanadeecharoenchok |
| [@DeoTTo883xd](https://github.com/DeoTTo883xd) | Atichat Saengmani |
| [@Zouyauwu](https://github.com/Zouyauwu) | Natchanon Maidee |

---

## 📧 Contact

For questions or data deletion requests: **aotmetrasit@gmail.com**

---

## 📝 License

This project is part of the Software Engineering course (2110423)
and Software Engineering Lab (2110426), Chulalongkorn University.

---

<p align="center">
  <em>Find your sanctuary in the dark. 🕯️</em>
</p>
