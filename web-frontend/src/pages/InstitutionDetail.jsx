import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getInstitution } from '../services/api';
import './InstitutionDetail.css';

const InstitutionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadInstitution();
    window.scrollTo(0, 0);
  }, [id]);

  const loadInstitution = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstitution(id);
      if (data) {
        setInstitution(data);
      } else {
        setError('Institution not found');
      }
    } catch (err) {
      console.error('Error loading institution:', err);
      setError('Failed to load institution details');
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

  const getCategoryEmoji = (category) => {
    const emojis = {
      'hospital': '🏥',
      'school': '📚',
      'government': '🏛️',
      'business': '💼',
      'bank': '🏦',
      'hotel': '🏨',
      'ngo': '🤝',
      'market': '🛒',
      'restaurant': '🍽️',
      'church': '⛪',
      'other': '📌'
    };
    return emojis[category] || '📍';
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner"></div>
        <p>Loading institution details...</p>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="detail-error">
        <h2>😕 {error || 'Institution not found'}</h2>
        <Link to="/" className="back-button">← Back to Search</Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-button-top">
        ← Back
      </button>

      {/* Cover Image */}
      <div className="detail-cover">
        {institution.cover_image ? (
          <img 
            src={`http://127.0.0.1:8000${institution.cover_image}`} 
            alt={institution.name}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="no-image-large">📷</div>';
            }}
          />
        ) : (
          <div className="no-image-large">{getCategoryEmoji(institution.category)}</div>
        )}
        {institution.is_verified && (
          <div className="verified-badge-large">✅ Verified</div>
        )}
        {institution.is_featured && (
          <div className="featured-badge-large">⭐ Featured</div>
        )}
      </div>

      {/* Main Content */}
      <div className="detail-content">
        <h1 className="detail-title">{institution.name}</h1>
        
        <div className="detail-meta">
          <span className="detail-category">{getCategoryLabel(institution.category)}</span>
          <span className="detail-county">📍 {institution.county_name || institution.county}</span>
          {institution.district && (
            <span className="detail-district">📌 {institution.district}</span>
          )}
        </div>

        {/* Video Section */}
        {institution.video_url && (
          <div className="detail-video">
            <h3>🎬 Video</h3>
            <div className="video-container">
              <iframe
                src={institution.video_url.replace('watch?v=', 'embed/')}
                title={`${institution.name} Video`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Description */}
        {institution.description && (
          <div className="detail-section">
            <h3>📖 About</h3>
            <p className="detail-description">
              {showFullDescription 
                ? institution.description 
                : `${institution.description.substring(0, 300)}${institution.description.length > 300 ? '...' : ''}`
              }
              {institution.description.length > 300 && (
                <button 
                  className="read-more-btn"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Services */}
        {institution.services && (
          <div className="detail-section">
            <h3>🛠️ Services</h3>
            <div className="services-list">
              {institution.services.split(',').map((service, index) => (
                <span key={index} className="service-tag">{service.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="detail-section contact-section">
          <h3>📞 Contact Information</h3>
          <div className="contact-grid">
            {institution.phone && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <a href={`tel:${institution.phone}`}>{institution.phone}</a>
              </div>
            )}
            {institution.phone2 && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <a href={`tel:${institution.phone2}`}>{institution.phone2}</a>
              </div>
            )}
            {institution.email && (
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <a href={`mailto:${institution.email}`}>{institution.email}</a>
              </div>
            )}
            {institution.website && (
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <a href={institution.website} target="_blank" rel="noopener noreferrer">
                  Visit Website
                </a>
              </div>
            )}
            {institution.address && (
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>{institution.address}</span>
              </div>
            )}
            {institution.opening_hours && (
              <div className="contact-item">
                <span className="contact-icon">🕐</span>
                <span>{institution.opening_hours}</span>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        {(institution.latitude && institution.longitude) && (
          <div className="detail-section">
            <h3>🗺️ Location</h3>
            <div className="map-container">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${institution.longitude - 0.01}%2C${institution.latitude - 0.01}%2C${institution.longitude + 0.01}%2C${institution.latitude + 0.01}&layer=mapnik&marker=${institution.latitude}%2C${institution.longitude}`}
                style={{ width: '100%', height: '300px', border: 0 }}
                allowFullScreen
                loading="lazy"
                title={`${institution.name} Location`}
              />
              <a 
                href={`https://www.openstreetmap.org/?mlat=${institution.latitude}&mlon=${institution.longitude}#map=15/${institution.latitude}/${institution.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                📍 View on OpenStreetMap
              </a>
            </div>
          </div>
        )}

        {/* Source */}
        {institution.source && (
          <div className="detail-section source-section">
            <p className="source-text">
              📎 Source: <a href={institution.source} target="_blank" rel="noopener noreferrer">{institution.source}</a>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="detail-actions">
          <Link to="/" className="action-button">🔍 Search More</Link>
          <Link to="/suggest" className="action-button secondary">💡 Suggest Update</Link>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetail;