import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNews } from '../services/api';
import './NewsPage.css';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await getNews();
      setNews(data || []);
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

  const API_BASE_URL = 'https://connect-lib.onrender.com';

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
        <h1>📰 News & Updates</h1>
        <p>Stay informed about the latest developments in Liberia</p>
        <Link to="/" className="back-link">← Back to Home</Link>
      </div>

      {news.length === 0 ? (
        <div className="no-news">
          <p>No news articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="news-page-grid">
          {news.map(item => (
            <div key={item.id} className="news-page-card">
              {item.featured_image && (
                <div className="news-page-image">
                  <img 
                    src={`${API_BASE_URL}${item.featured_image}`} 
                    alt={item.title}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="news-page-content">
                <span className="news-page-category">
                  {getCategoryEmoji(item.category)} {item.category}
                </span>
                <h2>{item.title}</h2>
                <p>{item.content}</p>
                {item.video_url && (
                  <div className="news-page-video">
                    <iframe
                      src={item.video_url.replace('watch?v=', 'embed/')}
                      title="News Video"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="news-page-meta">
                  <span>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                  {item.county && <span>📍 {item.county}</span>}
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