import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './Favorites.css';

const Favorites = () => {
    const { user } = useUserAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadFavorites = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError('Please login to view favorites');
                setLoading(false);
                return;
            }

            const response = await fetch(
                'https://connect-lib.onrender.com/api/favorites/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Ensure data is always an array
            if (Array.isArray(data)) {
                setFavorites(data);
            } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
                setFavorites(data.results);
            } else if (data && typeof data === 'object') {
                // If it's a single object, wrap it
                setFavorites([data]);
            } else {
                setFavorites([]);
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'hospital': '🏥 Hospital',
            'school': '📚 School',
            'government': '🏛️ Government',
            'business': '💼 Business',
            'bank': '🏦 Bank',
            'hotel': '🏨 Hotel',
            'ngo': '🤝 NGO',
            'market': '🛒 Market',
            'restaurant': '🍽️ Restaurant',
            'church': '⛪ Church',
            'other': '📌 Other'
        };
        return labels[category] || category;
    };

    if (!user) {
        return (
            <div className="favorites-page">
                <div className="favorites-container">
                    <h1>❤️ Favorites</h1>
                    <p>Please <Link to="/login">login</Link> to view your favorites.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="favorites-page">
                <div className="favorites-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your favorites...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="favorites-page">
                <div className="favorites-container">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={loadFavorites} className="btn-retry">Retry</button>
                </div>
            </div>
        );
    }

    // Safe check - favorites must be an array
    const favoritesList = Array.isArray(favorites) ? favorites : [];

    return (
        <div className="favorites-page">
            <div className="favorites-container">
                <div className="favorites-header">
                    <Link to="/" className="back-link">← Back to Home</Link>
                    <h1>❤️ Your Favorites</h1>
                    <p>{favoritesList.length} saved institutions</p>
                </div>

                {favoritesList.length === 0 ? (
                    <div className="no-favorites">
                        <div className="no-favorites-icon">💔</div>
                        <h3>No favorites yet</h3>
                        <p>Start exploring and save institutions you like!</p>
                        <Link to="/" className="btn-primary">Explore Institutions</Link>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favoritesList.map(inst => (
                            <Link to={`/institution/${inst.id}`} key={inst.id} className="favorite-card">
                                {inst.cover_image && (
                                    <div className="favorite-image">
                                        <img 
                                            src={inst.cover_image.startsWith('http') ? inst.cover_image : `https://connect-lib.onrender.com${inst.cover_image}`} 
                                            alt={inst.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="favorite-body">
                                    <div className="favorite-header">
                                        <h3>{inst.name}</h3>
                                        {inst.is_verified && <span className="verified-badge">✅</span>}
                                    </div>
                                    <p className="favorite-category">{getCategoryLabel(inst.category)}</p>
                                    <p className="favorite-county">📍 {inst.county_name || inst.county}</p>
                                    {inst.average_rating > 0 && (
                                        <p className="favorite-rating">
                                            ⭐ {inst.average_rating.toFixed(1)} ({inst.total_ratings} reviews)
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;