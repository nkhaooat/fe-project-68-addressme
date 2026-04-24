'use client';

interface MerchantReservationCardProps {
  reservation: {
    _id: string;
    user: { name: string; email: string; telephone: string };
    service: { name: string; price: number };
    resvDate: string;
    status: string;
  };
  statusColor: (status: string) => string;
  onUpdateStatus: (id: string, newStatus: string) => void;
}

export default function MerchantReservationCard({
  reservation: r,
  statusColor,
  onUpdateStatus,
}: MerchantReservationCardProps) {
  return (
    <div className="bg-dungeon-surface border border-dungeon-outline rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-dungeon-header-text font-bold">{r.user.name}</p>
          <p className="text-dungeon-sub-header text-sm">{r.user.email} · {r.user.telephone}</p>
          <p className="text-dungeon-primary text-sm mt-1">
            {r.service.name} - ฿{r.service.price} · {new Date(r.resvDate).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${statusColor(r.status)}`}>
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
          {r.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(r._id, 'confirmed')}
              className="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors"
            >
              Confirm
            </button>
          )}
          {r.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(r._id, 'completed')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 transition-colors"
            >
              Complete
            </button>
          )}
          {(r.status === 'pending' || r.status === 'confirmed') && (
            <button
              onClick={() => onUpdateStatus(r._id, 'cancelled')}
              className="px-3 py-1.5 bg-red-700 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
