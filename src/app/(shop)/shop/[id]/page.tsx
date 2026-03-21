'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getShop } from '@/libs/shops';
import { getShopServices } from '@/libs/services';
import { Shop, Service } from '@/interface';

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
            <div className="mt-4 pt-4 border-t border-[#403A36]">
              <p className="text-[#8A8177]">
                Price Range:{' '}
                <span className="text-[#E57A00] font-bold">
                  ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}
                </span>
              </p>
            </div>
            {shop.map && (
              <div className="mt-4">
                <a 
                  href={shop.map} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#E57A00] hover:text-[#c46a00] transition-colors text-sm"
                >
                  📍 View on Google Maps →
                </a>
              </div>
            )}
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