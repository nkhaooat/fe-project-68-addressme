'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getShop } from '@/libs/shops';
import { getShopServices } from '@/libs/services';
import { getShopReviews } from '@/libs/reviews';
import { Shop, Service, Review } from '@/interface';
import ShopImage from '@/components/ShopImage';
import { SkeletonPage } from '@/components/Skeleton';

// TikTok logo SVG
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.16 8.16 0 004.77 1.52V6.82a4.85 4.85 0 01-1-.13z"/>
    </svg>
  );
}

// TikTok button: single link or dropdown
function TikTokButton({ links }: { links: string[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (links.length === 1) {
    return (
      <a
        href={links[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dungeon-canvas border border-dungeon-outline rounded-lg text-sm text-dungeon-primary hover:border-dungeon-accent hover:text-dungeon-accent transition-colors"
      >
        <TikTokIcon className="w-3.5 h-3.5" />
        TikTok
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dungeon-canvas border border-dungeon-outline rounded-lg text-sm text-dungeon-primary hover:border-dungeon-accent hover:text-dungeon-accent transition-colors"
      >
        <TikTokIcon className="w-3.5 h-3.5" />
        TikTok
        <span className="bg-dungeon-accent text-dungeon-dark-text text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
          {links.length}
        </span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden shadow-xl z-10 min-w-[140px]">
          {links.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-dungeon-primary hover:bg-dungeon-outline hover:text-dungeon-accent transition-colors"
            >
              <TikTokIcon className="w-3 h-3 shrink-0" />
              Video {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const reviewPageSize = 5;
  const reviewPages = Math.ceil(reviewCount / reviewPageSize);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopRes, servicesRes, reviewsRes] = await Promise.all([
          getShop(shopId),
          getShopServices(shopId),
          getShopReviews(shopId),
        ]);

        if (shopRes.success) {
          setShop(shopRes.data);
        } else {
          setError('Shop not found');
        }

        if (servicesRes.success) {
          setServices(servicesRes.data);
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.data);
          setAvgRating(reviewsRes.avgRating);
          setReviewCount(reviewsRes.reviewCount);
        }
      } catch {
        setError('Error loading shop details');
      } finally {
        setLoading(false);
      }
    }

    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  // Fetch paginated reviews for "All Reviews" modal
  useEffect(() => {
    if (!showAllReviews || !shopId) return;
    async function fetchAllReviews() {
      try {
        const res = await getShopReviews(shopId);
        if (res.success) {
          setAllReviews(res.data);
        }
      } catch {}
    }
    fetchAllReviews();
  }, [showAllReviews, shopId, reviewPage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-dungeon-canvas py-8 px-4">
        <SkeletonPage type="detail" />
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'Shop not found'}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/shops"
          className="text-dungeon-sub-header hover:text-dungeon-accent transition-colors mb-6 inline-block"
        >
          ← Back to Shops
        </Link>

        {/* Shop Header */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden mb-8">
          {/* Shop Photo */}
          <div className="h-64 w-full overflow-hidden">
            <ShopImage photoProxy={shop.photoProxy} photo={shop.photo} name={shop.name} height="h-64" fallbackText="🏪" />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-dungeon-header-text">{shop.name}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                {shop.rating && (
                  <span className="inline-flex items-center gap-1 bg-dungeon-canvas px-2.5 py-0.5 rounded-full text-sm whitespace-nowrap">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-dungeon-header-text font-bold">{shop.rating}</span>
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
                  </span>
                )}
                {reviewCount > 0 && (
                  <span className="inline-flex items-center gap-1 bg-dungeon-canvas px-2.5 py-0.5 rounded-full text-sm whitespace-nowrap">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-dungeon-accent font-bold">{avgRating}</span>
                    <img src="/logo.png" alt="Dungeon Inn" className="w-3.5 h-3.5" />
                    <span className="text-dungeon-secondary text-xs">({reviewCount})</span>
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-dungeon-primary">
              <div>
                <p className="text-dungeon-secondary mb-1">📍 Address</p>
                <p>{shop.address}</p>
                <p className="text-dungeon-sub-header">{shop.location}</p>
              </div>
              <div>
                <p className="text-dungeon-secondary mb-1">📞 Contact</p>
                <p>{shop.tel}</p>
                <p className="text-dungeon-sub-header">
                  {shop.openTime} - {shop.closeTime}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dungeon-outline">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Price range */}
                <p className="text-dungeon-secondary">
                  Price Range:{' '}
                  <span className="text-dungeon-accent font-bold">
                    ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}
                  </span>
                </p>

                {/* Right-side actions: Maps + TikTok */}
                <div className="flex items-center gap-3">
                  {shop.map && (
                    <a
                      href={shop.map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dungeon-accent hover:text-dungeon-accent-dark transition-colors text-sm"
                    >
                      📍 Google Maps →
                    </a>
                  )}
                  {shop.tiktokLinks && shop.tiktokLinks.length > 0 && (
                    <TikTokButton links={shop.tiktokLinks} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dungeon-header-text">Reviews</h2>
              <button
                onClick={() => setShowAllReviews(true)}
                className="text-dungeon-accent hover:text-dungeon-accent-dark text-sm font-semibold transition-colors"
              >
                All Reviews ({reviewCount}) →
              </button>
            </div>

            {/* Review display: carousel for 3+, static for 1-2 */}
            {reviews.length >= 3 ? (
              <div className="relative mb-8 overflow-hidden">
                <div
                  className="flex gap-4"
                  style={{
                    animation: 'scrollReviews 20s linear infinite',
                    width: 'max-content',
                  }}
                  onMouseEnter={e => e.currentTarget.style.animationPlayState = 'paused'}
                  onMouseLeave={e => e.currentTarget.style.animationPlayState = 'running'}
                >
                  {[...reviews, ...reviews].map((review, idx) => {
                    const userName = typeof review.user === 'object' ? review.user.name : 'Anonymous';
                    const serviceName = typeof review.service === 'object' ? review.service.name : '';
                    const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                    return (
                      <div
                        key={`${review._id}-${idx}`}
                        className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-5 w-72 flex-shrink-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-dungeon-header-text font-semibold text-sm">{userName}</p>
                            {serviceName && <p className="text-dungeon-secondary text-xs">{serviceName}</p>}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-dungeon-outline'}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-dungeon-primary text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                        )}
                        <p className="text-dungeon-secondary text-xs mt-2">{date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 mb-8">
                {reviews.map((review) => {
                  const userName = typeof review.user === 'object' ? review.user.name : 'Anonymous';
                  const serviceName = typeof review.service === 'object' ? review.service.name : '';
                  const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                  return (
                    <div key={review._id} className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-5 flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-dungeon-header-text font-semibold text-sm">{userName}</p>
                          {serviceName && <p className="text-dungeon-secondary text-xs">{serviceName}</p>}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-dungeon-outline'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-dungeon-primary text-sm leading-relaxed">{review.comment}</p>
                      )}
                      <p className="text-dungeon-secondary text-xs mt-2">{date}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* All Reviews Modal */}
        {showAllReviews && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-dungeon-surface border border-dungeon-outline rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-dungeon-outline">
                <h2 className="text-xl font-bold text-dungeon-header-text">All Reviews ({reviewCount})</h2>
                <button onClick={() => setShowAllReviews(false)} className="text-dungeon-secondary hover:text-dungeon-header-text text-xl">✕</button>
              </div>
              <div className="overflow-y-auto p-5 space-y-4 flex-1">
                {allReviews.map((review) => {
                  const userName = typeof review.user === 'object' ? review.user.name : 'Anonymous';
                  const serviceName = typeof review.service === 'object' ? review.service.name : '';
                  const date = new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                  return (
                    <div key={review._id} className="bg-dungeon-canvas border border-dungeon-outline rounded-lg p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-dungeon-header-text font-semibold">{userName}</p>
                          {serviceName && <p className="text-dungeon-secondary text-xs">{serviceName}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-dungeon-outline'}>★</span>
                          ))}
                          <span className="text-dungeon-secondary text-xs ml-1">{date}</span>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-dungeon-primary text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Pagination */}
              {reviewPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t border-dungeon-outline">
                  <button
                    onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="px-3 py-1 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary text-sm disabled:opacity-30 hover:border-dungeon-accent transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-dungeon-secondary text-sm">{reviewPage} / {reviewPages}</span>
                  <button
                    onClick={() => setReviewPage(p => Math.min(reviewPages, p + 1))}
                    disabled={reviewPage === reviewPages}
                    className="px-3 py-1 bg-dungeon-canvas border border-dungeon-outline rounded text-dungeon-primary text-sm disabled:opacity-30 hover:border-dungeon-accent transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        <h2 className="text-2xl font-bold text-dungeon-header-text mb-6">Available Services</h2>
        
        {services.length === 0 ? (
          <div className="text-dungeon-secondary text-center py-8">
            No services available at this shop.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-dungeon-header-text">{service.name}</h3>
                  <span className="text-dungeon-accent font-bold text-lg">
                    ฿{service.price}
                  </span>
                </div>
                <div className="space-y-2 text-dungeon-secondary text-sm mb-4">
                  <p>🎯 Area: {service.area}</p>
                  <p>⏱️ Duration: {service.duration} minutes</p>
                  <p>🧴 Oil: {service.oil}</p>
                </div>
                <Link
                  href={`/booking?shop=${shop._id}&service=${service._id}`}
                  className="block w-full py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded text-center hover:bg-dungeon-accent-dark transition-colors"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}