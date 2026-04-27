'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getShops, createShop, updateShop, deleteShop, Shop, ShopQueryParams, addTiktokLinks, removeTiktokLink } from '@/libs/shops';
import Pagination from '@/components/Pagination';
import ErrorBanner from '@/components/ErrorBanner';
import AccessDenied from '@/components/AccessDenied';
import { AdminShopsSkeleton, FadeIn } from '@/components/Skeletons';
import ShopCard from '@/components/admin/ShopCard';
import ShopModal from '@/components/admin/ShopModal';
import { PaginationData } from '@/types/api';

const emptyShop: Omit<Shop, '_id'> = {
  name: '', address: '', location: '', tel: '', map: '',
  openTime: '09:00', closeTime: '21:00',
  priceRangeMin: 0, priceRangeMax: 0, rating: 0,
  photo: '', placeId: '', tiktokLinks: []
};

export default function AdminShopsPage() {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const { addToast } = useToast();
  const [pendingDeleteShop, setPendingDeleteShop] = useState<{id: string; name: string} | null>(null);
  const [pendingRemoveTiktok, setPendingRemoveTiktok] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [formData, setFormData] = useState<Omit<Shop, '_id'>>(emptyShop);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTiktokUrl, setNewTiktokUrl] = useState('');

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      try {
        const params: ShopQueryParams = { page: currentPage, limit: ITEMS_PER_PAGE };
        if (searchQuery) params.search = searchQuery;
        const res = await getShops(params);
        if (res.success) {
          setShops(res.data);
          setPagination(res.pagination || null);
        } else {
          setError(res.message || 'Failed to load shops');
        }
      } catch {
        setError('Error loading shops');
      } finally {
        setLoading(false);
      }
    }
    if (token && user?.role === 'admin') fetchShops();
  }, [token, user, currentPage, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingShop(null);
    setFormData(emptyShop);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shop: Shop) => {
    setEditingShop(shop);
    setFormData({
      name: shop.name, address: shop.address, location: shop.location, tel: shop.tel,
      map: shop.map, openTime: shop.openTime, closeTime: shop.closeTime,
      priceRangeMin: shop.priceRangeMin, priceRangeMax: shop.priceRangeMax,
      rating: shop.rating || 0, photo: shop.photo || '', placeId: shop.placeId || '',
      tiktokLinks: shop.tiktokLinks || []
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShop(null);
    setFormData(emptyShop);
    setNewTiktokUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editingShop
        ? await updateShop(editingShop._id, formData, token!)
        : await createShop(formData, token!);

      if (res.success) {
        const params: ShopQueryParams = { page: currentPage, limit: ITEMS_PER_PAGE };
        if (searchQuery) params.search = searchQuery;
        const refreshRes = await getShops(params);
        if (refreshRes.success) {
          setShops(refreshRes.data);
          setPagination(refreshRes.pagination || null);
        }
        handleCloseModal();
      } else {
        addToast(res.message || `Failed to ${editingShop ? 'update' : 'create'} shop`);
      }
    } catch {
      addToast(`Error ${editingShop ? 'updating' : 'creating'} shop`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, shopName: string) => {
    setPendingDeleteShop({ id, name: shopName });
  };

  const confirmDeleteShop = async () => {
    const { id } = pendingDeleteShop!;
    setPendingDeleteShop(null);
    try {
      const res = await deleteShop(id, token!);
      if (res.success) {
        setShops(shops.filter(s => s._id !== id));
        if (pagination) setPagination({ ...pagination, total: pagination.total - 1 });
      } else {
        addToast(res.message || 'Failed to delete shop');
      }
    } catch {
      addToast('Error deleting shop');
    }
  };

  const handleAddTiktok = async () => {
    if (!editingShop || !token) return;
    const url = newTiktokUrl.trim();
    // Strict validation: must be https://tiktok.com/... or https://www.tiktok.com/...
    const tiktokUrlRegex = /^https:\/\/(?:www\.)?tiktok\.com\/@[^\s]+$/;
    if (!tiktokUrlRegex.test(url)) {
      addToast('Invalid TikTok URL. Must be https://tiktok.com/@... or https://www.tiktok.com/@...');
      return;
    }
    // Prevent XSS: reject any URL containing <, >, ", ', or javascript:
    if (/[<>"']|javascript:/i.test(url)) {
      addToast('Invalid characters in URL');
      return;
    }
    try {
      const data = await addTiktokLinks(editingShop._id, [url], token);
      if (data.success) {
        setFormData(prev => ({ ...prev, tiktokLinks: data.data }));
        setNewTiktokUrl('');
      } else {
        addToast(data.message || 'Failed to add TikTok link');
      }
    } catch {
      addToast('Error adding TikTok link');
    }
  };

  const handleRemoveTiktok = (url: string) => {
    if (!editingShop || !token) return;
    setPendingRemoveTiktok(url);
  };

  const confirmRemoveTiktok = async () => {
    const url = pendingRemoveTiktok!;
    setPendingRemoveTiktok(null);
    if (!editingShop || !token) return;
    try {
      const data = await removeTiktokLink(editingShop._id, url, token);
      if (data.success) {
        setFormData(prev => ({ ...prev, tiktokLinks: data.data }));
      } else {
        addToast(data.message || 'Failed to remove TikTok link');
      }
    } catch {
      addToast('Error removing TikTok link');
    }
  };

  if (user?.role !== 'admin') return <AccessDenied />;
  if (loading && shops.length === 0) return <AdminShopsSkeleton />;

  return (<FadeIn>
    <>
    <main className="min-h-screen bg-dungeon-canvas py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dungeon-header-text">Manage Shops (Admin)</h1>
          <button onClick={handleOpenAddModal}
            className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors">
            + Add New Shop
          </button>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* Search */}
        <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-dungeon-secondary text-sm mb-2">Search Shops</label>
              <input type="text" placeholder="Search by name..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-dungeon-outline">
            <p className="text-dungeon-secondary text-sm">
              {pagination ? `Showing ${shops.length} of ${pagination.total} shops` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} onEdit={handleOpenEditModal} onDelete={handleDelete} />
          ))}
        </div>

        {/* Empty state */}
        {shops.length === 0 && !loading && (
          <div className="text-center text-dungeon-secondary py-12">
            <p className="text-xl mb-2">No shops found</p>
            <p className="text-sm">Try adjusting your search or add a new shop</p>
          </div>
        )}

        <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <ShopModal
        isOpen={isModalOpen}
        editingShop={editingShop}
        formData={formData}
        isSubmitting={isSubmitting}
        newTiktokUrl={newTiktokUrl}
        onFormDataChange={setFormData}
        onNewTiktokUrlChange={setNewTiktokUrl}
        onAddTiktok={handleAddTiktok}
        onRemoveTiktok={handleRemoveTiktok}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </main>
    <ConfirmDialog
      open={pendingDeleteShop !== null}
      title="Delete Shop"
      message={`Are you sure you want to delete "${pendingDeleteShop?.name}"? This action cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={confirmDeleteShop}
      onCancel={() => setPendingDeleteShop(null)}
    />
    <ConfirmDialog
      open={pendingRemoveTiktok !== null}
      title="Remove TikTok Link"
      message="Remove this TikTok link?"
      confirmLabel="Remove"
      onConfirm={confirmRemoveTiktok}
      onCancel={() => setPendingRemoveTiktok(null)}
    />
    </>
  </FadeIn>);
}
