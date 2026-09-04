import React, { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { useToast } from '../context/ToastContext';
import './FavoriteButton.css';

const FavoriteButton = ({ institutionId, initialFavorited = false, initialCount = 0 }) => {
    const { user } = useUserAuth();
    const { showToast } = useToast();
    const [favorited, setFavorited] = useState(initialFavorited);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const toggleFavorite = async () => {
        if (!user) {
            showToast('Please login to save favorites', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                'https://connect-lib.onrender.com/api/favorites/toggle/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                    body: JSON.stringify({
                        institution: institutionId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to toggle favorite');
            }

            const data = await response.json();
            setFavorited(data.favorited);
            setCount(data.total_favorites || count);

            if (data.favorited) {
                showToast('❤️ Added to favorites!', 'success');
            } else {
                showToast('Removed from favorites', 'info');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('❌ Error toggling favorite. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`favorite-btn ${favorited ? 'favorited' : ''}`}
            onClick={toggleFavorite}
            disabled={loading}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <span className="favorite-icon">{favorited ? '❤️' : '🤍'}</span>
            <span className="favorite-count">{count}</span>
        </button>
    );
};

export default FavoriteButton;