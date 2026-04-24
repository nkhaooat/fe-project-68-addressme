export interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin' | 'merchant';
  merchantStatus?: 'pending' | 'approved' | 'rejected';
  merchantShop?: string | { _id: string; name: string };
  createdAt?: string;
}
