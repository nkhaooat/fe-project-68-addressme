# 🕯️ Dungeon Inn — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/Redux-Toolkit-764ABC?style=for-the-badge&logo=redux" alt="Redux">
</p>

<p align="center">
  <em>A dark, atmospheric massage reservation system with a fantasy tavern aesthetic.</em>
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
- 🔒 **Change Password** — from the top menu dropdown
- 🏪 **Browse Shops** — search, filter, view TikTok previews
- 💆 **Book Services** — reserve massage sessions with service selection
- 📋 **My Bookings** — view, edit, cancel reservations
- ⭐ **Leave Reviews** — star rating + comment on completed bookings
- 🤖 **AI Chatbot** — get recommendations and book via natural language

### Admin Features
- 👑 **Manage Bookings** — view, edit, delete any reservation
- 🏪 **Manage Shops** — create, update, delete shops + TikTok links
- 💆 **Manage Services** — create, update, delete services
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
- **Hosting:** Vercel

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
git clone https://github.com/2110503-CEDT68/se-project-fe-68-2-namthom.git
cd se-project-fe-68-2-namthom
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
│   │   ├── shops/          # Shop listing page
│   │   └── shop/[id]/      # Shop detail + reviews
│   ├── admin/
│   │   ├── bookings/       # Admin booking management
│   │   ├── shops/          # Admin shop management
│   │   └── services/       # Admin service management
│   ├── booking/            # Create reservation
│   ├── mybookings/         # User's reservations + reviews
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── forgot-password/    # Forgot password page
│   ├── reset-password/     # Reset password page
│   ├── layout.tsx          # Root layout (TopMenu + ChatWidget)
│   └── page.tsx            # Home page
├── components/
│   ├── TopMenu.tsx          # Navigation + user dropdown
│   ├── ChatWidget.tsx       # Floating AI chatbot
│   ├── ReviewModal.tsx      # Star rating + review form
│   └── EditBookingModal.tsx # Edit reservation modal
├── libs/
│   ├── auth.ts              # Auth API calls
│   ├── shops.ts             # Shop API calls
│   ├── reservations.ts      # Reservation API calls
│   └── services.ts          # Service API calls
├── redux/
│   ├── store.ts
│   ├── ReduxProvider.tsx
│   └── features/authSlice.ts
└── interface.ts             # TypeScript interfaces
```

---

## 🔌 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with featured shops |
| `/shops` | Browse all massage shops |
| `/shop/[id]` | Shop detail with services, TikTok links, reviews |
| `/booking` | Create a reservation |
| `/mybookings` | View and manage own reservations |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password via token |
| `/admin/bookings` | Admin — all reservations |
| `/admin/shops` | Admin — shop management |
| `/admin/services` | Admin — service management |

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

## 📝 License

This project is part of the SW Dev Practice 2 course (2110503), Chulalongkorn University.

---

<p align="center">
  <em>Find your sanctuary in the dark. 🕯️</em>
</p>
