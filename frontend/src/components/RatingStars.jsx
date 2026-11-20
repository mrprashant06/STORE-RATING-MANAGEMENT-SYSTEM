import React, { useState } from 'react';

const RatingStars = ({
  rating = 0,
  interactive = false,
  onChange = null,
  size = 'md',
  showBadge = true,
  count = null
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const currentDisplay = interactive && hoverRating > 0 ? hoverRating : Number(rating) || 0;

  const handleClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`rating-stars-wrapper size-${size}`}>
      <div className="stars-group" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(currentDisplay);
          return (
            <span
              key={star}
              className={`star ${isFilled ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : `${rating} stars`}
            >
              ★
            </span>
          );
        })}
      </div>

      {showBadge && (
        <span className="rating-badge">
          {Number(rating) > 0 ? Number(rating).toFixed(1) : 'No ratings yet'}
          {count !== null && <span className="rating-count"> ({count} {count === 1 ? 'review' : 'reviews'})</span>}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
