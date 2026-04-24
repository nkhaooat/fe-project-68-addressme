'use client';

import { Shop } from '@/libs/shops';

interface ShopModalProps {
  isOpen: boolean;
  editingShop: Shop | null;
  formData: Omit<Shop, '_id'>;
  isSubmitting: boolean;
  newTiktokUrl: string;
  onFormDataChange: (data: Omit<Shop, '_id'>) => void;
  onNewTiktokUrlChange: (url: string) => void;
  onAddTiktok: () => void;
  onRemoveTiktok: (url: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ShopModal({
  isOpen,
  editingShop,
  formData,
  isSubmitting,
  newTiktokUrl,
  onFormDataChange,
  onNewTiktokUrlChange,
  onAddTiktok,
  onRemoveTiktok,
  onClose,
  onSubmit,
}: ShopModalProps) {
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFormDataChange({
      ...formData,
      [name]: name.includes('price') || name === 'rating' ? parseFloat(value) || 0 : value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dungeon-header-text">
              {editingShop ? 'Edit Shop' : 'Add New Shop'}
            </h2>
            <button onClick={onClose} className="text-dungeon-secondary hover:text-dungeon-header-text text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Shop Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Address *</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={2}
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Location/Area *</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required placeholder="e.g., Sukhumvit, Silom"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Telephone *</label>
                <input type="text" name="tel" value={formData.tel} onChange={handleInputChange} required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Map URL *</label>
                <input type="url" name="map" value={formData.map} onChange={handleInputChange} required placeholder="https://maps.google.com/..."
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Open Time *</label>
                <input type="time" name="openTime" value={formData.openTime} onChange={handleInputChange} required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Close Time *</label>
                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleInputChange} required
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Min Price (฿) *</label>
                <input type="number" name="priceRangeMin" value={formData.priceRangeMin} onChange={handleInputChange} required min="0"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Max Price (฿) *</label>
                <input type="number" name="priceRangeMax" value={formData.priceRangeMax} onChange={handleInputChange} required min="0"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div>
                <label className="block text-dungeon-secondary text-sm mb-1">Rating (0-5)</label>
                <input type="number" name="rating" value={formData.rating} onChange={handleInputChange} min="0" max="5" step="0.1"
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Photo URL</label>
                <input type="url" name="photo" value={formData.photo || ''} onChange={handleInputChange} placeholder="https://..."
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-dungeon-secondary text-sm mb-1">Google Place ID</label>
                <input type="text" name="placeId" value={formData.placeId || ''} onChange={handleInputChange} placeholder="ChIJ..."
                  className="w-full bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none" />
              </div>

              {/* TikTok Links - Edit Mode Only */}
              {editingShop && (
                <div className="md:col-span-2 border-t border-dungeon-outline pt-4 mt-2">
                  <label className="block text-dungeon-secondary text-sm mb-2">🎵 TikTok Videos</label>

                  <div className="space-y-2 mb-4">
                    {(formData.tiktokLinks || []).length === 0 ? (
                      <p className="text-dungeon-secondary text-sm italic">No TikTok videos added yet</p>
                    ) : (
                      (formData.tiktokLinks || []).map((url, i) => (
                        <div key={i} className="flex items-center gap-2 bg-dungeon-canvas border border-dungeon-outline rounded-lg px-3 py-2">
                          <span className="text-dungeon-secondary text-sm shrink-0">Video {i + 1}</span>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 text-dungeon-accent text-xs truncate hover:underline">{url}</a>
                          <button type="button" onClick={() => onRemoveTiktok(url)} className="px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors text-xs shrink-0">Remove</button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input type="url" value={newTiktokUrl} onChange={(e) => onNewTiktokUrlChange(e.target.value)} placeholder="https://www.tiktok.com/@username/video/..."
                      className="flex-1 bg-dungeon-canvas border border-dungeon-outline rounded-lg px-4 py-2 text-dungeon-header-text focus:border-dungeon-accent focus:outline-none text-sm" />
                    <button type="button" onClick={onAddTiktok} disabled={!newTiktokUrl.includes('tiktok.com')}
                      className="px-4 py-2 bg-dungeon-accent text-dungeon-dark-text rounded-lg font-medium hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">Add</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-dungeon-star-empty text-dungeon-primary rounded hover:bg-dungeon-star-half transition-colors">Cancel</button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-dungeon-accent text-dungeon-dark-text font-bold rounded hover:bg-dungeon-accent-dark transition-colors disabled:opacity-50">
                {isSubmitting ? 'Saving...' : (editingShop ? 'Update Shop' : 'Create Shop')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
