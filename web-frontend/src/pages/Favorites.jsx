import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import getImageUrl from '../utils/imageHelpers';
import './Favorites.css';

const Favorites = () => {
    const { user, isAuthenticated } = useUserAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check authentication using both context and localStorage
        const token = localStorage.getItem('access_token');
        if (isAuthenticated || token) {
            loadFavorites();
        } else {
            setLoading(false);
            setError('Please login to view your favorites');
        }
    }, [user, isAuthenticated]);

    const loadFavorites = async () => {
        setLoading(true);
        setError(null);
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

            if (response.status === 401) {
                // Token expired
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                setError('Session expired. Please login again.');
                setLoading(false);
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Ensure data is always an array
            let favoritesArray = [];
            if (Array.isArray(data)) {
                favoritesArray = data;
            } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
                favoritesArray = data.results;
            } else if (data && typeof data === 'object') {
                favoritesArray = [data];
            }
            
            setFavorites(favoritesArray);
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

    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    const isLoggedIn = token !== null;

    if (!isLoggedIn) {
        return (
            <div className="favorites-page">
                <div className="favorites-container">
                    <h1>❤️ Favorites</h1>
                    <div className="login-prompt">
                        <p>🔒 Please login to view your favorites</p>
                        <Link to="/login" className="btn-login">Login</Link>
                    </div>
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

    return (
        <div className="favorites-page">
            <div className="favorites-container">
                <div className="favorites-header">
                    <Link to="/" className="back-link">← Back to Home</Link>
                    <h1>❤️ Your Favorites</h1>
                    <p>{favorites.length} saved institutions</p>
                </div>

                {favorites.length === 0 ? (
                    <div className="no-favorites">
                        <div className="no-favorites-icon">💔</div>
                        <h3>No favorites yet</h3>
                        <p>Start exploring and save institutions you like!</p>
                        <Link to="/" className="btn-primary">Explore Institutions</Link>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favorites.map(inst => (
                            <Link to={`/institution/${inst.id}`} key={inst.id} className="favorite-card">
                                {inst.cover_image && (
                                    <div className="favorite-image">
                                        <img 
                                            src={getImageUrl(inst.cover_image)}
                                            alt={inst.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="no-image-placeholder">🏛️</div>';
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