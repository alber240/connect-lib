import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutions, getCounties, getLatestNews } from '../services/api';
import WelcomeSection from '../components/WelcomeSection';
import DidYouKnow from '../components/DidYouKnow';
import SkeletonCard from '../components/Skeleton';
import './HomePage.css';

// Base URL for images from Render
const IMAGE_BASE_URL = 'https://connect-lib.onrender.com';

const HomePage = () => {
  const [institutions, setInstitutions] = useState([]);
  const [counties, setCounties] = useState([]);
  const [news, setNews] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [error, setError] = useState(null);

  const categories = [
    'hospital', 'school', 'government', 'business', 'bank',
    'hotel', 'ngo', 'market', 'restaurant', 'church', 'other'
  ];

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCounty) params.county = selectedCounty;

      const [instData, countyData] = await Promise.all([
        getInstitutions(params),
        getCounties()
      ]);

      setInstitutions(Array.isArray(instData) ? instData : []);
      setCounties(Array.isArray(countyData) ? countyData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh and try again.');
      setInstitutions([]);
      setCounties([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedCounty]);

  const loadNews = async () => {
    setNewsLoading(true);
    try {
      const data = await getLatestNews(4);
      setNews(data);
    } catch (err) {
      console.error('Error loading news:', err);
    } finally {
      setNewsLoading(false);
    }
  };

  const loadFeatured = async () => {
    setFeaturedLoading(true);
    try {
      const response = await fetch('https://connect-lib.onrender.com/api/institutions/?is_featured=true');
      const data = await response.json();
      setFeatured(data.results || data || []);
    } catch (err) {
      console.error('Error loading featured:', err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const response = await fetch('https://connect-lib.onrender.com/api/institutions/?limit=5');
      const data = await response.json();
      setTrending(data.results || data || []);
    } catch (err) {
      console.error('Error loading trending:', err);
    }
  };

  const saveSearch = (term) => {
    if (!term) return;
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [term, ...searches.filter(s => s !== term)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  useEffect(() => {
    loadData();
    loadFeatured();
    loadTrending();
  }, [loadData]);

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <main className="home-page">
      <div className="home-container">
        <WelcomeSection />
        <DidYouKnow />

        {/* Featured Institutions */}
        <div className="featured-section">
          <div className="section-header">
            <h2>⭐ Featured Institutions</h2>
            <span className="section-badge">Verified</span>
          </div>
          {featuredLoading ? (
            <SkeletonCard count={4} />
          ) : featured.length === 0 ? (
            <div className="featured-empty">No featured institutions yet</div>
          ) : (
            <div className="featured-grid">
              {featured.slice(0, 4).map(inst => (
                <Link to={`/institution/${inst.id}`} key={inst.id} className="featured-card">
                  <div className="featured-image">
                    {inst.cover_image ? (
                      <img 
                        src={inst.cover_image.startsWith('http') ? inst.cover_image : `${IMAGE_BASE_URL}${inst.cover_image}`} 
                        alt={inst.name} 
                      />
                    ) : (
                      <div className="featured-no-image">📷</div>
                    )}
                    {inst.is_verified && <span className="featured-verified">✅</span>}
                  </div>
                  <div className="featured-info">
                    <h3>{inst.name}</h3>
                    <p>{getCategoryLabel(inst.category)}</p>
                    <span className="featured-location">📍 {inst.county_name || inst.county}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="section-footer">
            <Link to="/search" className="view-more">View All Institutions →</Link>
          </div>
        </div>

        {/* Trending Institutions */}
        <div className="trending-section">
          <div className="section-header">
            <h2>🔥 Trending Now</h2>
            <span className="section-badge">Popular</span>
          </div>
          <div className="trending-list">
            {trending.length === 0 ? (
              <div className="trending-empty">No trending institutions yet</div>
            ) : (
              trending.slice(0, 5).map((inst, index) => (
                <Link to={`/institution/${inst.id}`} key={inst.id} className="trending-item">
                  <span className="trending-number">{index + 1}</span>
                  <div className="trending-info">
                    <h4>{inst.name}</h4>
                    <p>{inst.county_name || inst.county}</p>
                  </div>
                  {inst.is_verified && <span className="trending-verified">✅</span>}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* News Section */}
        <div className="news-section">
          <div className="news-header">
            <h2>📰 Latest News & Updates</h2>
            <Link to="/news" className="view-all">View All →</Link>
          </div>
          {newsLoading ? (
            <SkeletonCard count={4} />
          ) : news.length === 0 ? (
            <div className="news-empty">No news yet. Check back soon!</div>
          ) : (
            <div className="news-grid">
              {news.map(item => (
                <div key={item.id} className="news-card">
                  {item.featured_image && (
                    <div className="news-image">
                      <img 
                        src={item.featured_image.startsWith('http') ? item.featured_image : `${IMAGE_BASE_URL}${item.featured_image}`} 
                        alt={item.title}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                  <div className="news-content">
                    <span className="news-category">
                      {getCategoryEmoji(item.category)} {item.category}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.content?.substring(0, 100)}...</p>
                    <span className="news-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for a place..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 2) {
                  saveSearch(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.length > 2) {
                  saveSearch(searchTerm);
                }
              }}
            />
          </div>

          <div className="filters">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>

            <select 
              value={selectedCounty} 
              onChange={(e) => setSelectedCounty(e.target.value)}
            >
              <option value="">All Counties</option>
              {counties.map(county => (
                <option key={county.id} value={county.name}>{county.name}</option>
              ))}
            </select>

            <button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedCounty('');
            }}>Clear Filters</button>
          </div>
        </div>

        {/* Results Grid */}
        <div className="results">
          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          {loading ? (
            <SkeletonCard count={6} />
          ) : institutions.length === 0 ? (
            <div className="no-results">
              <p>No institutions found. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="institution-grid">
              {institutions.map(inst => (
                <Link to={`/institution/${inst.id}`} key={inst.id} className="institution-card-link">
                  <div className="institution-card">
                    {inst.cover_image && (
                      <div className="card-image">
                        <img 
                          src={inst.cover_image.startsWith('http') ? inst.cover_image : `${IMAGE_BASE_URL}${inst.cover_image}`} 
                          alt={inst.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="no-image">📷</div>';
                          }}
                        />
                        {inst.video_url && <span className="video-badge">🎬</span>}
                        {inst.is_featured && <span className="featured-badge-small">⭐</span>}
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-header">
                        <h3>{inst.name}</h3>
                        {inst.is_verified && <span className="verified-badge">✅</span>}
                      </div>
                      <p className="category">{getCategoryLabel(inst.category)}</p>
                      <p className="county">📍 {inst.county_name || inst.county}</p>
                      {inst.address && <p className="address">🏠 {inst.address}</p>}
                      {inst.phone && <p className="phone">📞 {inst.phone}</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <p>🇱🇷 Connect Liberia - Making information accessible to all Liberians</p>
          <div className="footer-links">
            <Link to="/suggest">💡 Suggest a Place</Link>
            <span>|</span>
            <Link to="/about">About</Link>
            <span>|</span>
            <Link to="/">🏠 Home</Link>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default HomePage;