import React, { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import './Rating.css';

const Rating = ({ institutionId, averageRating = 0, totalRatings = 0, userRating = 0 }) => {
    const { user } = useUserAuth();
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(userRating || 0);
    const [review, setReview] = useState('');
    const [showReview, setShowReview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [avgRating, setAvgRating] = useState(averageRating);
    const [totalRats, setTotalRats] = useState(totalRatings);

    const handleRating = async (rating) => {
        if (!user) {
            alert('Please login to rate this institution');
            return;
        }
        setSelectedRating(rating);
        setShowReview(true);
    };

    const submitReview = async () => {
        if (!review.trim()) {
            alert('Please write a review');
            return;
        }
        
        setSubmitting(true);
        try {
            const response = await fetch('https://connect-lib.onrender.com/api/rating/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    institution: institutionId,
                    rating: selectedRating,
                    review: review
                })
            });
            const data = await response.json();
            alert('✅ Rating submitted!');
            setAvgRating(data.average_rating || avgRating);
            setTotalRats(data.total_ratings || totalRats);
            setShowReview(false);
            setReview('');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('❌ Error submitting rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rating-container">
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`star ${star <= (hoverRating || selectedRating) ? 'active' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(star)}
                    >
                        ⭐
                    </span>
                ))}
            </div>
            <div className="rating-info">
                <span className="average-rating">{avgRating.toFixed(1)}</span>
                <span className="total-ratings">({totalRats} reviews)</span>
            </div>
            
            {showReview && (
                <div className="review-modal">
                    <textarea
                        placeholder="Write your review..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows={4}
                    />
                    <button onClick={submitReview} className="btn-submit-review" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button onClick={() => setShowReview(false)} className="btn-cancel-review">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Rating;