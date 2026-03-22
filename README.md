# 🕯️ Dungeon Inn

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

### User Features
- 🔐 **Authentication** - Register/Login with JWT
- 🏪 **Browse Shops** - View massage shops with details
- 📅 **Book Services** - Reserve massage sessions (max 3 active)
- 📋 **Manage Bookings** - View, edit, cancel own reservations
- 🎨 **Dark Theme** - Immersive Dungeon Inn aesthetic

### Admin Features
- 👑 **Admin Dashboard** - View all user bookings
- ✏️ **Manage Bookings** - Edit any reservation status
- 🗑️ **Delete Bookings** - Remove any reservation

---

## 🎨 Theme

**Dungeon Inn** - A cozy, fire-lit tavern atmosphere

| Element | Color | Usage |
|---------|-------|-------|
| Primary Header | `#2C1E18` | Navigation background |
| Canvas Background | `#1A1A1A` | Page background |
| Surface Background | `#2B2B2B` | Cards, modals |
| Accent | `#E57A00` | Buttons, highlights |
| Header Text | `#F0E5D8` | Titles, headings |
| Primary Text | `#D4CFC6` | Body text |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Redux Toolkit** - State management with persistence
- **Material UI** - Component library
- **Cinzel Font** - Medieval aesthetic typography

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Render** - Hosting

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nkhaooat/fe-project-68-addressme.git
cd fe-project-68-addressme

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (shop)/            # Shop-related routes
│   ├── booking/           # Booking creation
│   ├── mybookings/        # User bookings
│   ├── admin/bookings/    # Admin dashboard
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── page.tsx           # Home page
├── components/            # React components
├── redux/                 # Redux store & slices
├── libs/                  # API functions
└── interface.ts           # TypeScript types
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| GET | `/api/v1/shops` | List all shops |
| GET | `/api/v1/services` | List all services |
| GET | `/api/v1/reservations` | Get reservations |
| POST | `/api/v1/reservations` | Create booking |
| PUT | `/api/v1/reservations/:id` | Update booking |
| DELETE | `/api/v1/reservations/:id` | Delete booking |

---

## 👥 Contributors

This project was built collaboratively:

- **nkhaooat** (Oat) - Project lead, booking system, theme design
- **Tonkaw** - Authentication, admin dashboard, API integration
- **natthadonwin123** - Shop browsing, UI components, documentation

---

## 📝 License

This project is part of the SW Dev Practice 2 course.

---

<p align="center">
  <em>Find your sanctuary in the dark. 🕯️</em>
</p>
