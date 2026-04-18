'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getShop } from '@/libs/shops';
import { getShopServices } from '@/libs/services';
import { Shop, Service } from '@/interface';

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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#403A36] rounded-lg text-sm text-[#D4CFC6] hover:border-[#E57A00] hover:text-[#E57A00] transition-colors"
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#403A36] rounded-lg text-sm text-[#D4CFC6] hover:border-[#E57A00] hover:text-[#E57A00] transition-colors"
      >
        <TikTokIcon className="w-3.5 h-3.5" />
        TikTok
        <span className="bg-[#E57A00] text-[#1A110A] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
          {links.length}
        </span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden shadow-xl z-10 min-w-[140px]">
          {links.map((url, i) => (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#D4CFC6] hover:bg-[#403A36] hover:text-[#E57A00] transition-colors"
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopRes, servicesRes] = await Promise.all([
          getShop(shopId),
          getShopServices(shopId),
        ]);

        if (shopRes.success) {
          setShop(shopRes.data);
        } else {
          setError('Shop not found');
        }

        if (servicesRes.success) {
          setServices(servicesRes.data);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading shop details...</div>
      </main>
    );
  }

  if (error || !shop) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error || 'Shop not found'}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/shops"
          className="text-[#A88C6B] hover:text-[#E57A00] transition-colors mb-6 inline-block"
        >
          ← Back to Shops
        </Link>

        {/* Shop Header */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden mb-8">
          {/* Shop Photo */}
          {shop.photo && (
            <div className="h-64 w-full overflow-hidden">
              <img 
                src={shop.photo} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-[#F0E5D8]">{shop.name}</h1>
              {shop.rating && (
                <div className="flex items-center bg-[#1A1A1A] px-3 py-1 rounded-full">
                  <span className="text-yellow-400 mr-1">⭐</span>
                  <span className="text-[#F0E5D8] font-bold">{shop.rating}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#D4CFC6]">
              <div>
                <p className="text-[#8A8177] mb-1">📍 Address</p>
                <p>{shop.address}</p>
                <p className="text-[#A88C6B]">{shop.location}</p>
              </div>
              <div>
                <p className="text-[#8A8177] mb-1">📞 Contact</p>
                <p>{shop.tel}</p>
                <p className="text-[#A88C6B]">
                  {shop.openTime} - {shop.closeTime}
                </p>
              </div>
            </div>
            {/* Shop Description */}
            {shop.description && (
              <div className="mt-4 pt-4 border-t border-[#403A36]">
                <p className="text-[#8A8177] mb-1">📝 About</p>
                <p className="text-[#D4CFC6] text-sm leading-relaxed">{shop.description}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#403A36]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Price range */}
                <p className="text-[#8A8177]">
                  Price Range:{' '}
                  <span className="text-[#E57A00] font-bold">
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
                      className="text-[#E57A00] hover:text-[#c46a00] transition-colors text-sm"
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

        {/* Services */}
        <h2 className="text-2xl font-bold text-[#F0E5D8] mb-6">Available Services</h2>
        
        {services.length === 0 ? (
          <div className="text-[#8A8177] text-center py-8">
            No services available at this shop.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-[#F0E5D8]">{service.name}</h3>
                  <span className="text-[#E57A00] font-bold text-lg">
                    ฿{service.price}
                  </span>
                </div>
                <div className="space-y-2 text-[#8A8177] text-sm mb-4">
                  <p>🎯 Area: {service.area}</p>
                  <p>⏱️ Duration: {service.duration} minutes</p>
                  <p>🧴 Oil: {service.oil}</p>
                </div>
                <Link
                  href={`/booking?shop=${shop._id}&service=${service._id}`}
                  className="block w-full py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded text-center hover:bg-[#c46a00] transition-colors"
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