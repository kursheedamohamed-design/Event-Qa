
import { Review } from '../types.ts';

const REVIEWS_KEY = 'qatar_party_hub_reviews';

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    vendorId: '1',
    authorName: 'Sarah M.',
    rating: 5,
    comment: 'The cake was absolutely stunning and tasted even better than it looked! Aisha was so professional.',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'r2',
    vendorId: '1',
    authorName: 'Ahmed H.',
    rating: 4,
    comment: 'Great dessert table, the kids loved the character cupcakes.',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'r3',
    vendorId: '2',
    authorName: 'Jessica L.',
    rating: 5,
    comment: 'Perfect venue for my 5-year-old. The staff was incredibly helpful with the setup.',
    createdAt: Date.now() - 86400000 * 10
  }
];

export const getReviews = (vendorId?: string): Review[] => {
  const stored = localStorage.getItem(REVIEWS_KEY);
  let allReviews: Review[] = stored ? JSON.parse(stored) : MOCK_REVIEWS;
  
  if (!stored) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(MOCK_REVIEWS));
  }

  if (vendorId) {
    return allReviews.filter(r => r.vendorId === vendorId).sort((a, b) => b.createdAt - a.createdAt);
  }
  return allReviews;
};

export const saveReview = (vendorId: string, authorName: string, rating: number, comment: string): Review => {
  const allReviews = getReviews();
  const newReview: Review = {
    id: Math.random().toString(36).substr(2, 9),
    vendorId,
    authorName,
    rating,
    comment,
    createdAt: Date.now()
  };
  
  const updated = [...allReviews, newReview];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  return newReview;
};

export const getVendorRating = (vendorId: string): { avg: number; count: number } => {
  const reviews = getReviews(vendorId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    avg: parseFloat((sum / reviews.length).toFixed(1)),
    count: reviews.length
  };
};
