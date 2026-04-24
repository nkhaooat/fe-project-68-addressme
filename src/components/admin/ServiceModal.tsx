'use client';

import { Shop } from '@/libs/shops';
import { Service } from '@/libs/services';
import { useEffect, useState } from 'react';

const areaOptions = ['full body', 'back', 'foot', 'head', 'shoulder', 'face', 'other'];
const oilOptions = ['none', 'aromatherapy', 'herbal', 'coconut', 'jojoba', 'other'];

interface ServiceModalProps {
  isOpen: boolean;
  editingService: Service | null;
  formData: Omit<Service, '_id'>;
  isSubmitting: boolean;
  shops: Shop[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: Omit<Service, '_id'>) => void;
}

export default function ServiceModal({
  isOpen, editingService, formData, isSubmitting, shops,
  onClose, onSubmit, onFormDataChange,
}: ServiceModalProps) {
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);

  useEffect(() => {
    if (isOpen) {
      const shopName = editingService
        ? (typeof editingService.shop === 'object' ? editingService.shop.name : shops.find(s => s._id === editingService.shop)?.name || '')
        : '';
      setShopSearchQuery(shopName);
      setFilteredShops(shops.slice(0, 10));
      setIsShopDropdownOpen(false);
    }
  }, [isOpen, editingService, shops]);

  useEffect(() => {
    if (isShopDropdownOpen) {
      const handler = (e: MouseEvent) => {
        if (!(e.target as HTMLElement).closest('.shop-search-container')) {
          setIsShopDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isShopDropdownOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: name === 'duration' || name === 'price' || name === 'sessions' ? parseInt(value) || 0 : value,
    });
  };

  const handleShopSearch = (query: string) => {
    setShopSearchQuery(query);
    if (!editingService) onFormDataChange({ ...formData, shop: '' });
    const filtered = query.trim()
      ? shops.filter(shop => shop.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
      : shops.slice(0, 10);
    setFilteredShops(filtered);
    setIsShopDropdownOpen(true);
  };

  const handleSelectShop = (shop: Shop) => {
    onFormDataChange({ ...formData, shop: shop._id });
    setShopSearchQuery(shop.name);
    setIsShopDropdownOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dungeon-header-text">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button onClick={onClose} className="text-dungeon-secondary hover:text-dungeon-header-text text-2xl">×</button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Service Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              {/* Shop search dropdown */}
              <div className="md:col-span-2 relative shop-search-container">
                <label className="block text-dungeon-secondary text-sm mb-1">Shop *</label>
                <input type="text" value={shopSearchQuery} onChange={(e) => handleShopSearch(e.target.value)}
                  onFocus={() => { setFilteredShops(shopSearchQuery ? shops.filter(s => s.name.toLowerCase().includes(shopSearchQuery.toLowerCase())).slice(0, 10) : shops.slice(0, 10)); setIsShopDropdownOpen(true); }}
                  placeholder="Search for a shop..." required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
                {isShopDropdownOpen && filteredShops.length > 0 && (
                  <div className="absolute z-10 w-full bg-dungeon-surface border border-dungeon-outline rounded-lg mt-1 max-h-60 overflow-y-auto">
                    {filteredShops.map(shop => (
                      <button key={shop._id} type="button" onClick={() => handleSelectShop(shop)}
                        className="w-full text-left px-4 py-2 text-dungeon-primary hover:bg-dungeon-canvas transition-colors">
                        {shop.name}
                      </button>
                    ))}
                  </div>
                )}
                {!formData.shop && <p className="text-red-400 text-xs mt-1">Please select a shop</p>}
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Area *</label>
                <select name="area" value={formData.area} onChange={handleInputChange}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none">
                  {areaOptions.map(area => <option key={area} value={area} className="capitalize">{area}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Duration (minutes) *</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required min="15" step="15"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Oil Type</label>
                <select name="oil" value={formData.oil} onChange={handleInputChange}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none">
                  {oilOptions.map(oil => <option key={oil} value={oil} className="capitalize">{oil}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Price (฿) *</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Sessions</label>
                <input type="number" name="sessions" value={formData.sessions || 1} onChange={handleInputChange} min="1"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} placeholder="Describe the service..."
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 bg-dungeon-star-empty text-dungeon-primary rounded hover:bg-dungeon-star-half transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
