import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onChange, readonly = false, size = 'medium' }) => {
    const [hover, setHover] = useState(0);

    const handleClick = (value) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    const stars = [1, 2, 3, 4, 5];

    return (
        <div className={`star-rating ${size}`}>
            {stars.map((star) => (
                <span
                    key={star}
                    className={`star ${star <= (hover || rating) ? 'active' : ''}`}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    style={{ cursor: readonly ? 'default' : 'pointer' }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;