import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import './WelcomeSection.css';

const WelcomeSection = () => {
    const { user } = useUserAuth();
    const navigate = useNavigate();
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

    useEffect(() => {
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(searches.slice(-5).reverse());
        setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
    };

    if (!user) {
        return (
            <div className="welcome-section">
                <div className="welcome-banner">
                    <h2>🇱🇷 Welcome to Connect Liberia!</h2>
                    <p>Find information about institutions across Liberia</p>
                    <div className="welcome-actions">
                        <button 
                            onClick={() => handleNavigation('/register')} 
                            className="btn-primary"
                        >
                            Get Started
                        </button>
                        <button 
                            onClick={() => handleNavigation('/login')} 
                            className="btn-secondary"
                        >
                            Login
                        </button>
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
                    <button 
                        onClick={() => handleNavigation('/search')} 
                        className="btn-primary"
                    >
                        🔍 Search
                    </button>
                    <button 
                        onClick={() => handleNavigation('/suggest')} 
                        className="btn-secondary"
                    >
                        💡 Suggest a Place
                    </button>
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