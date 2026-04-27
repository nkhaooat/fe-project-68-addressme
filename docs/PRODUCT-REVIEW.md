# PRODUCT-REVIEW.md — Updated Assessment (2026-04-24)

## Previously Completed (10/10 ✅)

All medium/high items from the initial review have been addressed:
1. ✅ ChatWidget booking bypasses validation → shared `utils/shopHours.ts`
2. ✅ Deduplicate shop-hours + QR + status-color → `utils/shopHours.ts`, `utils/reservationStatus.ts`
3. ✅ Remove `/merchant/scan` standalone page
4. ✅ Add merchant ability to complete bookings → `PUT /merchant/reservations/:id/status`
5. ✅ Add user profile page → `/profile` + `/profile/password`
6. ✅ Unify pagination component → shared `Pagination` with `pagination` + `totalPages` modes
7. ✅ Replace `alert()` with toast notifications → `ToastContext` + `useToast()`
8. ✅ Move "Rebuild Embedding" to settings → `/admin/settings`
9. ✅ Remove `/review` standalone page
10. ✅ Add search to admin shops page → already existed

---

## Remaining Issues (Low Priority / Polish)

### Duplicate Types (Low — Code Hygiene)

| Where | What | Fix |
|-------|------|-----|
| `merchant/page.tsx` | `ShopData`, `ReservationData` interfaces | Import from `@/types/` or `@/interface` |
| `merchant/shop/page.tsx` | `ShopData` interface (slightly different — required vs optional) | Unify with canonical `Shop` type |
| `merchant/services/page.tsx` | `ServiceData` interface | Import from `@/types/service` |
| `register/merchant/page.tsx` | `ShopOption` interface | Could use a pick from `Shop` type |
| `interface.ts` | Re-exports from `@/types/` but also has its own `Reservation` with `any` for shop/service | Migrate consumers to `@/types/reservation.ts` (has proper types) and deprecate `interface.ts` |

9 files still import from `@/interface` — could migrate to `@/types/` directly.

### `window.confirm()` Still Used (Low — UX Polish)

✅ **Resolved** — Replaced with `<ConfirmDialog>` component across all 6 locations.

### Shop Image Logic (Low — Dedup)

`ShopImage` component exists and is used by `admin/ShopCard`, but `shops/page.tsx` and `shop/[id]/page.tsx` still have inline photo fallback logic instead of using the component.

**Fix:** Replace inline logic with `<ShopImage>` in both pages.

### QR Code Display (Low — Dedup)

✅ **Resolved** — Extracted `<QRCodeDisplay>` component wrapping `<QRCodeSVG>` with consistent sizing/styling.

### Landing Page (Low — Enhancement)

Currently static with video banner + 3 feature cards. Could be enhanced with:
- Featured/popular shops carousel (fetch from API)
- Stats (total shops, bookings, reviews)
- Testimonials
- Footer with links

### Missing Pages (Low — Nice-to-Have)

✅ **Resolved** — Custom `not-found.tsx` (404) and `<Footer>` component now exist. Privacy policy page at `/privacy`.

### Empty Catch Blocks (Low — Code Hygiene)

~57 `catch {}` blocks across the app. Most are fine (error already handled by toast), but a few in `mybookings` and `login` silently swallow errors without any user feedback.

---

## What's Working Well

- **Dark dungeon theme** — consistent, polished, no style drift
- **Role-based navigation** — admin/merchant/user see correct menus
- **Toast notifications** — smooth, auto-dismiss, color-coded
- **Shared components** — `Pagination`, `ErrorBanner`, `LoadingState`, `ShopImage`
- **Shared utils** — `shopHours.ts`, `reservationStatus.ts`
- **QR flow** — complete end-to-end (scan → verify → display)
- **Admin CRUD** — comprehensive (shops, services, bookings, merchants, promotions, settings)
- **Merchant self-service** — dashboard, shop edit, service CRUD, reservations with status updates, QR scan
- **User features** — profile edit, password change, booking with validation, reviews, slip upload
- **ChatWidget** — bilingual, weather, markdown, booking with shop-hours validation
- **Backend** — clean routes, proper auth middleware, 66 tests passing

---

## Summary

The codebase is in good shape. All critical and medium-priority issues from the initial review are resolved. The remaining items are low-priority polish: type dedup, confirm dialogs, landing page enhancement, and minor component extraction. None are blocking for a production release.
