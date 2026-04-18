'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getShops, createShop, updateShop, deleteShop, Shop, ShopQueryParams, addTiktokLinks, removeTiktokLink } from '@/libs/shops';
import Link from 'next/link';

interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

const emptyShop: Omit<Shop, '_id'> = {
  name: '',
  address: '',
  location: '',
  tel: '',
  map: '',
  openTime: '09:00',
  closeTime: '21:00',
  priceRangeMin: 0,
  priceRangeMax: 0,
  rating: 0,
  photo: '',
  placeId: '',
  description: '',
  tiktokLinks: []
};

export default function AdminShopsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<Omit<Shop, '_id'>>(emptyShop);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination & Search states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // TikTok management states
  const [newTiktokUrl, setNewTiktokUrl] = useState('');
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      try {
        const params: ShopQueryParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const res = await getShops(params);
        if (res.success) {
          setShops(res.data);
          setPagination(res.pagination);
        } else {
          setError(res.message || 'Failed to load shops');
        }
      } catch {
        setError('Error loading shops');
      } finally {
        setLoading(false);
      }
    }

    if (token && user?.role === 'admin') {
      fetchShops();
    }
  }, [token, user, currentPage, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingShop(null);
    setFormData(emptyShop);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name,
      address: shop.address,
      location: shop.location,
      tel: shop.tel,
      map: shop.map,
      openTime: shop.openTime,
      closeTime: shop.closeTime,
      priceRangeMin: shop.priceRangeMin,
      priceRangeMax: shop.priceRangeMax,
      rating: shop.rating,
      photo: shop.photo || '',
      placeId: shop.placeId || '',
      description: shop.description || '',
      tiktokLinks: shop.tiktokLinks || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
    setFormData(emptyShop);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let res;
      if (editingShop) {
        res = await updateShop(editingShop._id, formData, token!);
      } else {
        res = await createShop(formData, token!);
      }
      
      if (res.success) {
        // Refresh the shops list
        const params: ShopQueryParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE
        };
        if (searchQuery) params.search = searchQuery;
        
        const refreshRes = await getShops(params);
        if (refreshRes.success) {
          setShops(refreshRes.data);
          setPagination(refreshRes.pagination);
        }
        
        handleCloseModal();
      } else {
        alert(res.message || `Failed to ${editingShop ? 'update' : 'create'} shop`);
      }
    } catch {
      alert(`Error ${editingShop ? 'updating' : 'creating'} shop`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, shopName: string) => {
    if (!confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) return;

    try {
      const res = await deleteShop(id, token!);
      if (res.success) {
        setShops(shops.filter(s => s._id !== id));
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total - 1 });
        }
      } else {
        alert(res.message || 'Failed to delete shop');
      }
    } catch {
      alert('Error deleting shop');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name === 'rating' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddTiktok = async () => {
    if (!editingShop || !newTiktokUrl.includes('tiktok.com') || !token) return;
    
    try {
      const data = await addTiktokLinks(editingShop._id, [newTiktokUrl], token);
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          tiktokLinks: data.data
        }));
        setNewTiktokUrl('');
      } else {
        alert(data.message || 'Failed to add TikTok link');
      }
    } catch {
      alert('Error adding TikTok link');
    }
  };

  const handleRemoveTiktok = async (url: string) => {
    if (!editingShop || !token) return;
    if (!confirm('Remove this TikTok link?')) return;
    
    try {
      const data = await removeTiktokLink(editingShop._id, url, token);
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          tiktokLinks: data.data
        }));
      } else {
        alert(data.message || 'Failed to remove TikTok link');
      }
    } catch {
      alert('Error removing TikTok link');
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination?.pages || 1;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">Access Denied</div>
      </main>
    );
  }

  if (loading && shops.length === 0) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading shops...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8]">
            Manage Shops (Admin)
          </h1>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
          >
            + Add New Shop
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[#8A8177] text-sm mb-2">Search Shops</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-[#403A36]">
            <p className="text-[#8A8177] text-sm">
              {pagination ? (
                `Showing ${shops.length} of ${pagination.total} shops`
              ) : (
                'Loading...'
              )}
            </p>
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden"
            >
              {shop.photo ? (
                <img
                  src={shop.photo}
                  alt={shop.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-[#1A1A1A] flex items-center justify-center text-[#8A8177]">
                  No Image
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-[#F0E5D8] mb-2 truncate">
                  {shop.name}
                </h3>
                
                <div className="space-y-1 text-sm text-[#8A8177] mb-4">
                  <p className="truncate">📍 {shop.address}</p>
                  <p>📞 {shop.tel}</p>
                  <p>🕐 {shop.openTime} - {shop.closeTime}</p>
                  <p>💰 ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}</p>
                  <div className="flex items-center gap-3">
                    <p>⭐ {shop.rating.toFixed(1)}</p>
                    {shop.tiktokLinks && shop.tiktokLinks.length > 0 && (
                      <span className="text-[#E57A00]">🎵 {shop.tiktokLinks.length}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/shop/${shop._id}`}
                    className="flex-1 px-3 py-2 bg-[#454545] text-[#D4CFC6] rounded text-center hover:bg-[#5a5a5a] transition-colors text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleOpenEditModal(shop)}
                    className="flex-1 px-3 py-2 bg-[#E57A00] text-[#1A110A] rounded hover:bg-[#c46a00] transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(shop._id, shop.name)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {shops.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#8A8177] text-lg">No shops found</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
            >
              Add Your First Shop
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              ← Prev
            </button>

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

            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 bg-[#2B2B2B] border border-[#403A36] rounded-lg text-[#F0E5D8] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#E57A00] transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#F0E5D8]">
                  {editingShop ? 'Edit Shop' : 'Add New Shop'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-[#8A8177] hover:text-[#F0E5D8] text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Shop Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Location/Area *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Sukhumvit, Silom"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Telephone *</label>
                    <input
                      type="text"
                      name="tel"
                      value={formData.tel}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Map URL *</label>
                    <input
                      type="url"
                      name="map"
                      value={formData.map}
                      onChange={handleInputChange}
                      required
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Open Time *</label>
                    <input
                      type="time"
                      name="openTime"
                      value={formData.openTime}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Close Time *</label>
                    <input
                      type="time"
                      name="closeTime"
                      value={formData.closeTime}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Min Price (฿) *</label>
                    <input
                      type="number"
                      name="priceRangeMin"
                      value={formData.priceRangeMin}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Max Price (฿) *</label>
                    <input
                      type="number"
                      name="priceRangeMax"
                      value={formData.priceRangeMax}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Rating (0-5)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Photo URL</label>
                    <input
                      type="url"
                      name="photo"
                      value={formData.photo}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Google Place ID</label>
                    <input
                      type="text"
                      name="placeId"
                      value={formData.placeId}
                      onChange={handleInputChange}
                      placeholder="ChIJ..."
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  {/* Description Field */}
                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Brief description of the shop (optional - auto-generated if empty)"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none resize-none"
                    />
                  </div>

                  {/* TikTok Links - Edit Mode Only */}
                  {editingShop && (
                    <div className="md:col-span-2 border-t border-[#403A36] pt-4 mt-2">
                      <label className="block text-[#8A8177] text-sm mb-2">🎵 TikTok Videos</label>
                      
                      {/* Current TikTok Links */}
                      <div className="space-y-2 mb-4">
                        {(formData.tiktokLinks || []).length === 0 ? (
                          <p className="text-[#8A8177] text-sm italic">No TikTok videos added yet</p>
                        ) : (
                          (formData.tiktokLinks || []).map((url, i) => (
                            <div key={i} className="flex items-center gap-2 bg-[#1A1A1A] border border-[#403A36] rounded-lg px-3 py-2">
                              <span className="text-[#8A8177] text-sm shrink-0">Video {i + 1}</span>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-[#E57A00] text-xs truncate hover:underline"
                              >
                                {url}
                              </a>
                              <button
                                type="button"
                                onClick={() => handleRemoveTiktok(url)}
                                className="px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors text-xs shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add New TikTok */}
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newTiktokUrl}
                          onChange={(e) => setNewTiktokUrl(e.target.value)}
                          placeholder="https://www.tiktok.com/@username/video/..."
                          className="flex-1 bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddTiktok}
                          disabled={!newTiktokUrl.includes('tiktok.com')}
                          className="px-4 py-2 bg-[#E57A00] text-[#1A110A] rounded-lg font-medium hover:bg-[#c46a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-[#454545] text-[#D4CFC6] rounded hover:bg-[#5a5a5a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingShop ? 'Update Shop' : 'Create Shop')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
