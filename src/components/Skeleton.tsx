'use client';

/**
 * Skeleton loading components — animate-pulse placeholders that match the dungeon theme.
 * Replaces plain "Loading..." text with visual structure hints.
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-dungeon-bg/40 rounded ${className}`} />
  );
}

/** Card-shaped skeleton (shops, bookings, services) */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-dungeon-canvas border border-dungeon-outline rounded-xl p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonGrid({ count = 6, lines = 3 }: { count?: number; lines?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  );
}

/** Table row skeleton (admin tables) */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-dungeon-outline">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 flex-1 ${c === 0 ? 'w-32' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full-page skeleton loader */
export function SkeletonPage({ type = 'grid' }: { type?: 'grid' | 'table' | 'detail' }) {
  return (
    <main className="min-h-screen bg-dungeon-canvas p-6">
      {/* Title */}
      <Skeleton className="h-8 w-48 mb-6" />
      {type === 'grid' && <SkeletonGrid />}
      {type === 'table' && <SkeletonTable />}
      {type === 'detail' && (
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      )}
    </main>
  );
}
