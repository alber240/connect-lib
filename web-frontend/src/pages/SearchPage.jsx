import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getInstitutions, getCounties } from '../services/api';
import './SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const [institutions, setInstitutions] = useState([]);
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

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

      const instArray = Array.isArray(instData) ? instData : [];
      setInstitutions(instArray);
      setTotalResults(instArray.length);
      setCounties(Array.isArray(countyData) ? countyData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh and try again.');
      setInstitutions([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedCounty]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCounty('');
    // Load data will be triggered by the useEffect
  };

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="search-page-header-content">
          <Link to="/" className="back-home">← Back to Home</Link>
          <h1>🔍 Search Institutions</h1>
          <p>Find institutions, organizations, and businesses across Liberia</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="search-page-form">
        <form onSubmit={handleSearch}>
          <div className="search-bar-large">
            <input
              type="text"
              placeholder="Search for a place..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <button type="submit" className="search-btn">
              🔍 Search
            </button>
          </div>

          <div className="search-filters">
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

            <button type="button" onClick={clearFilters} className="clear-btn">
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="search-results">
        <div className="results-header">
          <span className="results-count">
            {totalResults} {totalResults === 1 ? 'institution' : 'institutions'} found
          </span>
          {!loading && totalResults === 0 && searchTerm && (
            <span className="no-results-msg">Try adjusting your search terms</span>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading...</div>
        ) : institutions.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No institutions found</h3>
            <p>
              {searchTerm || selectedCategory || selectedCounty
                ? 'Try adjusting your filters or search terms'
                : 'Start by typing a search term above'}
            </p>
          </div>
        ) : (
          <div className="search-results-grid">
            {institutions.map(inst => (
              <Link to={`/institution/${inst.id}`} key={inst.id} className="search-result-card">
                {inst.cover_image && (
                  <div className="result-image">
                    <img 
                      src={inst.cover_image}  
                      alt={inst.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="no-image">📷</div>';
                      }}
                    />
                    {inst.is_featured && <span className="featured-badge-small">⭐</span>}
                  </div>
                )}
                <div className="result-body">
                  <div className="result-header">
                    <h3>{inst.name}</h3>
                    {inst.is_verified && <span className="verified-badge">✅</span>}
                  </div>
                  <p className="result-category">{getCategoryLabel(inst.category)}</p>
                  <p className="result-county">📍 {inst.county_name || inst.county}</p>
                  {inst.address && <p className="result-address">🏠 {inst.address}</p>}
                  {inst.phone && <p className="result-phone">📞 {inst.phone}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;