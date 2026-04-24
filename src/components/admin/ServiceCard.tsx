'use client';

import { Shop } from '@/libs/shops';
import { Service } from '@/libs/services';

interface ServiceCardProps {
  service: Service;
  shops: Shop[];
  onEdit: (service: Service) => void;
  onDelete: (id: string, name: string) => void;
}

function getShopName(shop: string | { _id: string; name: string }, shops: Shop[]): string {
  if (typeof shop === 'object' && shop !== null) return shop.name || 'Unknown Shop';
  const foundShop = shops.find(s => String(s._id) === String(shop));
  return foundShop?.name || 'Unknown Shop';
}

export default function ServiceCard({ service, shops, onEdit, onDelete }: ServiceCardProps) {
  return (
    <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-dungeon-header-text">{service.name}</h3>
          <p className="text-sm text-dungeon-sub-header">
            {getShopName(service.shop, shops)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(service)}
            className="px-3 py-1.5 bg-dungeon-accent text-dungeon-dark-text rounded hover:bg-dungeon-accent-dark transition-colors font-medium text-sm">
            Edit
          </button>
          <button onClick={() => onDelete(service._id, service.name)}
            className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition-colors text-sm">
            🗑️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-dungeon-secondary">Area:</span>{' '}
          <span className="text-dungeon-primary capitalize">{service.area}</span>
        </div>
        <div>
          <span className="text-dungeon-secondary">Duration:</span>{' '}
          <span className="text-dungeon-primary">{service.duration} min</span>
        </div>
        <div>
          <span className="text-dungeon-secondary">Oil:</span>{' '}
          <span className="text-dungeon-primary capitalize">{service.oil}</span>
        </div>
        <div>
          <span className="text-dungeon-secondary">Price:</span>{' '}
          <span className="text-dungeon-accent font-bold">฿{service.price}</span>
        </div>
        {service.sessions > 1 && (
          <div>
            <span className="text-dungeon-secondary">Sessions:</span>{' '}
            <span className="text-dungeon-primary">{service.sessions}</span>
          </div>
        )}
      </div>

      {service.description && (
        <p className="text-dungeon-secondary text-sm mt-2 line-clamp-2">{service.description}</p>
      )}
    </div>
  );
}
