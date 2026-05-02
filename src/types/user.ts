export interface PdpaConsent {
  personalData: boolean;
  bookingEmails: boolean;
  aiChatbot: boolean;
  publicReviews: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  telephone: string;
  role: 'user' | 'admin' | 'merchant';
  merchantStatus?: 'pending' | 'approved' | 'rejected';
  merchantShop?: string | { _id: string; name: string };
  pdpaConsent?: PdpaConsent;
  pdpaConsentedAt?: string | null;
  createdAt?: string;
}
