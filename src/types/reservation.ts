import { User } from './user';
import { Shop } from './shop';
import { Service } from './service';

export interface Reservation {
  _id: string;
  resvDate: string;
  user: User | string;
  shop: Shop | string;
  service: Service | string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  promotionCode?: string | null;
  discountAmount?: number;
  originalPrice?: number;
  finalPrice?: number;
  slipImageUrl?: string | null;
  paymentStatus?: 'none' | 'waiting_verification' | 'approved' | 'rejected';
  qrToken?: string;
  qrActive?: boolean;
  createdAt: string;
}
