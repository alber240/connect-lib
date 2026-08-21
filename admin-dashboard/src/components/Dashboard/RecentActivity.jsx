import React from 'react';
import './Dashboard.css';

const RecentActivity = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="recent-activity">
      <h3>Recent Institutions</h3>
      <ul>
        {stats.recent_institutions?.map((inst) => (
          <li key={inst.id}>
            <span className="activity-name">{inst.name}</span>
            <span className="activity-time">{new Date(inst.created_at).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: 20 }}>Recent Suggestions</h3>
      <ul>
        {stats.recent_suggestions?.map((sug) => (
          <li key={sug.id}>
            <span className="activity-name">{sug.institution_name}</span>
            <span className={`activity-status ${sug.status}`}>{sug.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;