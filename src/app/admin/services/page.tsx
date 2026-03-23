'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getServices, createService, updateService, deleteService, Service, ServiceQueryParams } from '@/libs/services';
import { getShops, Shop } from '@/libs/shops';

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

const emptyService: Omit<Service, '_id'> = {
  name: '',
  area: 'full body',
  duration: 60,
  oil: 'none',
  price: 0,
  sessions: 1,
  description: '',
  shop: ''
};

const areaOptions = ['full body', 'back', 'foot', 'head', 'shoulder', 'face', 'other'];
const oilOptions = ['none', 'aromatherapy', 'herbal', 'coconut', 'jojoba', 'other'];

export default function AdminServicesPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [services, setServices] = useState<Service[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, '_id'>>(emptyService);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(''); // Raw input value
  const [searchQuery, setSearchQuery] = useState(''); // Debounced value for API
  const [shopFilter, setShopFilter] = useState('');
  
  // Debounce search input
  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Update search query when debounced input changes
  useEffect(() => {
    setSearchQuery(debouncedSearchInput);
    setCurrentPage(1);
  }, [debouncedSearchInput]);

  // Shop search for modal
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  
  // Shop filter search
  const [shopFilterSearch, setShopFilterSearch] = useState('');
  const [isShopFilterDropdownOpen, setIsShopFilterDropdownOpen] = useState(false);
  const [filteredShopOptions, setFilteredShopOptions] = useState<Shop[]>([]);
  
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch services with pagination, search, shop filter and shops in parallel
        const params: ServiceQueryParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: '-createdAt'
        };

        // Add server-side search if query exists
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Add server-side shop filter if selected
        if (shopFilter) {
          params.shop = shopFilter;
        }

        const [servicesRes, shopsRes] = await Promise.all([
          getServices(params),
          getShops({ limit: 1000 }) // Fetch more shops for the search
        ]);

        if (servicesRes.success) {
          setServices(servicesRes.data);
          setPagination(servicesRes.pagination);
        } else {
          setError(servicesRes.message || 'Failed to load services');
        }

        if (shopsRes.success) {
          setShops(shopsRes.data);
        }
      } catch {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    }

    if (token && user?.role === 'admin') {
      fetchData();
    }
  }, [token, user, currentPage, searchQuery, shopFilter]);

  // Close shop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.shop-search-container')) {
        setIsShopDropdownOpen(false);
      }
      if (!target.closest('.shop-filter-container')) {
        setIsShopFilterDropdownOpen(false);
      }
    }
    
    if (isShopDropdownOpen || isShopFilterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isShopDropdownOpen, isShopFilterDropdownOpen]);

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

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData(emptyService);
    setShopSearchQuery('');
    setFilteredShops(shops.slice(0, 10)); // Show first 10 shops initially
    setIsShopDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    const shopId = typeof service.shop === 'string' ? service.shop : service.shop._id;
    const shopName = getShopName(service.shop);
    setFormData({
      name: service.name,
      area: service.area,
      duration: service.duration,
      oil: service.oil,
      price: service.price,
      sessions: service.sessions,
      description: service.description || '',
      shop: service.shop
    });
    setShopSearchQuery(shopName);
    setIsShopDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(emptyService);
    setShopSearchQuery('');
    setFilteredShops([]);
    setIsShopDropdownOpen(false);
  };

  const handleShopSearch = (query: string) => {
    setShopSearchQuery(query);
    if (!editingService) {
      setFormData(prev => ({ ...prev, shop: '' }));
    }
    
    if (query.trim()) {
      const filtered = shops
        .filter(shop => shop.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
      setFilteredShops(filtered);
      setIsShopDropdownOpen(true);
    } else {
      setFilteredShops(shops.slice(0, 10));
      setIsShopDropdownOpen(true);
    }
  };

  const handleSelectShop = (shop: Shop) => {
    setFormData(prev => ({ ...prev, shop: shop._id }));
    setShopSearchQuery(shop.name);
    setIsShopDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let res;
      if (editingService) {
        res = await updateService(editingService._id, formData, token!);
      } else {
        res = await createService(formData, token!);
      }
      
      if (res.success) {
        // Refresh services with current pagination
        const params: ServiceQueryParams = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: '-createdAt'
        };
        const servicesRes = await getServices(params);
        if (servicesRes.success) {
          setServices(servicesRes.data);
          setPagination(servicesRes.pagination);
        }
        handleCloseModal();
      } else {
        alert(res.message || `Failed to ${editingService ? 'update' : 'create'} service`);
      }
    } catch {
      alert(`Error ${editingService ? 'updating' : 'creating'} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, serviceName: string) => {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)) return;

    try {
      const res = await deleteService(id, token!);
      if (res.success) {
        setServices(services.filter(s => s._id !== id));
      } else {
        alert(res.message || 'Failed to delete service');
      }
    } catch {
      alert('Error deleting service');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' || name === 'sessions' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const getShopName = (shop: string | { _id: string; name: string }) => {
    if (typeof shop === 'object' && shop !== null) {
      return shop.name || 'Unknown Shop';
    }
    // Handle string ID comparison - convert both to string for comparison
    const foundShop = shops.find(s => String(s._id) === String(shop));
    return foundShop?.name || 'Unknown Shop';
  };

  if (user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-red-400 text-xl">Access Denied</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-[#E57A00] text-xl">Loading services...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#F0E5D8]">
            Manage Services (Admin)
          </h1>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
          >
            + Add New Service
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8A8177] text-sm mb-2">Search Services by Name</label>
              <input
                type="text"
                placeholder="Search across all services..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShopFilter(''); // Clear shop filter when searching
                  setShopFilterSearch('');
                }}
                className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
              />
              {searchInput !== searchQuery && (
                <p className="text-[#8A8177] text-xs mt-1">Typing...</p>
              )}
              {searchQuery && searchInput === searchQuery && (
                <p className="text-[#8A8177] text-xs mt-1">Searching across all {pagination?.total || 0} services</p>
              )}
            </div>
            <div className="relative shop-filter-container">
              <label className="block text-[#8A8177] text-sm mb-2">Or Select a Shop</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a shop to view its services..."
                  value={shopFilterSearch}
                  onChange={(e) => {
                    const query = e.target.value;
                    setShopFilterSearch(query);
                    if (query.trim()) {
                      setFilteredShopOptions(
                        shops.filter(shop => shop.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
                      );
                    } else {
                      setFilteredShopOptions(shops.slice(0, 10));
                    }
                    setIsShopFilterDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setFilteredShopOptions(shops.slice(0, 10));
                    setIsShopFilterDropdownOpen(true);
                  }}
                  className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFilteredShopOptions(shops.slice(0, 10));
                    setIsShopFilterDropdownOpen(!isShopFilterDropdownOpen);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8177] hover:text-[#D4CFC6]"
                >
                  <svg className={`w-5 h-5 transition-transform ${isShopFilterDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {shopFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setShopFilter('');
                      setShopFilterSearch('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-[#8A8177] hover:text-red-400"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Shop Filter Dropdown */}
              {isShopFilterDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-[#403A36] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredShopOptions.map(shop => (
                    <button
                      key={shop._id}
                      type="button"
                      onClick={() => {
                        setShopFilter(shop._id);
                        setShopFilterSearch(shop.name);
                        setSearchQuery(''); // Clear search when selecting shop
                        setIsShopFilterDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-4 py-2 transition-colors ${
                        shopFilter === shop._id ? 'text-[#E57A00] bg-[#2B2B2B]' : 'text-[#D4CFC6] hover:bg-[#2B2B2B] hover:text-[#E57A00]'
                      }`}
                    >
                      {shop.name}
                      <span className="text-[#8A8177] text-sm ml-2">- {shop.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#403A36]">
            <p className="text-[#8A8177] text-sm">
              {pagination ? (
                searchQuery ? (
                  `Searching "${searchQuery}" - Found ${pagination.total} matching services`
                ) : shopFilter ? (
                  `Showing services from ${shops.find(s => s._id === shopFilter)?.name || 'selected shop'} (${pagination.total} total)`
                ) : (
                  `Select a shop or enter a search term to view services (${pagination?.total || 0} total in database)`
                )
              ) : (
                'Loading...'
              )}
            </p>
          </div>
        </div>

        {/* Services Table - Only show when searching or shop selected */}
        {(searchQuery || shopFilter) && services.length > 0 && (
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1A1A1A]">
                  <tr>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Service Name</th>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Shop</th>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Area</th>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Duration</th>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Price</th>
                    <th className="text-left px-4 py-3 text-[#8A8177] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#403A36]">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-[#333333]">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-[#F0E5D8] font-medium">{service.name}</p>
                          {service.description && (
                            <p className="text-[#8A8177] text-sm truncate max-w-xs">{service.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#D4CFC6]">{typeof service.shop === 'object' ? service.shop.name : getShopName(service.shop)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#454545] rounded text-[#D4CFC6] text-sm capitalize">
                          {service.area}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#D4CFC6]">{service.duration} min</td>
                      <td className="px-4 py-3 text-[#D4CFC6]">฿{service.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(service)}
                            className="px-3 py-1 bg-[#E57A00] text-[#1A110A] rounded hover:bg-[#c46a00] transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(service._id, service.name)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State - No search or shop selected */}
        {!searchQuery && !shopFilter && !loading && (
          <div className="text-center py-16 bg-[#2B2B2B] border border-[#403A36] rounded-lg">
            <p className="text-[#D4CFC6] text-xl mb-2">👋 Welcome to Service Management</p>
            <p className="text-[#8A8177] mb-6">Select a shop above to view its services, or search by service name</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => document.querySelector<HTMLInputElement>('.shop-filter-container input')?.focus()}
                className="px-4 py-2 bg-[#454545] text-[#D4CFC6] rounded hover:bg-[#5a5a5a] transition-colors"
              >
                Select a Shop
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
              >
                + Add New Service
              </button>
            </div>
          </div>
        )}

        {/* Empty State - Search or filter returned no results */}
        {(searchQuery || shopFilter) && services.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#8A8177] text-lg">
              {searchQuery ? `No services found matching "${searchQuery}"` : 'No services found for this shop'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-[#E57A00] text-[#1A110A] font-bold rounded hover:bg-[#c46a00] transition-colors"
            >
              Add New Service
            </button>
          </div>
        )}

        {/* Pagination - only show when searching or shop selected and has multiple pages */}
        {pagination && pagination.pages > 1 && (searchQuery || shopFilter) && (
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

        {/* Message when shop filtering */}
        {shopFilter && services.length > 0 && (
          <p className="text-center text-[#8A8177] text-sm mt-8">
            Showing filtered results. Clear shop filter to see all pages.
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2B2B2B] border border-[#403A36] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#F0E5D8]">
                  {editingService ? 'Edit Service' : 'Add New Service'}
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
                    <label className="block text-[#8A8177] text-sm mb-1">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Thai Traditional Massage"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 relative shop-search-container">
                    <label className="block text-[#8A8177] text-sm mb-1">Shop *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={shopSearchQuery}
                        onChange={(e) => handleShopSearch(e.target.value)}
                        onFocus={() => {
                          if (!editingService) {
                            setFilteredShops(shops.slice(0, 10));
                            setIsShopDropdownOpen(true);
                          }
                        }}
                        placeholder="Search for a shop..."
                        disabled={!!editingService}
                        className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {!editingService && (
                        <button
                          type="button"
                          onClick={() => {
                            setFilteredShops(shops.slice(0, 10));
                            setIsShopDropdownOpen(!isShopDropdownOpen);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8177] hover:text-[#D4CFC6]"
                        >
                          <svg className={`w-5 h-5 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Shop Search Dropdown */}
                    {isShopDropdownOpen && !editingService && (
                      <div className="absolute z-10 w-full mt-1 bg-[#1A1A1A] border border-[#403A36] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredShops.length > 0 ? (
                          filteredShops.map(shop => (
                            <button
                              key={shop._id}
                              type="button"
                              onClick={() => handleSelectShop(shop)}
                              className="w-full text-left px-4 py-2 text-[#D4CFC6] hover:bg-[#2B2B2B] hover:text-[#E57A00] transition-colors"
                            >
                              {shop.name}
                              <span className="text-[#8A8177] text-sm ml-2">- {shop.address}</span>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-[#8A8177]">No shops found</div>
                        )}
                      </div>
                    )}
                    
                    {editingService && (
                      <p className="text-[#8A8177] text-xs mt-1">Shop cannot be changed when editing</p>
                    )}
                    {!editingService && !formData.shop && (
                      <p className="text-red-400 text-xs mt-1">Please select a shop</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Massage Area *</label>
                    <select
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    >
                      {areaOptions.map(area => (
                        <option key={area} value={area} className="capitalize">{area}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      step="15"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Oil Type</label>
                    <select
                      name="oil"
                      value={formData.oil}
                      onChange={handleInputChange}
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    >
                      {oilOptions.map(oil => (
                        <option key={oil} value={oil} className="capitalize">{oil}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Price (฿) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#8A8177] text-sm mb-1">Sessions</label>
                    <input
                      type="number"
                      name="sessions"
                      value={formData.sessions}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[#8A8177] text-sm mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe the service..."
                      className="w-full bg-[#1A1A1A] border border-[#403A36] rounded-lg px-4 py-2 text-[#F0E5D8] focus:border-[#E57A00] focus:outline-none resize-none"
                    />
                  </div>
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
                    {isSubmitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
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
