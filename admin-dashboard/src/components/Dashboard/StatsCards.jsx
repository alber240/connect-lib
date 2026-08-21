import React from 'react';
import './Dashboard.css';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    { title: 'Total Institutions', value: stats.total_institutions, icon: '🏛️' },
    { title: 'Verified', value: stats.verified_institutions, icon: '✅' },
    { title: 'Suggestions', value: stats.total_suggestions, icon: '💡' },
    { title: 'Pending Suggestions', value: stats.pending_suggestions, icon: '⏳' },
    { title: 'News Articles', value: stats.total_news, icon: '📰' },
    { title: 'Counties', value: stats.total_counties, icon: '🗺️' },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div key={index} className="stat-card">
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{card.value}</div>
            <div className="stat-title">{card.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;