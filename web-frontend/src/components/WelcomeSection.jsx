import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';  // Add this import
import { useUserAuth } from '../context/UserAuthContext';
import './WelcomeSection.css';

const WelcomeSection = () => {
    const { user } = useUserAuth();
    const [recentSearches, setRecentSearches] = useState([]);
    const [randomTip, setRandomTip] = useState('');

    const tips = [
        "Did you know Liberia has 15 counties? Explore them all!",
        "Connect Liberia helps you find hospitals, schools, and more!",
        "You can suggest new places to help others find them!",
        "Check out the latest news to stay informed!",
        "Liberia's capital is Monrovia, located in Montserrado County!",
        "Help others by leaving reviews for institutions you've visited!",
        "Connect Liberia is free and always will be!",
    ];

    const loadRecentSearches = useCallback(() => {
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(searches.slice(-5).reverse());
        setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    }, [tips]);

    useEffect(() => {
        loadRecentSearches();
    }, [loadRecentSearches]);

    if (!user) {
        return (
            <div className="welcome-section">
                <div className="welcome-banner">
                    <h2>🇱🇷 Welcome to Connect Liberia!</h2>
                    <p>Find information about institutions across Liberia</p>
                    <div className="welcome-actions">
                        <Link to="/register" className="btn-primary">Get Started</Link>
                        <Link to="/login" className="btn-secondary">Login</Link>
                    </div>
                    <p className="welcome-tip">💡 {randomTip}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="welcome-section">
            <div className="welcome-banner logged-in">
                <h2>👋 Welcome back, {user.username || 'User'}!</h2>
                <p>What would you like to do today?</p>
                <div className="welcome-actions">
                    <Link to="/search" className="btn-primary">🔍 Search</Link>
                    <Link to="/suggest" className="btn-secondary">💡 Suggest a Place</Link>
                </div>
                {recentSearches.length > 0 && (
                    <div className="recent-searches">
                        <p>🔎 Your recent searches:</p>
                        <div className="search-tags">
                            {recentSearches.map((search, i) => (
                                <span key={i} className="search-tag">{search}</span>
                            ))}
                        </div>
                    </div>
                )}
                <p className="welcome-tip">💡 {randomTip}</p>
            </div>
        </div>
    );
};

export default WelcomeSection;