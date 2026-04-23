import { API_URL } from './config';
import { ShopReviewsResponse } from '@/interface';

export async function getShopReviews(shopId: string): Promise<ShopReviewsResponse> {
  const res = await fetch(`${API_URL}/reviews/shop/${shopId}`);
  return res.json();
}
