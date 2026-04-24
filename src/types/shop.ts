export interface Shop {
  _id: string;
  name: string;
  address: string;
  location: string;
  tel: string;
  map: string;
  openTime: string;
  closeTime: string;
  priceRangeMin: number;
  priceRangeMax: number;
  rating?: number;
  photo?: string;
  photoProxy?: string;
  placeId?: string;
  hasGooglePhoto?: boolean;
  platformRating?: number;
  platformReviewCount?: number;
  tiktokLinks?: string[];
  hours?: string[];
}
