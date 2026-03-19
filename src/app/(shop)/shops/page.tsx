'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getShops } from '@/libs/shops';
import { Shop } from '@/interface';

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchShops() {
      try {
        const data = await getShops();
        if (data.success) {
          setShops(data.data);
        } else {
          setError('Failed to load shops');
        }
      } catch {
        setError('Error loading shops');
      } finally {
        setLoading(false);
      }
    }

    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading shops...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#F0E5D8] mb-8 text-center">
          Massage Shops
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link
              key={shop._id}
              href={`/shop/${shop._id}`}
              className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden hover:border-[#E57A00] transition-colors group"
            >
              <div className="h-48 bg-[#2C1E18] flex items-center justify-center">
                <span className="text-6xl">🏪</span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#F0E5D8] mb-2 group-hover:text-[#E57A00] transition-colors">
                  {shop.name}
                </h2>
                <p className="text-[#8A8177] text-sm mb-2">{shop.address}</p>
                <p className="text-[#A88C6B] text-sm mb-4">{shop.location}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#8A8177]">⏰ {shop.openTime} - {shop.closeTime}</span>
                  <span className="text-[#E57A00] font-bold">
                    ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}