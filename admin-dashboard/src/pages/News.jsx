import React, { useState, useEffect, useRef } from 'react';
import { getNews, createNews, updateNews, deleteNews } from '../services/api';
import './News.css';

const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [counties, setCounties] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Production API URL
  const API_BASE_URL = 'https://connect-lib.onrender.com';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    county: '',
    institution: '',
    featured_image: null,
    video_url: '',
    is_published: true,
  });

  const categories = [
    { value: 'general', label: '📰 General' },
    { value: 'announcement', label: '📢 Announcement' },
    { value: 'update', label: '📝 Update' },
    { value: 'event', label: '🎉 Event' },
    { value: 'alert', label: '⚠️ Alert' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // ============ LOAD DATA - FIXED ============
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Fetching news...');
      const newsData = await getNews();
      console.log('News data:', newsData);
      setNewsItems(newsData || []);
      
      // Fetch counties from production API
      try {
        const response = await fetch(`${API_BASE_URL}/api/counties/`);
        const countyData = await response.json();
        console.log('Counties data:', countyData);
        setCounties(countyData.results || countyData || []);
      } catch (err) {
        console.error('Error fetching counties:', err);
      }

      // Fetch institutions from production API
      try {
        const response = await fetch(`${API_BASE_URL}/api/institutions/`);
        const instData = await response.json();
        console.log('Institutions data:', instData);
        setInstitutions(instData.results || instData || []);
      } catch (err) {
        console.error('Error fetching institutions:', err);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, featured_image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      county: '',
      institution: '',
      featured_image: null,
      video_url: '',
      is_published: true,
    });
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        await updateNews(editingId, data);
        alert('News updated successfully!');
      } else {
        await createNews(data);
        alert('News created successfully!');
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error saving news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      category: item.category || 'general',
      county: item.county || '',
      institution: item.institution || '',
      featured_image: null,
      video_url: item.video_url || '',
      is_published: item.is_published !== undefined ? item.is_published : true,
    });
    // FIX: Use production URL for image preview
    setImagePreview(item.featured_image ? `${API_BASE_URL}${item.featured_image}` : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        await deleteNews(id);
        await loadData();
        alert('News deleted.');
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error deleting news.');
      }
    }
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      const data = { is_published: !currentStatus };
      await updateNews(id, data);
      await loadData();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Error updating news status.');
    }
  };

  const getCategoryLabel = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  const getCountyName = (countyId) => {
    const found = counties.find(c => c.id === countyId);
    return found ? found.name : 'All Counties';
  };

  const getInstitutionName = (instId) => {
    const found = institutions.find(i => i.id === instId);
    return found ? found.name : '';
  };

  // Filter news
  const filteredNews = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || 
                          (filterStatus === 'published' && item.is_published) ||
                          (filterStatus === 'draft' && !item.is_published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && !showForm) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
    );
  }

  return (
    <div className="news-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>📰 News Management</h1>
          <p className="subtitle">Create and manage news articles, announcements, and updates</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <span className="btn-icon">+</span> Add News
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{newsItems.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item published-stat">
          <span className="stat-number">{newsItems.filter(n => n.is_published).length}</span>
          <span className="stat-label">📤 Published</span>
        </div>
        <div className="stat-item draft-stat">
          <span className="stat-number">{newsItems.filter(n => !n.is_published).length}</span>
          <span className="stat-label">📝 Drafts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterCategory('');
            setFilterStatus('');
          }}
          className="btn-clear"
        >
          Clear
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-modal" onClick={(e) => {
          if (e.target === e.currentTarget) resetForm();
        }}>
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingId ? '✏️ Edit News' : '➕ Add News'}</h2>
              <button onClick={resetForm} className="close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter news title..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Content <span className="required">*</span></label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Write your news article content here..."
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>County (Optional)</label>
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                  >
                    <option value="">All Counties</option>
                    {counties.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Related Institution (Optional)</label>
                  <select
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                  >
                    <option value="">None</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Featured Image</label>
                  <input
                    type="file"
                    name="featured_image"
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                  />
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, featured_image: null });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Video URL</label>
                  <input
                    type="url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                    />
                    <span>📤 Published <span className="checkbox-hint">(Visible to public)</span></span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? '✅ Update' : '➕ Create'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News List */}
      <div className="news-list">
        {filteredNews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No news articles found</h3>
            <p>
              {searchTerm || filterCategory || filterStatus
                ? 'Try adjusting your filters or search terms'
                : 'Start by creating your first news article using the "Add News" button'}
            </p>
          </div>
        ) : (
          <div className="news-grid">
            {filteredNews.map(item => (
              <div key={item.id} className={`news-card ${!item.is_published ? 'draft' : ''}`}>
                <div className="news-image">
                  {item.featured_image ? (
                    <img
                      src={`${API_BASE_URL}${item.featured_image}`}
                      alt={item.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="no-image">📰</div>';
                      }}
                    />
                  ) : (
                    <div className="no-image">📰</div>
                  )}
                  {item.video_url && (
                    <span className="video-badge">🎬 Video</span>
                  )}
                </div>

                <div className="news-content">
                  <div className="news-header">
                    <div className="news-meta">
                      <span className="category-tag">{getCategoryLabel(item.category)}</span>
                      {item.county && (
                        <span className="county-tag">📍 {getCountyName(item.county)}</span>
                      )}
                      <span className="date-tag">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="status-badge">
                      {item.is_published ? (
                        <span className="badge published">📤 Published</span>
                      ) : (
                        <span className="badge draft">📝 Draft</span>
                      )}
                    </div>
                  </div>

                  <h3>{item.title}</h3>
                  <p className="news-excerpt">
                    {item.content.substring(0, 150)}
                    {item.content.length > 150 && '...'}
                  </p>

                  {item.institution && (
                    <div className="related-institution">
                      🏛️ Related: {getInstitutionName(item.institution)}
                    </div>
                  )}

                  <div className="news-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-edit"
                      title="Edit"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => togglePublish(item.id, item.is_published)}
                      className={`btn-toggle ${item.is_published ? 'unpublish' : 'publish'}`}
                    >
                      {item.is_published ? '📥 Unpublish' : '📤 Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;