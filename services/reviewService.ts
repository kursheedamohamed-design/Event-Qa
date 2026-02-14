

import { Review } from '../types.ts';

const REVIEWS_KEY = 'qatar_party_hub_reviews';

// Fix: Updated mock data to use partnerId instead of vendorId
const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    partnerId: '1',
    authorName: 'Sarah M.',
    rating: 5,
    comment: 'The cake was absolutely stunning and tasted even better than it looked! Aisha was so professional.',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'r2',
    partnerId: '1',
    authorName: 'Ahmed H.',
    rating: 4,
    comment: 'Great dessert table, the kids loved the character cupcakes.',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'r3',
    partnerId: '2',
    authorName: 'Jessica L.',
    rating: 5,
    comment: 'Perfect venue for my 5-year-old. The staff was incredibly helpful with the setup.',
    createdAt: Date.now() - 86400000 * 10
  }
];

// Fix: Updated function parameter and filter logic to use partnerId
export const getReviews = (partnerId?: string): Review[] => {
  const stored = localStorage.getItem(REVIEWS_KEY);
  let allReviews: Review[] = stored ? JSON.parse(stored) : MOCK_REVIEWS;
  
  if (!stored) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(MOCK_REVIEWS));
  }

  if (partnerId) {
    return allReviews.filter(r => r.partnerId === partnerId).sort((a, b) => b.createdAt - a.createdAt);
  }
  return allReviews;
};

// Fix: Updated saveReview to use partnerId
export const saveReview = (partnerId: string, authorName: string, rating: number, comment: string): Review => {
  const allReviews = getReviews();
  const newReview: Review = {
    id: Math.random().toString(36).substr(2, 9),
    partnerId,
    authorName,
    rating,
    comment,
    createdAt: Date.now()
  };
  
  const updated = [...allReviews, newReview];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  return newReview;
};

// Fix: Updated getVendorRating to use partnerId correctly
export const getVendorRating = (partnerId: string): { avg: number; count: number } => {
  const reviews = getReviews(partnerId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  return {
    avg: parseFloat((sum / reviews.length).toFixed(1)),
    count: reviews.length
  };
};
