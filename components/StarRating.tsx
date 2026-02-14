
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  max = 5, 
  size = 16, 
  interactive = false, 
  onChange 
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hover || rating);
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHover(starValue)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star 
              size={size}
              className={`${isActive ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
