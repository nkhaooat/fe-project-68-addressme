'use client';

import { useEffect, useState } from 'react';

/**
 * Skeleton loading components for Dungeon Inn.
 * Mimics real page layouts with shimmer animation for smooth perceived loading.
 */

// ─── Content fade-in wrapper ───────────────────────────────────────

export function FadeIn({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(r);
  }, []);
  if (!visible) return <>{children}</>; // render immediately but invisible
  return <div className="animate-fade-in">{children}</div>;
}

// ─── Base pulse bar ────────────────────────────────────────────────

export function SkeletonBar({ className = '', width }: { className?: string; width?: string }) {
  return (
    <div
      className={`rounded animate-shimmer ${className}`}
      style={{
        width: width || '100%',
        background: 'linear-gradient(90deg, #3d3833 25%, #6b635a 50%, #3d3833 75%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}

// ─── Page-level skeletons ──────────────────────────────────────────

/** Shops listing page skeleton */
export function ShopsListSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      {/* Title */}
      <SkeletonBar className="h-8 w-64 mx-auto" />
      {/* Search bar */}
      <SkeletonBar className="h-10 w-full max-w-xl mx-auto rounded-lg" />
      {/* Filter panel */}
      <div className="bg-dungeon-surface rounded-lg p-4 space-y-3 max-w-5xl mx-auto">
        <div className="flex gap-3 flex-wrap">
          {[120, 130, 140, 100, 100].map((w, i) => (
            <SkeletonBar key={i} className="h-9 rounded" width={`${w}px`} />
          ))}
        </div>
        <SkeletonBar className="h-4 w-48" />
      </div>
      {/* Shop cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg overflow-hidden">
            <SkeletonBar className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <SkeletonBar className="h-5 w-3/4" />
              <SkeletonBar className="h-4 w-1/4" />
              <SkeletonBar className="h-3 w-2/3" />
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/** Shop detail page skeleton */
export function ShopDetailSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      {/* Back link */}
      <SkeletonBar className="h-4 w-32" />
      {/* Hero card */}
      <div className="bg-dungeon-surface rounded-lg overflow-hidden max-w-3xl mx-auto">
        <SkeletonBar className="h-56 w-full rounded-none" />
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <SkeletonBar className="h-7 w-2/3" />
            <SkeletonBar className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-4 w-1/2" />
          <SkeletonBar className="h-4 w-1/3" />
          <div className="flex gap-3">
            <SkeletonBar className="h-9 w-24 rounded-lg" />
            <SkeletonBar className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
      {/* Services section */}
      <div className="max-w-3xl mx-auto space-y-4">
        <SkeletonBar className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-dungeon-surface rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <SkeletonBar className="h-5 w-2/3" />
                <SkeletonBar className="h-5 w-16" />
              </div>
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-2/5" />
              <SkeletonBar className="h-3 w-1/3" />
              <SkeletonBar className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** My Bookings page skeleton */
export function MyBookingsSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <SkeletonBar className="h-8 w-48 mx-auto" />
      <SkeletonBar className="h-10 w-full max-w-xl mx-auto rounded-lg" />
      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((t, i) => (
          <SkeletonBar key={i} className="h-8 rounded-full" width={`${t.length * 10 + 24}px`} />
        ))}
      </div>
      {/* Booking cards */}
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-5 space-y-3">
            <div className="flex justify-between">
              <SkeletonBar className="h-5 w-1/3" />
              <SkeletonBar className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonBar className="h-4 w-1/2" />
            <SkeletonBar className="h-4 w-2/5" />
            <SkeletonBar className="h-4 w-1/4" />
            <div className="flex gap-2">
              <SkeletonBar className="h-8 w-20 rounded-lg" />
              <SkeletonBar className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/** Booking / reservation form skeleton */
export function BookingFormSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <SkeletonBar className="h-8 w-64 mx-auto" />
      <div className="max-w-lg mx-auto space-y-4">
        {/* Shop info card */}
        <div className="bg-dungeon-surface rounded-lg p-5 space-y-3">
          <SkeletonBar className="h-5 w-2/3" />
          <SkeletonBar className="h-4 w-1/2" />
        </div>
        {/* Date & time */}
        <div className="bg-dungeon-surface rounded-lg p-5 space-y-3">
          <SkeletonBar className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-3">
            <SkeletonBar className="h-10 rounded-lg" />
            <SkeletonBar className="h-10 rounded-lg" />
          </div>
        </div>
        {/* Promo */}
        <div className="bg-dungeon-surface rounded-lg p-5 space-y-3">
          <SkeletonBar className="h-5 w-36" />
          <div className="flex gap-2">
            <SkeletonBar className="h-10 flex-1 rounded-lg" />
            <SkeletonBar className="h-10 w-20 rounded-lg" />
          </div>
        </div>
        {/* Total + buttons */}
        <div className="bg-dungeon-surface rounded-lg p-5 space-y-3">
          <div className="flex justify-between">
            <SkeletonBar className="h-5 w-16" />
            <SkeletonBar className="h-5 w-24" />
          </div>
          <div className="flex gap-3">
            <SkeletonBar className="h-10 flex-1 rounded-lg" />
            <SkeletonBar className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Admin shops page skeleton */
export function AdminShopsSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <SkeletonBar className="h-8 w-64" />
        <SkeletonBar className="h-10 w-36 rounded-lg" />
      </div>
      <div className="bg-dungeon-surface rounded-lg p-4 space-y-3 max-w-6xl mx-auto">
        <SkeletonBar className="h-4 w-24" />
        <SkeletonBar className="h-10 w-full rounded-lg" />
        <SkeletonBar className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg overflow-hidden">
            <SkeletonBar className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <SkeletonBar className="h-5 w-3/4" />
              <SkeletonBar className="h-3 w-2/3" />
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-1/3" />
              <div className="flex gap-2 pt-2">
                <SkeletonBar className="h-7 w-14 rounded" />
                <SkeletonBar className="h-7 w-14 rounded" />
                <SkeletonBar className="h-7 w-7 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/** Admin bookings page skeleton */
export function AdminBookingsSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <SkeletonBar className="h-8 w-56 mx-auto" />
      {/* Filter panel */}
      <div className="bg-dungeon-surface rounded-lg p-4 space-y-3 max-w-5xl mx-auto">
        <div className="flex gap-3 flex-wrap">
          <SkeletonBar className="h-9 flex-1 rounded" />
          <SkeletonBar className="h-9 w-32 rounded" />
          <SkeletonBar className="h-9 w-32 rounded" />
        </div>
        <SkeletonBar className="h-4 w-48" />
      </div>
      {/* Booking rows */}
      <div className="max-w-5xl mx-auto space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-4 w-1/3" />
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-2/5" />
            </div>
            <SkeletonBar className="h-5 w-20 rounded-full" />
            <div className="flex gap-2">
              <SkeletonBar className="h-7 w-16 rounded" />
              <SkeletonBar className="h-7 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/** Admin services page skeleton */
export function AdminServicesSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <SkeletonBar className="h-8 w-56" />
        <SkeletonBar className="h-10 w-36 rounded-lg" />
      </div>
      <div className="bg-dungeon-surface rounded-lg p-4 space-y-3 max-w-6xl mx-auto">
        <div className="flex gap-3">
          <SkeletonBar className="h-9 flex-1 rounded" />
          <SkeletonBar className="h-9 flex-1 rounded" />
        </div>
        <SkeletonBar className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <SkeletonBar className="h-5 w-2/3" />
              <div className="flex gap-1">
                <SkeletonBar className="h-6 w-6 rounded" />
                <SkeletonBar className="h-6 w-6 rounded" />
              </div>
            </div>
            <SkeletonBar className="h-3 w-1/2" />
            <SkeletonBar className="h-3 w-2/5" />
            <SkeletonBar className="h-3 w-1/3" />
            <SkeletonBar className="h-3 w-1/4" />
            <SkeletonBar className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

/** Admin promotions page skeleton */
export function AdminPromotionsSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <SkeletonBar className="h-8 w-40" />
        <SkeletonBar className="h-10 w-40 rounded-lg" />
      </div>
      <div className="max-w-4xl mx-auto space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-5 w-16 rounded-full" />
              <SkeletonBar className="h-5 w-1/3" />
            </div>
            <SkeletonBar className="h-3 w-2/3" />
            <SkeletonBar className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Admin merchants page skeleton */
export function AdminMerchantsSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <SkeletonBar className="h-8 w-56" />
      {/* Search + filter tabs */}
      <SkeletonBar className="h-10 w-full max-w-xl rounded-lg" />
      <div className="flex gap-2">
        {['Pending', 'Approved', 'Rejected', 'All'].map((t, i) => (
          <SkeletonBar key={i} className="h-8 rounded-full" width={`${t.length * 10 + 24}px`} />
        ))}
      </div>
      {/* Merchant cards */}
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-5 space-y-3">
            <SkeletonBar className="h-5 w-1/3" />
            <SkeletonBar className="h-4 w-1/2" />
            <SkeletonBar className="h-3 w-2/3" />
            <div className="flex gap-2 pt-2">
              <SkeletonBar className="h-8 w-20 rounded-lg" />
              <SkeletonBar className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Merchant dashboard skeleton */
export function MerchantDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <SkeletonBar className="h-7 w-52" />
        <SkeletonBar className="h-6 w-24 rounded-full" />
      </div>
      {/* Shop card */}
      <div className="bg-dungeon-surface rounded-lg p-5 space-y-2">
        <SkeletonBar className="h-5 w-1/3" />
        <SkeletonBar className="h-4 w-1/2" />
        <SkeletonBar className="h-4 w-2/5" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-4 text-center space-y-2">
            <SkeletonBar className="h-8 w-16 mx-auto" />
            <SkeletonBar className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-2">
        {['Overview', 'Reservations', 'Scan QR', 'My Shop', 'Services'].map((t, i) => (
          <SkeletonBar key={i} className="h-8 rounded-full" width={`${t.length * 9 + 20}px`} />
        ))}
      </div>
      {/* Content area */}
      <div className="bg-dungeon-surface rounded-lg p-5 space-y-3">
        <SkeletonBar className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-dungeon-outline/30">
            <SkeletonBar className="h-4 w-1/4" />
            <SkeletonBar className="h-4 w-1/3" />
            <SkeletonBar className="h-5 w-16 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Merchant shop edit page skeleton */
export function MerchantShopSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <div className="flex justify-between items-center max-w-lg mx-auto w-full">
        <SkeletonBar className="h-7 w-32" />
        <SkeletonBar className="h-4 w-32" />
      </div>
      <div className="max-w-lg mx-auto bg-dungeon-surface rounded-lg p-6 space-y-4">
        <SkeletonBar className="h-4 w-20" />
        <SkeletonBar className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBar className="h-10 rounded-lg" />
          <SkeletonBar className="h-10 rounded-lg" />
        </div>
        <SkeletonBar className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBar className="h-10 rounded-lg" />
          <SkeletonBar className="h-10 rounded-lg" />
        </div>
        <SkeletonBar className="h-10 w-full rounded-lg" />
        <SkeletonBar className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Merchant services page skeleton */
export function MerchantServicesSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      <div className="flex justify-between items-center max-w-3xl mx-auto w-full">
        <SkeletonBar className="h-7 w-36" />
        <SkeletonBar className="h-10 w-32 rounded-lg" />
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-dungeon-surface rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <SkeletonBar className="h-5 w-1/3" />
              <SkeletonBar className="h-3 w-1/2" />
              <SkeletonBar className="h-3 w-2/5" />
            </div>
            <div className="flex gap-2">
              <SkeletonBar className="h-8 w-14 rounded-lg" />
              <SkeletonBar className="h-8 w-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** QR code verification page skeleton */
export function QRSkeleton() {
  return (
    <div className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
      <div className="bg-dungeon-surface rounded-lg p-8 text-center space-y-4">
        <SkeletonBar className="h-6 w-32 mx-auto" />
        <SkeletonBar className="h-40 w-40 mx-auto rounded-lg" />
        <SkeletonBar className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

/** Generic admin page skeleton (for settings, etc.) */
export function GenericSkeleton({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-dungeon-canvas py-8 px-4 space-y-6">
      {title && <SkeletonBar className="h-8 w-56" />}
      <div className="max-w-3xl mx-auto bg-dungeon-surface rounded-lg p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <SkeletonBar className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
