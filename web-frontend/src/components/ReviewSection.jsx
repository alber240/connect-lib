import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import StarRating from './StarRating';
import './ReviewSection.css';

const ReviewSection = ({ institutionId }) => {
    const { user } = useUserAuth();
    const [ratings, setRatings] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);

    useEffect(() => {
        loadRatings();
    }, [institutionId]);

    const loadRatings = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://connect-lib.onrender.com/api/rating/${institutionId}/`
            );
            const data = await response.json();
            setRatings(data.ratings || []);
            setAverageRating(data.average_rating || 0);
            setTotalRatings(data.total_ratings || 0);
            if (data.user_rating) {
                setUserRating(data.user_rating.rating);
                setUserReview(data.user_rating.review || '');
                setSelectedRating(data.user_rating.rating);
            }
        } catch (error) {
            console.error('Error loading ratings:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitRating = async () => {
        if (!user) {
            alert('Please login to rate this institution');
            return;
        }

        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(
                'https://connect-lib.onrender.com/api/rating/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                    body: JSON.stringify({
                        institution: institutionId,
                        rating: selectedRating,
                        review: userReview,
                    }),
                }
            );
            const data = await response.json();
            if (data.average_rating !== undefined) {
                setAverageRating(data.average_rating);
                setTotalRatings(data.total_ratings);
                setUserRating(selectedRating);
                alert('✅ Rating submitted successfully!');
                await loadRatings();
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('❌ Error submitting rating. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="reviews-loading">Loading reviews...</div>;
    }

    return (
        <div className="reviews-section">
            <div className="reviews-summary">
                <div className="average-rating">
                    <span className="rating-number">{averageRating.toFixed(1)}</span>
                    <StarRating rating={Math.round(averageRating)} readonly size="small" />
                    <span className="total-ratings">({totalRatings} reviews)</span>
                </div>
            </div>

            {user ? (
                <div className="review-form">
                    <h4>Write a Review</h4>
                    <div className="rating-input">
                        <label>Your Rating:</label>
                        <StarRating
                            rating={selectedRating}
                            onChange={setSelectedRating}
                            size="medium"
                        />
                    </div>
                    <textarea
                        placeholder="Write your review (optional)..."
                        value={userReview}
                        onChange={(e) => setUserReview(e.target.value)}
                        rows="3"
                    />
                    <button
                        onClick={submitRating}
                        disabled={submitting || selectedRating === 0}
                        className="btn-submit-review"
                    >
                        {submitting ? 'Submitting...' : userRating ? 'Update Review' : 'Submit Review'}
                    </button>
                    {userRating > 0 && (
                        <p className="current-rating">Your current rating: {userRating}⭐</p>
                    )}
                </div>
            ) : (
                <div className="login-to-review">
                    <p><a href="/login">Login</a> to rate and review this institution</p>
                </div>
            )}

            {ratings.length > 0 && (
                <div className="reviews-list">
                    <h4>All Reviews</h4>
                    {ratings.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <strong>{review.user_username}</strong>
                                <StarRating rating={review.rating} readonly size="small" />
                                <span className="review-date">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {review.review && (
                                <p className="review-text">{review.review}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;