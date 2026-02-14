
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import { Review } from '../types.ts';
import { getReviews, saveReview } from '../services/reviewService.ts';
import { StarRating } from './StarRating.tsx';
import { getCurrentUser } from '../services/authService.ts';
import { useLanguage } from '../LanguageContext.tsx';
import { LoginModal } from './LoginModal.tsx';

interface ReviewSectionProps {
  vendorId: string;
  onReviewAdded?: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ vendorId, onReviewAdded }) => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    setReviews(getReviews(vendorId));
  }, [vendorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    // Simulate slight delay for effect
    await new Promise(r => setTimeout(r, 800));
    
    saveReview(vendorId, user.name, rating, comment);
    setReviews(getReviews(vendorId));
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    if (onReviewAdded) onReviewAdded();
  };

  return (
    <div className="space-y-10">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={() => setIsLoginOpen(false)} />
      
      {/* Review Form */}
      <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" /> {t('writeReview')}
        </h3>

        {!user ? (
          <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm font-medium mb-4">{t('loginToReview')}</p>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md"
            >
              {t('parentLogin')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center gap-2 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t('ratingLabel')}</span>
              <StarRating rating={rating} interactive size={28} onChange={setRating} />
            </div>

            <textarea
              rows={3}
              className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-medium focus:ring-2 focus:ring-indigo-500 transition-all text-left"
              placeholder={t('commentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:bg-gray-200"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : showSuccess ? (
                <><CheckCircle className="w-5 h-5" /> {t('reviewSuccess')}</>
              ) : (
                <><Send className="w-5 h-5" /> {t('submitReview')}</>
              )}
            </button>
          </form>
        )}
      </section>

      {/* Reviews List */}
      <section className="space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> {t('reviewsTitle')}
          <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg ml-2">{reviews.length}</span>
        </h3>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase tracking-tighter">
                      {review.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-sm tracking-tight">{review.authorName}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-gray-600 text-sm font-medium leading-relaxed text-left">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-[2rem] border border-gray-100 border-dashed">
            <p className="text-gray-400 text-sm font-bold italic">{t('noReviews')}</p>
          </div>
        )}
      </section>
    </div>
  );
};
