# Product & UX Review — Dungeon Inn
_April 24, 2026_

---

## 🔴 Redundant UI (Deduplicate)

1. **Shop hours validation duplicated** — `isWithinShopHours()` + `checkServiceDuration()` copy-pasted identically in `booking/page.tsx` and `EditBookingModal.tsx`
2. **QR Code display ×3** — Booking page, My Bookings, and `/qr/[token]` all render the same QR with same layout
3. **Status/payment color helpers duplicated** — `getStatusColor()`, `getPaymentStatusColor()`, `getPaymentStatusLabel()` in both `mybookings/page.tsx` and `admin/BookingCard.tsx`
4. **Photo fallback logic duplicated** — `onError` handler with `data-fallback` attr in `shops/page.tsx` and `shop/[id]/page.tsx`
5. **`/merchant/scan` standalone page** — redundant with the "Scan" tab already in merchant dashboard
6. **ChatWidget booking actions bypass validation** — can create/edit/cancel reservations without shop-hours checks, promo codes, or slip upload

## 🔴 Product Gaps (Build)

1. **ChatWidget booking bypasses shop hours validation** — can create invalid bookings outside operating hours
2. **No user profile page** — can't view/edit name, email, telephone after registration
3. **Merchants can't complete bookings** — only admins can change status; merchants need to mark bookings as completed after service
4. **Landing page is static** — no featured shops, popular services, stats, or testimonials
5. **No footer** — no links, copyright, contact info on any page
6. **No custom 404 page** — breaks the dungeon theme
7. **`/review` standalone page is redundant** — My Bookings already has inline review; this page just wraps the same modal
8. **Promotion codes only on initial booking** — can't apply when editing
9. **No search on admin shops page** — every other admin page has search/filter
10. **"Rebuild Embedding" in admin nav** — ops tool exposed as product feature; move to settings or remove

## 🟡 UX Polish (Improve)

1. **3 different pagination UIs** — shops listing (custom ellipsis), my bookings (numbered buttons), admin pages (shared component) — pick one
2. **Loading states are plain text** — "Loading shops..." etc. Use skeleton cards or shimmer
3. **Empty states lack illustrations** — just text, no helpful visuals or CTAs (except My Bookings)
4. **`alert()` for feedback** — cancel booking, upload slip use `alert()`. Replace with toast notifications
5. **ChatWidget doesn't indicate auth status** — no visual difference between guest and logged-in chat
6. **No toast/notification system** — status changes use inline messages or `alert()`

## 🟢 What's Already Good

- Dark dungeon theme is consistent — tokens used everywhere
- Role-based navigation renders correctly (admin, merchant, user)
- ChatWidget is genuinely useful — weather, bilingual, markdown, session persistence
- QR code flow complete end-to-end (create → display → download → scan → verify)
- Promotion code UX well-designed on booking page
- Admin CRUD comprehensive (shops, services, bookings, promotions, merchants)
- Merchant self-service works (shop editing, service CRUD, QR scanning)
- Image fallback chain (Google proxy → direct URL → emoji placeholder)
- Mobile hamburger menu properly implemented

---

## Priority Order

| # | Item | Priority | Type |
|---|------|----------|------|
| 1 | ChatWidget booking bypasses validation | 🔴 High | Bug |
| 2 | Deduplicate shop-hours + QR + status-color logic | 🔴 High | Dedup |
| 3 | Remove `/merchant/scan` standalone page | 🟡 Medium | Dedup |
| 4 | Add merchant ability to complete bookings | 🟡 Medium | Feature |
| 5 | Add user profile page | 🟡 Medium | Feature |
| 6 | Unify pagination component | 🟡 Medium | Polish |
| 7 | Replace `alert()` with toast notifications | 🟡 Medium | Polish |
| 8 | Move "Rebuild Embedding" out of nav | 🟡 Medium | Cleanup |
| 9 | Remove `/review` standalone page | 🟡 Medium | Dedup |
| 10 | Add search to admin shops page | 🟡 Medium | Feature |
| 11 | Dynamic landing page content | 🟢 Low | Enhancement |
| 12 | Custom 404 page | 🟢 Low | Polish |
| 13 | Skeleton loading states | 🟢 Low | Polish |
| 14 | Footer | 🟢 Low | Polish |
| 15 | Chat auth status indicator | 🟢 Low | Polish |
