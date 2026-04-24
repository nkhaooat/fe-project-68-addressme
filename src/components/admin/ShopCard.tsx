'use client';

import Link from 'next/link';
import ShopImage from '@/components/ShopImage';
import { Shop } from '@/libs/shops';

interface ShopCardProps {
  shop: Shop;
  onEdit: (shop: Shop) => void;
  onDelete: (id: string, name: string) => void;
}

export default function ShopCard({ shop, onEdit, onDelete }: ShopCardProps) {
  return (
    <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg overflow-hidden">
      <ShopImage photoProxy={shop.photoProxy} photo={shop.photo} name={shop.name} />

      <div className="p-4">
        <h3 className="text-lg font-bold text-dungeon-header-text mb-2 truncate">
          {shop.name}
        </h3>

        <div className="space-y-1 text-sm text-dungeon-secondary mb-4">
          <p className="truncate">📍 {shop.address}</p>
          <p>📞 {shop.tel}</p>
          <p>🕐 {shop.openTime} - {shop.closeTime}</p>
          <p>💰 ฿{shop.priceRangeMin} - ฿{shop.priceRangeMax}</p>
          <div className="flex items-center gap-3">
            <p>⭐ {shop.rating?.toFixed(1) || 'N/A'}</p>
            {shop.tiktokLinks && shop.tiktokLinks.length > 0 && (
              <span className="text-dungeon-accent">🎵 {shop.tiktokLinks.length}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/shop/${shop._id}`}
            className="flex-1 text-center px-3 py-2 bg-dungeon-star-empty text-dungeon-primary rounded hover:bg-dungeon-star-half transition-colors text-sm"
          >
            View
          </Link>
          <button
            onClick={() => onEdit(shop)}
            className="flex-1 px-3 py-2 bg-dungeon-accent text-dungeon-dark-text rounded hover:bg-dungeon-accent-dark transition-colors font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(shop._id, shop.name)}
            className="px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors text-sm"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
