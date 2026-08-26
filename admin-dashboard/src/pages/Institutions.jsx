import React, { useState, useEffect, useRef } from 'react';
import {
  getInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from '../services/api';
import './Institutions.css';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCounty, setFilterCounty] = useState('');
  const [counties, setCounties] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // Production API URL
  const API_BASE_URL = 'https://connect-lib.onrender.com';

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    county: '',
    district: '',
    address: '',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    description: '',
    services: '',
    opening_hours: '',
    latitude: '',
    longitude: '',
    cover_image: null,
    video_url: '',
    gallery_images: [],
    is_verified: false,
    is_featured: false,
  });

  const categories = [
    { value: 'hospital', label: '🏥 Hospital / Clinic' },
    { value: 'school', label: '📚 School / University' },
    { value: 'government', label: '🏛️ Government Office' },
    { value: 'business', label: '💼 Business / Shop' },
    { value: 'bank', label: '🏦 Bank / Financial' },
    { value: 'hotel', label: '🏨 Hotel / Guesthouse' },
    { value: 'ngo', label: '🤝 NGO / Non-profit' },
    { value: 'market', label: '🛒 Market / Mall' },
    { value: 'restaurant', label: '🍽️ Restaurant / Cafe' },
    { value: 'church', label: '⛪ Church / Mosque' },
    { value: 'protected_areas', label: '🌿 Protected Areas' },
    { value: 'park', label: '🌳 Park' },
    { value: 'other', label: '📌 Other' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // ============ LOAD DATA ============
  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Fetching institutions...');
      const instData = await getInstitutions();
      console.log('Institutions data:', instData);
      setInstitutions(instData || []);
      
      // Fetch counties from production API
      try {
        const response = await fetch(`${API_BASE_URL}/api/counties/`);
        const countyData = await response.json();
        console.log('Counties data:', countyData);
        setCounties(countyData.results || countyData || []);
      } catch (err) {
        console.error('Error fetching counties:', err);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please check your connection.');
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
      setFormData({ ...formData, cover_image: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, gallery_images: files });
    
    // Preview images
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        previews.push(event.target.result);
        if (previews.length === files.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, video_url: url });
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      setVideoPreview(`https://www.youtube.com/embed/${videoId}`);
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      setVideoPreview(`https://www.youtube.com/embed/${videoId}`);
    } else if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
      setVideoPreview(`https://player.vimeo.com/video/${videoId}`);
    } else {
      setVideoPreview('');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'other',
      county: '',
      district: '',
      address: '',
      phone: '',
      phone2: '',
      email: '',
      website: '',
      description: '',
      services: '',
      opening_hours: '',
      latitude: '',
      longitude: '',
      cover_image: null,
      video_url: '',
      gallery_images: [],
      is_verified: false,
      is_featured: false,
    });
    setImagePreview(null);
    setVideoPreview('');
    setGalleryPreviews([]);
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
        if (key === 'gallery_images') {
          formData.gallery_images.forEach(file => {
            data.append('gallery_images', file);
          });
        } else if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      if (editingId) {
        await updateInstitution(editingId, data);
        alert('Institution updated successfully!');
      } else {
        await createInstitution(data);
        alert('Institution created successfully!');
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving institution:', error);
      alert('Error saving institution. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (institution) => {
    setEditingId(institution.id);
    setFormData({
      name: institution.name || '',
      category: institution.category || 'other',
      county: institution.county || '',
      district: institution.district || '',
      address: institution.address || '',
      phone: institution.phone || '',
      phone2: institution.phone2 || '',
      email: institution.email || '',
      website: institution.website || '',
      description: institution.description || '',
      services: institution.services || '',
      opening_hours: institution.opening_hours || '',
      latitude: institution.latitude || '',
      longitude: institution.longitude || '',
      cover_image: null,
      video_url: institution.video_url || '',
      gallery_images: [],
      is_verified: institution.is_verified || false,
      is_featured: institution.is_featured || false,
    });
    setImagePreview(institution.cover_image ? `${API_BASE_URL}${institution.cover_image}` : null);
    setVideoPreview('');
    setGalleryPreviews([]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution? This action cannot be undone.')) {
      try {
        await deleteInstitution(id);
        await loadData();
        alert('Institution deleted successfully.');
      } catch (error) {
        console.error('Error deleting institution:', error);
        alert('Error deleting institution. Please try again.');
      }
    }
  };

  const getCategoryLabel = (category) => {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  };

  const getCountyName = (countyId) => {
    const found = counties.find(c => c.id === countyId);
    return found ? found.name : countyId;
  };

  // Filter institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inst.address && inst.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || inst.category === filterCategory;
    const matchesCounty = !filterCounty || inst.county === parseInt(filterCounty);
    return matchesSearch && matchesCategory && matchesCounty;
  });

  if (loading && !showForm) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading institutions...</p>
      </div>
    );
  }

  return (
    <div className="institutions-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>🏛️ Institutions Management</h1>
          <p className="subtitle">Manage all institutions, organizations, and businesses in Liberia</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <span className="btn-icon">+</span> Add New Institution
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{institutions.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{institutions.filter(i => i.is_verified).length}</span>
          <span className="stat-label">Verified</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{institutions.filter(i => i.is_featured).length}</span>
          <span className="stat-label">Featured</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{new Set(institutions.map(i => i.category)).size}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{new Set(institutions.map(i => i.county)).size}</span>
          <span className="stat-label">Counties</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search institutions..."
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
          value={filterCounty}
          onChange={(e) => setFilterCounty(e.target.value)}
          className="filter-select"
        >
          <option value="">All Counties</option>
          {counties.map(county => (
            <option key={county.id} value={county.id}>{county.name}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterCategory('');
            setFilterCounty('');
          }}
          className="btn-clear"
        >
          Clear Filters
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="form-modal" onClick={(e) => {
          if (e.target === e.currentTarget) resetForm();
        }}>
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingId ? '✏️ Edit Institution' : '➕ Add New Institution'}</h2>
              <button onClick={resetForm} className="close-btn" title="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-group full-width">
                  <label>Institution Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John F. Kennedy Medical Center"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category <span className="required">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>County <span className="required">*</span></label>
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select County</option>
                    {counties.map(county => (
                      <option key={county.id} value={county.id}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>District / Area</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="e.g., Sinkor, ELWA"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>

                {/* Contact Information */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+231 888 555 555"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number 2</label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={handleInputChange}
                    placeholder="Alternate phone"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@institution.com"
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.institution.com"
                  />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe the institution, its history, and what it does..."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Services Offered</label>
                  <textarea
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="List services separated by commas: Emergency care, Surgery, Maternity..."
                  />
                </div>

                <div className="form-group">
                  <label>Opening Hours</label>
                  <input
                    type="text"
                    name="opening_hours"
                    value={formData.opening_hours}
                    onChange={handleInputChange}
                    placeholder="Mon-Fri 8am-6pm, Sat 9am-2pm"
                  />
                </div>

                {/* Media Uploads */}
                <div className="form-group">
                  <label>Cover Image</label>
                  <input
                    type="file"
                    name="cover_image"
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
                          setFormData({ ...formData, cover_image: null });
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Gallery Images (Multiple)</label>
                  <input
                    type="file"
                    name="gallery_images"
                    onChange={handleGalleryChange}
                    accept="image/*"
                    multiple
                  />
                  {galleryPreviews.length > 0 && (
                    <div className="gallery-preview-grid">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="gallery-preview-item">
                          <img src={preview} alt={`Gallery ${index + 1}`} />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="remove-gallery"
                        onClick={() => {
                          setGalleryPreviews([]);
                          setFormData({ ...formData, gallery_images: [] });
                        }}
                      >
                        Clear All
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
                    onChange={handleVideoChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {videoPreview && (
                    <div className="video-preview-container">
                      <iframe
                        src={videoPreview}
                        title="Video Preview"
                        className="video-preview"
                        allowFullScreen
                      />
                      <button
                        type="button"
                        className="remove-video"
                        onClick={() => {
                          setVideoPreview('');
                          setFormData({ ...formData, video_url: '' });
                        }}
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="6.3135"
                  />
                </div>

                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="-10.8014"
                  />
                </div>

                {/* Status */}
                <div className="form-group full-width checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_verified"
                      checked={formData.is_verified}
                      onChange={handleInputChange}
                    />
                    <span>✅ Verified <span className="checkbox-hint">(Trusted source)</span></span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    <span>⭐ Featured <span className="checkbox-hint">(Highlight on homepage)</span></span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? '✅ Update Institution' : '➕ Create Institution'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institutions Table */}
      <div className="institutions-list">
        <div className="table-header">
          <span className="result-count">{filteredInstitutions.length} institutions found</span>
          <span className="table-actions">
            <button onClick={loadData} className="btn-refresh" title="Refresh data">🔄 Refresh</button>
          </span>
        </div>

        <div className="table-container">
          {filteredInstitutions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No institutions found</h3>
              <p>
                {searchTerm || filterCategory || filterCounty
                  ? 'Try adjusting your filters or search terms'
                  : 'Start by adding your first institution using the "Add New Institution" button'}
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>County</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstitutions.map(inst => (
                  <tr key={inst.id} className={inst.is_featured ? 'featured-row' : ''}>
                    <td>
                      <div className="institution-name">
                        {inst.cover_image && (
                          <img
                            src={`${API_BASE_URL}${inst.cover_image}`}
                            alt={inst.name}
                            className="thumbnail"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div>
                          <strong>{inst.name}</strong>
                          {inst.is_featured && <span className="featured-badge">⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td>{getCategoryLabel(inst.category)}</td>
                    <td>{getCountyName(inst.county)}</td>
                    <td>
                      {inst.phone && <div className="contact-item">📞 {inst.phone}</div>}
                      {inst.email && <div className="contact-item">✉️ {inst.email}</div>}
                    </td>
                    <td>
                      {inst.is_verified ? (
                        <span className="badge verified">✅ Verified</span>
                      ) : (
                        <span className="badge unverified">⏳ Unverified</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(inst)}
                          className="btn-edit"
                          title="Edit Institution"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id)}
                          className="btn-delete"
                          title="Delete Institution"
                        >
                          🗑️
                        </button>
                        {inst.video_url && (
                          <span className="video-indicator" title="Has video">🎬</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Institutions;