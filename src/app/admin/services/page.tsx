'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getServices, createService, updateService, deleteService, Service, ServiceQueryParams } from '@/libs/services';
import { getShops, Shop } from '@/libs/shops';
import Pagination from '@/components/Pagination';
import ErrorBanner from '@/components/ErrorBanner';
import AccessDenied from '@/components/AccessDenied';
import { SkeletonPage } from '@/components/Skeleton';
import ServiceCard from '@/components/admin/ServiceCard';
import ServiceModal from '@/components/admin/ServiceModal';
import { useDebounce } from '@/hooks/useDebounce';
import { PaginationData } from '@/types/api';

const emptyService: Omit<Service, '_id'> = {
  name: '', area: 'full body', duration: 60, oil: 'none',
  price: 0, sessions: 1, description: '', shop: ''
};

export default function AdminServicesPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { addToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<{id: string; name: string} | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Service, '_id'>>(emptyService);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [shopFilter, setShopFilter] = useState('');

  // Shop filter search
  const [shopFilterSearch, setShopFilterSearch] = useState('');
  const [isShopFilterDropdownOpen, setIsShopFilterDropdownOpen] = useState(false);
  const [filteredShopOptions, setFilteredShopOptions] = useState<Shop[]>([]);

  const debouncedSearchInput = useDebounce(searchInput, 500);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    setSearchQuery(debouncedSearchInput);
    setCurrentPage(1);
  }, [debouncedSearchInput]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params: ServiceQueryParams = { page: currentPage, limit: ITEMS_PER_PAGE, sort: '-createdAt' };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (shopFilter) params.shop = shopFilter;

        const [servicesRes, shopsRes] = await Promise.all([
          getServices(params),
          getShops({ limit: 1000 })
        ]);

        if (servicesRes.success) {
          setServices(servicesRes.data);
          setPagination(servicesRes.pagination || null);
        } else {
          setError(servicesRes.message || 'Failed to load services');
        }
        if (shopsRes.success) setShops(shopsRes.data);
      } catch {
        setError('Error loading data');
      } finally {
        setLoading(false);
      }
    }
    if (token && user?.role === 'admin') fetchData();
  }, [token, user, currentPage, searchQuery, shopFilter]);

  // Close shop filter dropdown on outside click
  useEffect(() => {
    if (!isShopFilterDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.shop-filter-container')) setIsShopFilterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isShopFilterDropdownOpen]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData(emptyService);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name, area: service.area, duration: service.duration,
      oil: service.oil, price: service.price, sessions: service.sessions || 1,
      description: service.description || '', shop: service.shop
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData(emptyService);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editingService
        ? await updateService(editingService._id, formData, token!)
        : await createService(formData, token!);

      if (res.success) {
        const params: ServiceQueryParams = { page: currentPage, limit: ITEMS_PER_PAGE, sort: '-createdAt' };
        const servicesRes = await getServices(params);
        if (servicesRes.success) {
          setServices(servicesRes.data);
          setPagination(servicesRes.pagination || null);
        }
        handleCloseModal();
      } else {
        addToast(res.message || `Failed to ${editingService ? 'update' : 'create'} service`);
      }
    } catch {
      addToast(`Error ${editingService ? 'updating' : 'creating'} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, serviceName: string) => {
    setPendingDelete({ id, name: serviceName });
  };

  const confirmDeleteService = async () => {
    const { id } = pendingDelete!;
    setPendingDelete(null);
    try {
      const res = await deleteService(id, token!);
      if (res.success) {
        setServices(services.filter(s => s._id !== id));
      } else {
        addToast(res.message || 'Failed to delete service');
      }
    } catch {
      addToast('Error deleting service');
    }
  };

  const handleShopFilterSearch = (query: string) => {
    setShopFilterSearch(query);
    const filtered = query.trim()
      ? shops.filter(s => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
      : shops.slice(0, 10);
    setFilteredShopOptions(filtered);
    setIsShopFilterDropdownOpen(true);
  };

  const handleSelectShopFilter = (shop: Shop) => {
    setShopFilter(shop._id);
    setShopFilterSearch(shop.name);
    setIsShopFilterDropdownOpen(false);
    setCurrentPage(1);
  };

  const clearShopFilter = () => {
    setShopFilter('');
    setShopFilterSearch('');
    setIsShopFilterDropdownOpen(false);
    setCurrentPage(1);
  };

  if (user?.role !== 'admin') return <AccessDenied />;
  if (loading) return <main className="min-h-screen bg-dungeon-canvas py-8 px-4"><SkeletonPage type="table" /></main>;

  return (
    <>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text">Manage Services (Admin)</h1>
          <button onClick={handleOpenAddModal}
            className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors">
            + Add New Service
          </button>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Filters */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-dungeon-secondary text-sm mb-2">Search Services by Name</label>
              <input type="text" placeholder="Search across all services..." value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); clearShopFilter(); }}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              {searchInput !== searchQuery && <p className="text-dungeon-secondary text-xs mt-1">Typing...</p>}
              {searchQuery && searchInput === searchQuery && (
                <p className="text-dungeon-secondary text-xs mt-1">Searching across all {pagination?.total || 0} services</p>
              )}
            </div>
            <div className="relative shop-filter-container">
              <label className="block text-dungeon-secondary text-sm mb-2">Or Select a Shop</label>
              <input type="text" placeholder="Search shops..." value={shopFilterSearch}
                onChange={(e) => handleShopFilterSearch(e.target.value)}
                onFocus={() => { setFilteredShopOptions(shops.slice(0, 10)); setIsShopFilterDropdownOpen(true); }}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              {shopFilter && (
                <button onClick={clearShopFilter} className="absolute right-2 top-8 text-dungeon-secondary hover:text-dungeon-header-text">✕</button>
              )}
              {isShopFilterDropdownOpen && filteredShopOptions.length > 0 && (
                <div className="absolute z-10 w-full bg-dungeon-surface border border-dungeon-outline rounded-lg mt-1 max-h-60 overflow-y-auto">
                  {filteredShopOptions.map(shop => (
                    <button key={shop._id} type="button" onClick={() => handleSelectShopFilter(shop)}
                      className={`w-full text-left px-4 py-2 hover:bg-dungeon-canvas transition-colors ${shopFilter === shop._id ? 'text-dungeon-accent' : 'text-dungeon-primary'}`}>
                      {shop.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dungeon-outline">
            <p className="text-dungeon-secondary text-sm">
              {pagination ? `Showing ${services.length} of ${pagination.total} services` : 'Loading...'}
              {shopFilter && ' (filtered by shop)'}
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} shops={shops}
              onEdit={handleOpenEditModal} onDelete={handleDelete} />
          ))}
        </div>

        {services.length === 0 && !loading && (
          <div className="text-center text-dungeon-secondary py-12">
            <p className="text-xl mb-2">No services found</p>
            <p className="text-sm">Try adjusting your search or add a new service</p>
          </div>
        )}

        <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        editingService={editingService}
        formData={formData}
        isSubmitting={isSubmitting}
        shops={shops}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </main>
    <ConfirmDialog
      open={pendingDelete !== null}
      title="Delete Service"
      message={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={confirmDeleteService}
      onCancel={() => setPendingDelete(null)}
    />
    </>
  );
}
