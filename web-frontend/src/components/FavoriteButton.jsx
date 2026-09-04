import React, { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import './FavoriteButton.css';

const FavoriteButton = ({ institutionId, initialFavorited = false, initialCount = 0 }) => {
    const { user } = useUserAuth();
    const [favorited, setFavorited] = useState(initialFavorited);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const toggleFavorite = async () => {
        if (!user) {
            alert('Please login to save favorites');
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
            const data = await response.json();
            setFavorited(data.favorited);
            setCount(data.total_favorites || count);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('❌ Error. Please try again.');
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