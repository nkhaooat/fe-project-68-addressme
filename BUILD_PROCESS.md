# Dungeon Inn Frontend - Build Process Documentation

## Project Overview
**Theme:** Dungeon Inn 🕯️ - Dark fantasy tavern aesthetic  
**Tech Stack:** Next.js 14 + TypeScript + Tailwind CSS + Redux + Material UI  
**Backend:** https://be-project-68-bitkrub.onrender.com  
**Frontend Repo:** https://github.com/nkhaooat/fe-project-68-addressme

---

## Contributors (from backend project)
1. **Oat** <aotmetrasit@gmail.com>
2. **Tonkaw** <chatchapon675@gmail.com>
3. **natthadonwin123** <natthadonwin123@gmail.com>

---

## Step-by-Step Build Process

### Step 1: Initialize Next.js Project
```bash
cd /home/user01/Documents/Frontend/Final
npx create-next-app@14 fe-project-68-addressme \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm
```

### Step 2: Install Dependencies
```bash
cd fe-project-68-addressme
npm install @reduxjs/toolkit react-redux redux-persist \
  @mui/material @mui/icons-material @emotion/react @emotion/styled \
  @mui/x-date-pickers dayjs
```

### Step 3: Configure Dungeon Inn Theme
- Updated `tailwind.config.ts` with custom colors
- Updated `src/app/globals.css` with theme variables
- Added Cinzel font for medieval aesthetic

### Step 4: Create Project Structure
```
src/
├── app/
│   ├── (shop)/
│   │   ├── shops/page.tsx
│   │   └── shop/[id]/page.tsx
│   ├── booking/page.tsx
│   ├── mybookings/page.tsx
│   ├── admin/bookings/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── page.tsx (Home)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── TopMenu.tsx
├── redux/
│   ├── store.ts
│   ├── ReduxProvider.tsx
│   └── features/
│       └── authSlice.ts
├── libs/
│   ├── config.ts
│   ├── auth.ts
│   ├── shops.ts
│   ├── services.ts
│   └── reservations.ts
└── interface.ts
```

### Step 5: Implement Authentication
- Created Redux auth slice with persist
- Built Login page with JWT handling
- Built Register page with validation
- Added protected route logic

### Step 6: Implement Shop Browsing
- Created Shops listing page (grid view)
- Created Shop detail page with services
- Added API integration for shops/services

### Step 7: Implement Booking System
- Created Booking form with date/time picker
- Integrated reservation API
- Added max 3 bookings validation
- Built My Bookings page for users

### Step 8: Implement Admin Features
- Created Admin Bookings page
- Added edit/delete functionality for all bookings
- Added status management (pending, confirmed, canceled)

### Step 9: Add Video Banner
- Added banner-video.mp4 to public folder
- Updated Home page with autoplay video background

### Step 10: Configure for Deployment
- Created `next.config.mjs` for static export
- Added environment variable support
- Set up Vercel deployment config

---

## Environment Variables

### Local Development (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Production (Vercel)
```
NEXT_PUBLIC_API_URL=https://be-project-68-bitkrub.onrender.com/api/v1
```

---

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/logout` - Logout

### Shops
- `GET /api/v1/shops` - List all shops
- `GET /api/v1/shops/:id` - Get shop details

### Services
- `GET /api/v1/services` - List all services
- `GET /api/v1/shops/:shopId/services` - Get shop services

### Reservations
- `GET /api/v1/reservations` - List reservations
- `POST /api/v1/reservations` - Create booking
- `PUT /api/v1/reservations/:id` - Update booking
- `DELETE /api/v1/reservations/:id` - Delete booking

---

## Color Theme Reference

| Element | Hex Code |
|---------|----------|
| Primary Header | `#2C1E18` |
| Secondary Header | `#4A2F22` |
| Header Text | `#F0E5D8` |
| Canvas Background | `#1A1A1A` |
| Surface Background | `#2B2B2B` |
| Primary Text | `#D4CFC6` |
| Accent/Highlight | `#E57A00` |
| Outline | `#403A36` |

---

## Deployment

### Backend (Render)
- URL: https://be-project-68-bitkrub.onrender.com
- Environment variables configured in Render dashboard

### Frontend (Vercel)
- Connect GitHub repo to Vercel
- Set environment variable: `NEXT_PUBLIC_API_URL`
- Auto-deploy on push to main branch

---

## Presentation Checklist

- [x] User Registration + Validation
- [x] User Login
- [x] View Shops/Services
- [x] Create Booking (max 3)
- [x] View Own Bookings
- [x] Edit Own Booking
- [x] Delete Own Booking
- [x] User Logout
- [x] Admin Login
- [x] Admin View All Bookings
- [x] Admin Edit Any Booking
- [x] Admin Delete Any Booking
- [x] Dungeon Inn Theme Applied
- [x] Video Banner Added
- [x] Deployed to Vercel
