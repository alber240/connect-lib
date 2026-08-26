import React, { useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import './LikeButton.css';

const LikeButton = ({ type, id, initialCount = 0, initialLiked = false }) => {
    const { user } = useUserAuth();
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like this');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('https://connect-lib.onrender.com/api/like/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ 
                    content_type: type, 
                    content_id: id 
                })
            });
            const data = await response.json();
            setLiked(data.liked);
            setCount(data.count);
        } catch (error) {
            console.error('Error liking:', error);
            alert('❌ Error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className={`like-button ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
        >
            <span className="like-icon">{liked ? '❤️' : '🤍'}</span>
            <span className="like-count">{count}</span>
        </button>
    );
};

export default LikeButton;