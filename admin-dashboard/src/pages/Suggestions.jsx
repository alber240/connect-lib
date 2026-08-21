import React, { useState, useEffect, useCallback } from 'react';
import { 
  getSuggestions, 
  approveSuggestion, 
  rejectSuggestion,
  deleteSuggestion 
} from '../services/api';
import './Suggestions.css';

const Suggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    duplicate: 0,
  });

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuggestions(filter === 'all' ? '' : filter);
      setSuggestions(data || []);
      
      // Calculate stats
      const allData = await getSuggestions('');
      const statsData = {
        total: allData.length,
        pending: allData.filter(s => s.status === 'pending').length,
        approved: allData.filter(s => s.status === 'approved').length,
        rejected: allData.filter(s => s.status === 'rejected').length,
        duplicate: allData.filter(s => s.status === 'duplicate').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      alert('Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleApprove = async (id) => {
    const notes = prompt('Enter any notes for this approval (optional):');
    if (notes === null) return;
    
    try {
      await approveSuggestion(id, notes);
      alert('Suggestion approved successfully!');
      await loadSuggestions();
    } catch (error) {
      console.error('Error approving suggestion:', error);
      alert('Error approving suggestion. Please try again.');
    }
  };

  const handleReject = async (id) => {
    const notes = prompt('Enter reason for rejection:');
    if (notes === null) return;
    
    try {
      await rejectSuggestion(id, notes);
      alert('Suggestion rejected.');
      await loadSuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      alert('Error rejecting suggestion. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteSuggestion(id);
      alert('Suggestion deleted.');
      await loadSuggestions();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      alert('Error deleting suggestion. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': <span className="badge pending">⏳ Pending</span>,
      'approved': <span className="badge approved">✅ Approved</span>,
      'rejected': <span className="badge rejected">❌ Rejected</span>,
      'duplicate': <span className="badge duplicate">🔄 Duplicate</span>,
    };
    return badges[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'add': '➕ Add New',
      'update': '✏️ Update',
      'remove': '🗑️ Remove',
    };
    return labels[type] || type;
  };

  // Filter by search term
  const filteredSuggestions = suggestions.filter(s => {
    const search = searchTerm.toLowerCase();
    return s.institution_name.toLowerCase().includes(search) ||
           s.new_info.toLowerCase().includes(search) ||
           (s.suggester_name && s.suggester_name.toLowerCase().includes(search));
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="suggestions-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>💡 Suggestions Management</h1>
          <p className="subtitle">Review and manage user-submitted suggestions for new or updated institutions</p>
        </div>
        <button onClick={loadSuggestions} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item pending-stat">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">⏳ Pending</span>
        </div>
        <div className="stat-item approved-stat">
          <span className="stat-number">{stats.approved}</span>
          <span className="stat-label">✅ Approved</span>
        </div>
        <div className="stat-item rejected-stat">
          <span className="stat-number">{stats.rejected}</span>
          <span className="stat-label">❌ Rejected</span>
        </div>
        <div className="stat-item duplicate-stat">
          <span className="stat-number">{stats.duplicate}</span>
          <span className="stat-label">🔄 Duplicate</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-buttons">
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending
            {stats.pending > 0 && <span className="count-badge">{stats.pending}</span>}
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            ✅ Approved
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            ❌ Rejected
          </button>
          <button
            className={filter === 'duplicate' ? 'active' : ''}
            onClick={() => setFilter('duplicate')}
          >
            🔄 Duplicate
          </button>
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            📋 All
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search suggestions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No {filter} suggestions found</h3>
          <p>When users submit suggestions, they will appear here for review.</p>
        </div>
      ) : (
        <div className="suggestions-grid">
          {filteredSuggestions.map(suggestion => (
            <div 
              key={suggestion.id} 
              className={`suggestion-card ${suggestion.status}`}
              onClick={() => {
                setSelectedSuggestion(suggestion);
                setShowDetailModal(true);
              }}
            >
              <div className="suggestion-header">
                <h3>{suggestion.institution_name}</h3>
                {getStatusBadge(suggestion.status)}
              </div>

              <div className="suggestion-meta">
                <span className="meta-tag">{getTypeLabel(suggestion.suggestion_type)}</span>
                <span className="meta-tag">
                  {suggestion.suggester_name || 'Anonymous'}
                </span>
                <span className="meta-tag">
                  {new Date(suggestion.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="suggestion-preview">
                <strong>Suggested changes:</strong>
                <p>{suggestion.new_info.substring(0, 100)}
                  {suggestion.new_info.length > 100 && '...'}
                </p>
              </div>

              {suggestion.status === 'pending' && (
                <div className="suggestion-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleApprove(suggestion.id)} 
                    className="btn-approve"
                    title="Approve this suggestion"
                  >
                    ✅ Approve
                  </button>
                  <button 
                    onClick={() => handleReject(suggestion.id)} 
                    className="btn-reject"
                    title="Reject this suggestion"
                  >
                    ❌ Reject
                  </button>
                  <button 
                    onClick={() => handleDelete(suggestion.id)} 
                    className="btn-delete-sm"
                    title="Delete this suggestion"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {suggestion.status !== 'pending' && (
                <div className="suggestion-actions" onClick={(e) => e.stopPropagation()}>
                  {suggestion.admin_notes && (
                    <span className="admin-notes">📝 {suggestion.admin_notes}</span>
                  )}
                  <button 
                    onClick={() => handleDelete(suggestion.id)} 
                    className="btn-delete-sm"
                    title="Delete this suggestion"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSuggestion && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Suggestion Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <label>Institution Name</label>
                <p className="detail-value">{selectedSuggestion.institution_name}</p>
              </div>

              <div className="detail-row">
                <label>Type</label>
                <p className="detail-value">{getTypeLabel(selectedSuggestion.suggestion_type)}</p>
              </div>

              <div className="detail-row">
                <label>Status</label>
                <p className="detail-value">{getStatusBadge(selectedSuggestion.status)}</p>
              </div>

              {selectedSuggestion.current_info && (
                <div className="detail-row">
                  <label>Current Information</label>
                  <div className="detail-box current">
                    <p>{selectedSuggestion.current_info}</p>
                  </div>
                </div>
              )}

              <div className="detail-row">
                <label>Suggested Changes</label>
                <div className="detail-box suggested">
                  <p>{selectedSuggestion.new_info}</p>
                </div>
              </div>

              <div className="detail-row">
                <label>Submitted By</label>
                <p className="detail-value">
                  {selectedSuggestion.suggester_name || 'Anonymous'}
                  {selectedSuggestion.suggester_email && (
                    <span className="email-link"> ({selectedSuggestion.suggester_email})</span>
                  )}
                  {selectedSuggestion.suggester_phone && (
                    <span className="phone-link"> 📞 {selectedSuggestion.suggester_phone}</span>
                  )}
                </p>
              </div>

              <div className="detail-row">
                <label>Submitted On</label>
                <p className="detail-value">
                  {new Date(selectedSuggestion.created_at).toLocaleString()}
                </p>
              </div>

              {selectedSuggestion.admin_notes && (
                <div className="detail-row">
                  <label>Admin Notes</label>
                  <div className="detail-box admin-notes-box">
                    <p>{selectedSuggestion.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedSuggestion.status === 'pending' && (
              <div className="modal-footer">
                <button 
                  onClick={() => {
                    handleApprove(selectedSuggestion.id);
                    setShowDetailModal(false);
                  }} 
                  className="btn-approve"
                >
                  ✅ Approve
                </button>
                <button 
                  onClick={() => {
                    handleReject(selectedSuggestion.id);
                    setShowDetailModal(false);
                  }} 
                  className="btn-reject"
                >
                  ❌ Reject
                </button>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            )}

            {selectedSuggestion.status !== 'pending' && (
              <div className="modal-footer">
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Suggestions;