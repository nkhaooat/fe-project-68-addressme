'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getShops, getShopAreas, ShopQueryParams } from '@/libs/shops';
import { Shop } from '@/interface';
import { useDebounce } from '@/hooks/useDebounce';
import { PaginationData } from '@/types/api';
import Pagination from '@/components/Pagination';
import ShopImage from '@/components/ShopImage';
import { Skeleton, SkeletonGrid } from '@/components/Skeleton';

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
      <div className="min-h-screen bg-dungeon-canvas py-8 px-4">
        <Skeleton className="h-8 w-48 mb-6" />
        <SkeletonGrid count={6} lines={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dungeon-canvas flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }


  return (
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-dungeon-header-text mb-8 text-center">
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
              className="w-full bg-dungeon-surface border border-dungeon-outline rounded-lg px-4 py-3 pl-12 text-dungeon-header-text placeholder-dungeon-secondary focus:border-dungeon-accent focus:outline-none"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dungeon-secondary">
              🔍
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Area Filter */}
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
              >
                <option value="">All Areas</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
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
              <label className="block text-dungeon-secondary text-sm mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ShopQueryParams['sortBy'])}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
              >
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as ShopQueryParams['sortOrder'])}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {pagination && (
            <div className="mt-4 text-dungeon-secondary text-sm">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} shops
              {debouncedSearchQuery && searchQuery !== debouncedSearchQuery && (
                <span className="ml-2 text-dungeon-accent">(searching...)</span>
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
              className="bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden hover:border-dungeon-accent transition-colors group"
            >
              <div className="h-48 bg-dungeon-primary-header flex items-center justify-center overflow-hidden">
                <ShopImage photoProxy={shop.photoProxy} photo={shop.photo} name={shop.name} height="h-48" fallbackText="🏪" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-xl font-bold text-dungeon-header-text group-hover:text-dungeon-accent transition-colors leading-tight">
                    {shop.name}
                  </h2>
                  {shop.rating && (
                    <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                      <span>⭐</span>
                      <span className="text-sm font-bold">{shop.rating}</span>
                      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3 h-3" />
                    </div>
                  )}
                  {(shop.platformReviewCount ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-dungeon-accent shrink-0 ml-1">
                      <span>⭐</span>
                      <span className="text-sm font-bold">{shop.platformRating}</span>
                      <img src="/logo.png" alt="Dungeon Inn" className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-dungeon-secondary text-sm mb-2">{shop.address}</p>
                <p className="text-dungeon-sub-header text-sm mb-4">{shop.location}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dungeon-secondary">⏰ {shop.openTime} - {shop.closeTime}</span>
                  <span className="text-dungeon-accent font-bold">
                    ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </main>
  );
}
