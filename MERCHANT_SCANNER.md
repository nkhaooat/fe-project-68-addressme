# MERCHANT_SCANNER.md — QR Scanner Documentation

## Overview

The merchant QR scanner allows approved merchants to scan customer QR codes using their device camera to verify bookings in real time.

## Access

- **URL:** `/merchant/scan`
- **Requirements:** Logged-in merchant with `merchantStatus: 'approved'`
- **Also available from:** Merchant Dashboard → Scan QR tab → "Open Camera Scanner"

## How It Works

1. Merchant clicks **Start Scanner**
2. Browser requests camera permission (rear camera preferred)
3. Camera feed displays with a scanning overlay
4. When a QR code is detected, the scanner automatically:
   - Stops the camera
   - Sends the decoded token to `POST /api/v1/merchant/qr/scan`
   - Shows verification result (success or failure)

## HTTPS Requirement

**QR scanning requires a secure context (HTTPS).**

Camera access via `getUserMedia()` is only available in secure contexts:
- `https://` pages
- `localhost` (for development)

If accessed over `http://`, the scanner page will display a warning:
> "QR scanning requires a secure connection (HTTPS). Please access this page via HTTPS."

### Production

The deployed site (`https://fe-project-68-addressme.vercel.app`) automatically serves over HTTPS — camera access works.

### Local Development

`http://localhost:3000` is treated as a secure context by browsers — camera access works during development.

## Camera Permission

- First-time use: browser prompts for camera access
- If denied: shows "Camera Access Denied" with a "Try Again" button
- Camera stream is automatically stopped on unmount/navigation

## Verification Flow

| QR Result | UI Response |
|-----------|------------|
| Valid, own shop | Green overlay + customer details + "Session Confirmed" |
| Invalid token | Red overlay + "Invalid QR code" |
| Expired/void | Red overlay + "QR code is no longer valid" |
| Different shop | Red overlay + "This reservation belongs to a different shop" |
| Cancelled booking | Red overlay + "This reservation has been cancelled" |

## API Endpoint

```
POST /api/v1/merchant/qr/scan
Authorization: Bearer <merchant-token>
Body: { "token": "<qr-token>" }
```

- Verifies QR belongs to the merchant's own shop
- Auto-confirms pending reservations on successful scan
- Returns reservation details on success

## Manual Token Input

As a fallback, merchants can also manually paste a QR token on the dashboard Scan QR tab.
