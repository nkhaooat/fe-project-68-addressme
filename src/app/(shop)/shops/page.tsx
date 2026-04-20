'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getShops, getShopAreas, ShopQueryParams } from '@/libs/shops';
import { Shop } from '@/interface';

interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [minRating, setMinRating] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState<ShopQueryParams['sortBy']>('rating');
  const [sortOrder, setSortOrder] = useState<ShopQueryParams['sortOrder']>('desc');

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchAreas() {
      try {
        const data = await getShopAreas();
        if (data.success) {
          setAreas(data.data);
        }
      } catch {
        // Silent fail for areas
      }
    }
    fetchAreas();
  }, []);

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      try {
        const params: ShopQueryParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy,
          sortOrder,
        };

        if (debouncedSearchQuery) params.search = debouncedSearchQuery;
        if (selectedArea) params.searchArea = selectedArea;
        if (minRating) params.minRating = parseFloat(minRating);
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          params.minPrice = min;
          params.maxPrice = max;
        }

        const data = await getShops(params);
        if (data.success) {
          setShops(data.data);
          setPagination(data.pagination);
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
  }, [currentPage, debouncedSearchQuery, selectedArea, minRating, priceRange, sortBy, sortOrder]);

  // Reset to page 1 when filters change (except search which has its own debounce)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedArea, minRating, priceRange, sortBy, sortOrder]);

  if (loading && shops.length === 0) {
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

  const totalPages = pagination?.pages || 1;

  // Generate page numbers for pagination - mobile friendly
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first 3 pages
      pages.push(1, 2, 3);
      
      // Show ellipsis if current page is > 4
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show current page if it's in the middle (not in first 3 or last 3)
      if (currentPage > 3 && currentPage < totalPages - 2) {
        // Only add if not already added
        if (currentPage !== 3) {
          pages.push(currentPage);
        }
        // Add ellipsis before last pages if needed
        if (currentPage < totalPages - 3) {
          pages.push('...');
        }
      } else if (currentPage === 4) {
        // Special case: current page is 4
        pages.push(4);
        if (totalPages > 7) pages.push('...');
      } else if (currentPage >= totalPages - 2 && currentPage > 4) {
        // Show ellipsis before last pages
        pages.push('...');
      }
      
      // Always show last 3 pages
      if (totalPages > 3) {
        // Avoid duplicates
        const lastThree = [totalPages - 2, totalPages - 1, totalPages];
        lastThree.forEach(page => {
          if (!pages.includes(page) && page > 3) {
            pages.push(page);
          }
        });
      }
    }
    return pages;
  };

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#F0E5D8] mb-8 text-center">
          Massage Shops
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search massage shops..."
              value={searchQuery}
              onChange={(e) => {
                // Remove illegal characters: backslash, forward slash, <, >, &, quotes
                const sanitized = e.target.value.replace(/[\\/<>&"']/g, '');
                setSearchQuery(sanitized);
              }}
              className="w-full bg-[#2B2B2B] border border-[#403A36] rounded-lg px-4 py-3 pl-12 text-[#F0E5D8] placeholder-[#8A8177] focus:border-[#E57A00] focus:outline-none"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8A8177]">
              🔍
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Area Filter */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="">Any Price</option>
                <option value="0-300">฿0 - ฿300 (Street)</option>
                <option value="300-700">฿300 - ฿700 (Mid-tier)</option>
                <option value="700-1600">฿700 - ฿1600 (Spa Chain)</option>
                <option value="1600-5000">฿1600+ (Luxury)</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ShopQueryParams['sortBy'])}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as ShopQueryParams['sortOrder'])}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {pagination && (
            <div className="mt-4 text-[#8A8177] text-sm">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} shops
              {debouncedSearchQuery && searchQuery !== debouncedSearchQuery && (
                <span className="ml-2 text-[#E57A00]">(searching...)</span>
              )}
            </div>
          )}
        </div>

        {/* Shop Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Link
              key={shop._id}
              href={`/shop/${shop._id}`}
              className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden hover:border-[#E57A00] transition-colors group"
            >
              <div className="h-48 bg-[#2C1E18] flex items-center justify-center overflow-hidden">
                {(shop.photoProxy || shop.photo) ? (
                  <img
                    src={shop.photoProxy || shop.photo!}
                    alt={shop.name}
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.src !== shop.photo && shop.photo) {
                        img.src = shop.photo; // fallback to DB photo
                      } else {
                        img.src = '/placeholder-shop.jpg';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-6xl">🏪</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-xl font-bold text-[#F0E5D8] group-hover:text-[#E57A00] transition-colors leading-tight">
                    {shop.name}
                  </h2>
                  {shop.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                      <span>⭐</span>
                      <span className="text-sm font-bold">{shop.rating}</span>
                    </div>
                  )}
                </div>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              ← Prev
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`w-10 h-10 rounded-lg border transition-colors ${
                    page === currentPage
                      ? 'bg-[#E57A00] border-[#E57A00] text-[#1A110A] font-bold'
                      : page === '...'
                      ? 'bg-transparent border-transparent text-[#8A8177] cursor-default'
                      : 'bg-[#2B2B2B] border-[#403A36] text-[#F0E5D8] hover:border-[#E57A00]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
