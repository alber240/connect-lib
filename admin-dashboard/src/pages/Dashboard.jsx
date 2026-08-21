import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import StatsCards from '../components/Dashboard/StatsCards';
import Charts from '../components/Dashboard/Charts';
import RecentActivity from '../components/Dashboard/RecentActivity';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <StatsCards stats={stats} />
      <div className="dashboard-grid">
        <div className="chart-section">
          <Charts stats={stats} />
        </div>
        <div className="activity-section">
          <RecentActivity stats={stats} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;