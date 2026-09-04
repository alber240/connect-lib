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
            const response = await fetch(
                'https://connect-lib.onrender.com/api/favorites/',
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                }
            );
            const data = await response.json();
            setFavorites(data || []);
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
                                        <img src={inst.cover_image} alt={inst.name} />
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