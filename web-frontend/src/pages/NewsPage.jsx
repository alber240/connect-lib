import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNews } from '../services/api';
import './NewsPage.css';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showExpired, setShowExpired] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['general', 'announcement', 'update', 'event', 'alert'];

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        setLoading(true);
        try {
            const data = await getNews();
            const sorted = (data || []).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setNews(sorted);
        } catch (err) {
            console.error('Error loading news:', err);
            setError('Failed to load news. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryEmoji = (category) => {
        const emojis = {
            'announcement': '📢',
            'update': '📝',
            'event': '🎉',
            'alert': '⚠️',
            'general': '📰'
        };
        return emojis[category] || '📰';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'announcement': 'Announcement',
            'update': 'Update',
            'event': 'Event',
            'alert': 'Alert',
            'general': 'General'
        };
        return labels[category] || category;
    };

    // Filter news
    const filterNews = () => {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        
        let filtered = [...news];
        
        // Filter by expiry
        if (!showExpired) {
            filtered = filtered.filter(item => {
                const created = new Date(item.created_at);
                return created > twoDaysAgo;
            });
        }
        
        // Filter by category
        if (filterCategory) {
            filtered = filtered.filter(item => item.category === filterCategory);
        }
        
        // Filter by search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(term) ||
                item.content.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    };

    const filteredNews = filterNews();
    const expiredCount = news.length - news.filter(item => {
        const created = new Date(item.created_at);
        const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        return created > twoDaysAgo;
    }).length;

    if (loading) {
        return (
            <div className="news-page-container">
                <div className="loading-spinner"></div>
                <p>Loading news...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-page-container">
                <p className="error-message">⚠️ {error}</p>
                <button onClick={loadNews} className="btn-retry">Retry</button>
            </div>
        );
    }

    return (
        <div className="news-page-container">
            <div className="news-page-header">
                <Link to="/" className="back-link">← Back to Home</Link>
                <h1>📰 News & Updates</h1>
                <p>Stay informed about the latest developments in Liberia</p>
                
                {/* Search and Filters */}
                <div className="news-controls">
                    <input
                        type="text"
                        placeholder="🔍 Search news..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="news-search"
                    />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="news-filter"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {getCategoryEmoji(cat)} {getCategoryLabel(cat)}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Toggle Expired */}
                <div className="news-options">
                    {expiredCount > 0 && (
                        <button 
                            onClick={() => setShowExpired(!showExpired)} 
                            className={`toggle-expired-btn ${showExpired ? 'active' : ''}`}
                        >
                            {showExpired 
                                ? '✅ Showing older articles' 
                                : `📂 Show ${expiredCount} older articles`}
                        </button>
                    )}
                    <span className="news-count">
                        {filteredNews.length} articles
                    </span>
                </div>
            </div>

            {filteredNews.length === 0 ? (
                <div className="no-news">
                    <p>📭 No news articles match your criteria.</p>
                    <button onClick={() => {
                        setSearchTerm('');
                        setFilterCategory('');
                        setShowExpired(true);
                    }} className="btn-retry">
                        Show all articles
                    </button>
                </div>
            ) : (
                <div className="news-page-grid">
                    {filteredNews.map(item => (
                        <div key={item.id} className={`news-page-card ${item.is_expired ? 'expired' : ''}`}>
                            <div className="news-page-content">
                                <div className="news-page-meta">
                                    <span className="news-page-category">
                                        {getCategoryEmoji(item.category)} {getCategoryLabel(item.category)}
                                    </span>
                                    <span className="news-page-date">
                                        📅 {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                    {item.is_expired && (
                                        <span className="expired-badge">⏳ Expired</span>
                                    )}
                                </div>
                                
                                {/* Title */}
                                <h2 className="news-page-title">{item.title}</h2>
                                
                                {/* Summary */}
                                <p className="news-page-summary">{item.content}</p>
                                
                                {/* Source & Link */}
                                <div className="news-page-footer">
                                    <div className="news-page-actions">
                                        {item.source && (
                                            <a 
                                                href={item.source} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="news-page-source"
                                            >
                                                📖 Read Full Article
                                            </a>
                                        )}
                                    </div>
                                    {item.source_domain && (
                                        <span className="news-page-source-name">
                                            📎 Source: {item.source_domain}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NewsPage;