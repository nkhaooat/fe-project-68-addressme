export interface Service {
  _id: string;
  name: string;
  area: 'full body' | 'back' | 'foot' | 'head' | 'shoulder' | 'face' | 'other';
  duration: number;
  oil: 'none' | 'aromatherapy' | 'herbal' | 'coconut' | 'jojoba' | 'other';
  price: number;
  sessions: number;
  description?: string;
  shop: string | { _id: string; name: string };
}

export interface ServiceQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  shop?: string;
}
